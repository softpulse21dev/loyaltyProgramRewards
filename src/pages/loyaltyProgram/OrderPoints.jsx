import { Badge, BlockStack, Box, Card, Grid, InlineGrid, Layout, Page, RadioButton, SkeletonBodyText, SkeletonDisplayText, SkeletonPage, Text, TextField } from '@shopify/polaris'
import { useEffect, useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchData } from '../../action';
import { NoLeadingZero } from '../../utils';

const OrderPoints = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const { rule: locationRule, edit: locationEdit } = location.state || {};

    // Safely parse localStorage data
    const storedEditData = localStorage.getItem('loyaltyEditData');
    const parsedStoredData = storedEditData ? JSON.parse(storedEditData) : null;
    const { rule_id: storedRuleId, edit: storedEdit, rule_type: storedRuleType } = parsedStoredData || {};

    // Create rule state: use locationRule if available, otherwise construct from stored data
    const [rule, setRule] = useState(() => {
        if (locationRule) return locationRule;
        // On page reload, construct minimal rule object from stored data
        if (storedRuleId && storedRuleType) {
            return {
                rule_id: storedRuleId,
                type: storedRuleType
            };
        }
        return null;
    });

    const edit = locationEdit !== undefined ? locationEdit : storedEdit;
    const ruleId = rule?.rule_id || storedRuleId;

    // Update rule when locationRule becomes available
    useEffect(() => {
        if (locationRule) {
            setRule(locationRule);
            // Store rule_type for page reload persistence
            localStorage.setItem('loyaltyEditData', JSON.stringify({
                rule_id: locationRule.rule_id,
                rule_type: locationRule.type,
                edit: false
            }));
        }
    }, [locationRule]);

    const [getdatabyID, setGetdatabyID] = useState();
    const [orderPointsMethod, setOrderPointsMethod] = useState('multiplier');
    const [earningPoints, setEarningPoints] = useState("");
    const [moneySpent, setMoneySpent] = useState("");
    const [status, setStatus] = useState(false);
    const [hasCalledAPI, setHasCalledAPI] = useState(false);

    const getRuleByIdAPI = useCallback(async (ruleId) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("rule_id", ruleId);
            const response = await fetchData("/get-merchant-earning-rules-by-id", formData);
            if (response?.data) {
                setGetdatabyID(response.data);
                setEarningPoints(response.data.points ?? response.data.default_points ?? 0);
                setStatus(response.data.status ?? false);
                setMoneySpent(response.data.condition_json?.order_spent);
                // Set order earning method from condition_json if available
                if (response.data.condition_json?.order_earning_method) {
                    setOrderPointsMethod(response.data.condition_json.order_earning_method);
                }

                // Save rule_id and rule_type to localStorage for persistence
                localStorage.setItem('loyaltyEditData', JSON.stringify({
                    rule_id: ruleId,
                    rule_type: response.data.type,
                    edit: true
                }));

                // Update rule with type from fetched data if rule is not from locationRule
                setRule(prev => ({
                    ...(prev || {}),
                    type: response.data.type,
                    rule_id: response.data.rule_id,
                    master_rule_id: response.data.master_rule_id || prev?.master_rule_id
                }));

                console.log("Rule Details", response.data);
            }
        } catch (error) {
            console.error('Get Rule By Id Error', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (edit) {
            if (ruleId && !getdatabyID && !hasCalledAPI) {
                // Only call API once if we don't already have the data
                setHasCalledAPI(true);
                getRuleByIdAPI(ruleId);
            }
        } else {
            // For non-edit mode, if we have rule data, set initial values
            if (rule && rule.points !== undefined) {
                setEarningPoints(rule.points ?? rule.default_points ?? 0);
                setStatus(rule.status ?? false);
            }
        }
    }, [edit, ruleId, getdatabyID, hasCalledAPI, rule, getRuleByIdAPI]);

    const handleStatusChange = () => {
        setStatus(prev => prev === true ? false : true);
    };

    // UPDATED FUNCTION
    const handleUpdateRuleAPI = async () => {
        // Use fallback for rule_id and master_rule_id
        const idToUse = rule?.rule_id || getdatabyID?.rule_id || ruleId;
        const masterRuleIdToUse = rule?.master_rule_id || getdatabyID?.master_rule_id;

        if (!idToUse || !masterRuleIdToUse) {
            shopify.toast.show('Rule data is missing. Please refresh the page.', { duration: 2000, isError: true });
            return;
        }

        setSaveLoading(true);
        try {
            const formData = new FormData();
            formData.append("rule_id", idToUse);
            formData.append("master_rule_id", masterRuleIdToUse);
            formData.append("points", earningPoints || 0);
            formData.append("status", status);
            const conditionalData = {
                order_earning_method: orderPointsMethod,
                order_spent: moneySpent,
            };
            formData.append("condition_json", JSON.stringify(conditionalData));

            const response = await fetchData("/update-merchant-earning-rules", formData);
            if (response?.status) {
                // Clear localStorage on successful update
                localStorage.removeItem('loyaltyEditData');
                navigate('/loyaltyProgram');
                shopify.toast.show(response?.message, { duration: 2000 });
            } else {
                shopify.toast.show(response?.message, { duration: 2000, isError: true });
            }
        } catch (error) {
            console.error('Update Rule By Id Error', error);
        } finally {
            setSaveLoading(false);
        }
    };


    return (
        <>
            {loading ? (
                <SkeletonPage
                    primaryAction={{ content: <SkeletonDisplayText size="small" /> }}
                >

                    <InlineGrid columns={['twoThirds', 'oneThird']} gap={400} >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <Card>
                                <SkeletonBodyText lines={5} />
                            </Card>
                            <Card>
                                <SkeletonBodyText lines={3} />
                            </Card>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <Card>
                                <SkeletonBodyText lines={4} />
                            </Card>
                            <Card>
                                <SkeletonBodyText lines={3} />
                            </Card>
                        </div>
                    </InlineGrid>
                </SkeletonPage>
            ) : (
                <Page
                    backAction={{
                        content: 'Back',
                        onAction: () => {
                            // Clear localStorage when navigating back
                            localStorage.removeItem('loyaltyEditData');
                            navigate('/loyaltyProgram');
                        }
                    }}
                    title={
                        <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                            <Text as='h1' variant='headingLg'>{getdatabyID?.title || "Order Points"}</Text>
                            <Badge tone={status === true ? "success" : "critical"}>
                                {status === true ? "Active" : "Inactive"}
                            </Badge>
                        </Box>
                    }
                    primaryAction={{
                        content: edit ? "Update" : "Save",
                        loading: saveLoading,
                        onAction: handleUpdateRuleAPI
                    }}
                    secondaryActions={
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={status === true}
                                onChange={handleStatusChange}
                            />
                            <span className="slider"></span>
                        </label>
                    }
                >
                    <Layout>
                        <Layout.Section>
                            <Grid>
                                <Grid.Cell columnSpan={{ xs: 6, sm: 4, md: 4, lg: 8, xl: 8 }}>
                                    <BlockStack gap={400}>
                                        {/* Earning Method */}
                                        <Card>
                                            <Text variant="headingMd">Earning Method</Text>
                                            <BlockStack>
                                                <RadioButton
                                                    label="Incremented points"
                                                    checked={orderPointsMethod === 'multiplier'}
                                                    onChange={() => setOrderPointsMethod('multiplier')}
                                                />
                                                <RadioButton
                                                    label="Fixed points"
                                                    checked={orderPointsMethod === 'fixed'}
                                                    onChange={() => setOrderPointsMethod('fixed')}
                                                />
                                            </BlockStack>
                                        </Card>

                                        {/* Points Config */}
                                        <Card>
                                            <BlockStack gap={400}>
                                                <Text variant="headingMd">Earning Points</Text>
                                                <Box style={{ display: orderPointsMethod === 'multiplier' ? 'flex' : 'block', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <TextField
                                                        label=""
                                                        type="text"
                                                        value={earningPoints}
                                                        onChange={(value) => setEarningPoints(NoLeadingZero(value))}
                                                        suffix="Points"
                                                    />
                                                    {orderPointsMethod === 'multiplier' && (
                                                        <>
                                                            <Text variant="headingMd">=</Text>
                                                            <TextField
                                                                label=""
                                                                type="text"
                                                                value={moneySpent}
                                                                onChange={(value) => setMoneySpent(NoLeadingZero(value))}
                                                                prefix="₹"
                                                                suffix="spent"
                                                            />
                                                        </>
                                                    )}
                                                </Box>
                                                {orderPointsMethod === 'multiplier' && (
                                                    <Text alignment="center" variant="bodyMd">
                                                        Configure how customers earn points
                                                    </Text>
                                                )}
                                            </BlockStack>
                                        </Card>
                                    </BlockStack>
                                </Grid.Cell>

                                {/* Summary & Status */}
                                <Grid.Cell columnSpan={{ xs: 6, sm: 2, md: 2, lg: 4, xl: 4 }}>
                                    <BlockStack gap={400}>
                                        <Card>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                <Text variant="headingMd" as="span" >Summary</Text>
                                                <Text>Customers earn points for every Rs. 1 spent</Text>
                                            </div>
                                            {/* <ul style={{ listStyle: "inherit", paddingInline: 20 }}>
                                                <li>Customers earn points for every Rs. 1 spent</li>
                                            </ul> */}
                                        </Card>

                                        {/* <Card>
                                            <BlockStack gap={300}>
                                                <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <Text variant='headingMd' as="span">Status</Text>
                                                    <Badge tone={status === true ? "success" : "critical"}>
                                                        {status === true ? "Active" : "Inactive"}
                                                    </Badge>
                                                </Box>
                                                <Box>
                                                    <div className="toggle-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <label className="switch">
                                                            <input
                                                                type="checkbox"
                                                                checked={status === true}
                                                                onChange={handleStatusChange}
                                                            />
                                                            <span className="slider"></span>
                                                        </label>
                                                    </div>
                                                </Box>
                                            </BlockStack>
                                        </Card> */}
                                    </BlockStack>
                                </Grid.Cell>
                            </Grid>
                        </Layout.Section>
                    </Layout>
                </Page>
            )}
        </>

    )
}

export default OrderPoints;

import { Badge, BlockStack, Box, Card, Grid, Layout, Page, RadioButton, Text, TextField } from '@shopify/polaris'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchData } from '../../action';

const OrderPoints = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { rule, edit } = location.state || {};
    const [getdatabyID, setGetdatabyID] = useState();
    const [orderPointsMethod, setOrderPointsMethod] = useState('multiplier');
    const [earningPoints, setEarningPoints] = useState("");
    const [moneySpent, setMoneySpent] = useState("");
    const [status, setStatus] = useState(false);

    const getRuleByIdAPI = async (ruleId) => {
        const formData = new FormData();
        formData.append("rule_id", ruleId);
        const response = await fetchData("/get-merchant-earning-rules-by-id", formData);
        if (response?.data) {
            setGetdatabyID(response.data);
            setEarningPoints(response.data.points ?? response.data.default_points ?? 0);
            setStatus(response.data.status ?? false);
            console.log("Rule Details", response.data);
        }
    };

    useEffect(() => {
        if (rule?.rule_id) {
            getRuleByIdAPI(rule.rule_id);
        }
    }, [rule]);

    const handleStatusChange = () => {
        setStatus(prev => prev === true ? false : true);
    };

    // UPDATED FUNCTION
    const handleUpdateRuleAPI = async () => {
        const formData = new FormData();
        formData.append("rule_id", rule.rule_id);
        formData.append("master_rule_id", rule.master_rule_id);
        formData.append("points", earningPoints || 0);
        formData.append("status", status);
        const conditionalData = {
            order_earning_method: orderPointsMethod,
            order_spent: moneySpent,
        };
        formData.append("condition_json", JSON.stringify(conditionalData));

        const response = await fetchData("/update-merchant-earning-rules", formData);
        if (response?.status) {
            navigate('/loyaltyProgram');
            shopify.toast.show(response?.message, { duration: 2000 });
        } else {
            shopify.toast.show(response?.message, { duration: 2000 });
        }
    };


    return (
        <Page
            backAction={{ content: 'Back', onAction: () => navigate('/loyaltyProgram') }}
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
                onAction: handleUpdateRuleAPI
            }}
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
                                                type="number"
                                                value={earningPoints}
                                                onChange={(value) => setEarningPoints(value)}
                                                suffix="Points"
                                            />
                                            {orderPointsMethod === 'multiplier' && (
                                                <>
                                                    <Text variant="headingMd">=</Text>
                                                    <TextField
                                                        label=""
                                                        type="number"
                                                        value={moneySpent}
                                                        onChange={(value) => setMoneySpent(value)}
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
                                    <Text variant="headingMd" as="span" >Summary</Text>
                                    <ul style={{ listStyle: "inherit", paddingInline: 20 }}>
                                        <li>Customers earn points for every Rs. 1 spent</li>
                                    </ul>
                                </Card>

                                <Card>
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
                                </Card>
                            </BlockStack>
                        </Grid.Cell>
                    </Grid>
                </Layout.Section>
            </Layout>
        </Page>
    )
}

export default OrderPoints;

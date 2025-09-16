import { Badge, BlockStack, Box, Card, Grid, Layout, Page, RadioButton, Text, TextField } from '@shopify/polaris'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchData } from '../../action';

const OrderPoints = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { rule, edit } = location.state || {};
    console.log('rule', rule)

    const [pageTitle, setPageTitle] = useState("Order Points");
    const [orderPointsMethod, setOrderPointsMethod] = useState('incremented');
    const [earningPoints, setEarningPoints] = useState();
    const [moneySpent, setMoneySpent] = useState();
    const [status, setStatus] = useState("inactive");

    const [getdatabyID, setGetdatabyID] = useState();

    const getRuleByIdAPI = async (ruleId) => {
        const formData = new FormData();
        formData.append("rule_id", ruleId);
        const response = await fetchData("/get-merchant-earning-rules-by-id?Y6vg3RZzOZz7a9W", formData);
        if (response?.data) {
            setGetdatabyID(response.data);
            console.log('Get Rule ID by order points', response);
        }
    };
    useEffect(() => {
        getRuleByIdAPI(rule.rule_id);
        if (rule) {
            setPageTitle(rule.title || "Order Points");
            const pointsValue = rule.points ?? rule.default_points ?? 0;
            setEarningPoints(pointsValue);
            setStatus(rule.status ?? "inactive");
        }
    }, [rule]);

    const handleStatusChange = () => {
        setStatus(prevStatus => prevStatus === 'active' ? 'inactive' : 'active');
    };

    return (
        <Page
            backAction={{ content: 'Back', onAction: () => navigate('/loyaltyProgram') }}
            title={
                <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                    <Text as='h1' variant='headingLg'>{pageTitle}</Text>
                    <Badge tone={status === "active" ? "success" : "critical"}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                </Box>
            }
            primaryAction={{ content: edit ? "Update" : "Save", onAction: () => { } }}
        >
            <Layout>
                <Layout.Section>
                    <Grid>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 4, md: 4, lg: 8, xl: 8 }}>
                            <BlockStack gap={400}>
                                <Card>
                                    <Text variant="headingMd">Earning Method</Text>
                                    <BlockStack>
                                        <RadioButton
                                            label="Incremented points"
                                            checked={orderPointsMethod === 'incremented'}
                                            onChange={() => setOrderPointsMethod('incremented')}
                                        />
                                        <RadioButton
                                            label="Fixed points"
                                            checked={orderPointsMethod === 'fixed'}
                                            onChange={() => setOrderPointsMethod('fixed')}
                                        />
                                    </BlockStack>
                                </Card>

                                <Card>
                                    <BlockStack gap={400}>
                                        <Text variant="headingMd">Earning Points</Text>
                                        <Box style={{ display: orderPointsMethod === 'incremented' ? 'flex' : 'block', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <TextField
                                                label=""
                                                type="number"
                                                value={earningPoints}
                                                onChange={setEarningPoints}
                                                suffix="Points"
                                            />
                                            {orderPointsMethod === 'incremented' && (
                                                <>
                                                    <Text variant="headingMd">=</Text>
                                                    <TextField
                                                        label=""
                                                        type="number"
                                                        value={moneySpent}
                                                        onChange={setMoneySpent}
                                                        prefix="₹"
                                                        suffix="spent"
                                                    />
                                                </>
                                            )}
                                        </Box>
                                        {orderPointsMethod === 'incremented' && (
                                            <Text alignment="center" variant="bodyMd">
                                                Configure how customers earn points
                                            </Text>
                                        )}
                                    </BlockStack>
                                </Card>
                            </BlockStack>
                        </Grid.Cell>

                        <Grid.Cell columnSpan={{ xs: 6, sm: 2, md: 2, lg: 4, xl: 4 }}>
                            <BlockStack gap={400}>
                                <Card>
                                    <Text>Summary</Text>
                                    <li>Customers earn points for every Rs. 1 spent</li>
                                </Card>

                                <Card>
                                    <BlockStack gap={300}>
                                        <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <Text variant='headingMd' as="span">Status</Text>
                                            <Badge tone={status === "active" ? "success" : "critical"}>
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </Badge>
                                        </Box>
                                        <Box>
                                            <div className="toggle-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <label className="switch">
                                                    <input
                                                        type="checkbox"
                                                        checked={status === "active"}
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

export default OrderPoints

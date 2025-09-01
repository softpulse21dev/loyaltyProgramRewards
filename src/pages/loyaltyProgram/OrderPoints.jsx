import { Badge, BlockStack, Box, Card, Grid, InlineStack, Layout, Page, RadioButton, Text, TextField } from '@shopify/polaris'
import { SaveIcon } from '@shopify/polaris-icons';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const OrderPoints = ({ type, platform, master_rule_id }) => {
    const navigate = useNavigate();
    const [orderPointsMethod, setOrderPointsMethod] = useState('incremented');
    const [earningPoints, setEarningPoints] = useState();
    const [moneySpent, setMoneySpent] = useState();

    
    return (
        <Page
            backAction={{ content: 'Back', onAction: () => navigate('/loyaltyProgram') }}
            title="Order Points"
            primaryAction={{ content: 'Save', onAction: () => { } }}
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
                                            onChange={() => { setOrderPointsMethod('fixed') }}
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
                                            <Badge tone="success">Active</Badge>
                                        </Box>
                                        <Box>
                                            <div className="onoffswitch">
                                                <input
                                                    type="checkbox"
                                                    name=""
                                                    className="onoffswitch-checkbox test_mode"
                                                    id={`testMode-${''}`}
                                                    checked=""
                                                    onChange={() => ''}
                                                />
                                                <label className="onoffswitch-label" htmlFor={`testMode-${''}`}>
                                                    <span className="onoffswitch-inner onoffswitch-inner-testmode"></span>
                                                    <span className="onoffswitch-switch"></span>
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

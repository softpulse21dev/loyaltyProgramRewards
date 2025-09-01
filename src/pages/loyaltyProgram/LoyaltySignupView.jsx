import { Badge, BlockStack, Box, Button, Card, Grid, Layout, Page, Text, TextField } from '@shopify/polaris'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoyaltySignupView = () => {
    const navigate = useNavigate();
    const [earningpoints, setEarningpoints] = useState('1');

    return (
        <Page
            backAction={{ content: 'Back', onAction: () => navigate('/loyaltyProgram') }}
            title="Sign Up"
            primaryAction={{ content: 'Save', onAction: () => { } }}
        >
            <Layout>
                <Layout.Section>
                    <Grid>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 4, md: 4, lg: 8, xl: 8 }}>
                            <BlockStack gap={400}>
                                <Card>
                                    <BlockStack gap={400}>
                                        <Text variant='headingMd' as="span">Earning points</Text>
                                        <TextField
                                            value={earningpoints}
                                            type='number'
                                            onChange={(value) => setEarningpoints(value)}
                                        />
                                    </BlockStack>
                                </Card>
                            </BlockStack>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 2, md: 2, lg: 4, xl: 4 }}>
                            <BlockStack gap={400}>
                                <Card>
                                    <Text variant='headingMd' as="span">Summary</Text>
                                    <ul style={{ listStyle: 'inherit', paddingInline: 20 }}>
                                        <li><p>Customers earn points creating an account</p></li>
                                    </ul>
                                </Card>
                                <Card>
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
                                </Card>
                            </BlockStack>
                        </Grid.Cell>
                    </Grid>
                </Layout.Section>
            </Layout>
        </Page>
    )
}

export default LoyaltySignupView

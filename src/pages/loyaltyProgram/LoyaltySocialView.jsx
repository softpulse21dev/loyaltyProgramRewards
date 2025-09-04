import { Badge, BlockStack, Box, Button, Card, Grid, Layout, Page, Text, TextField } from '@shopify/polaris'
import { DeleteIcon } from '@shopify/polaris-icons';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

const LoyaltySocialView = () => {
    const navigate = useNavigate();
    const [SocialURL, setSocialURL] = useState('');
    const [earningpoints, setEarningpoints] = useState('1');


    const addEarnignRuleAPI = () => {
        const api = 'https://demo.shopiapps.in/loyalty/api/list-merchant-earning-rules';
    }

    useEffect(() => {
        addEarnignRuleAPI();
    }, []);


    return (
        <Page
            backAction={{ content: 'Back', onAction: () => navigate('/loyaltyProgram') }}
            title={
                <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                    <Text>Follow on Instagram</Text>
                    <Badge tone="success">Active</Badge>
                </Box>
            }
            secondaryActions={<Button tone='critical' icon={DeleteIcon} onAction={() => { }}>Delete</Button>}
            primaryAction={{ content: 'Save', onAction: () => { } }}
        >
            <Layout>
                <Layout.Section>
                    <Grid>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 4, md: 4, lg: 8, xl: 8 }}>
                            <BlockStack gap={400}>
                                <Card>
                                    <BlockStack gap={400}>
                                        <Text variant='headingMd' as="span">Social Settings</Text>
                                        <TextField
                                            label="Social Media Profile URL"
                                            value={SocialURL}
                                            onChange={(value) => setSocialURL(value)}
                                            maxLength={255}
                                        />
                                    </BlockStack>
                                </Card>

                                <Card>
                                    <Box style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        <Text variant='headingMd' as="span">Earning points</Text>
                                        <Box>
                                            <TextField
                                                value={earningpoints}
                                                type='number'
                                                onChange={(value) => setEarningpoints(value)}
                                            />
                                        </Box>
                                    </Box>
                                </Card>
                            </BlockStack>
                        </Grid.Cell>

                        <Grid.Cell columnSpan={{ xs: 6, sm: 2, md: 2, lg: 4, xl: 4 }}>
                            <BlockStack gap={400}>
                                <Card>
                                    <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <Text variant='headingMd' as="span">Status</Text>
                                        <Badge tone="success">Active</Badge>
                                    </Box>
                                    <Box>
                                        {/* <div className="onoffswitch">
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
                                        </div> */}

                                        <div className="toggle-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    // checked={item.active}
                                                    // id={`switch-${rule_id}`}
                                                    // onChange={(e) =>
                                                    //     handleRuleStatusChange(item.rule_id, e.target.checked)
                                                    // }
                                                />
                                                <span className="slider"></span>
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

export default LoyaltySocialView

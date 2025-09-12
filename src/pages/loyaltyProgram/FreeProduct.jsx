import { Badge, BlockStack, Box, Button, Card, Checkbox, FormLayout, Grid, Layout, Page, RadioButton, Text, TextField } from '@shopify/polaris'
import { DeleteIcon } from '@shopify/polaris-icons';
import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import RedeemModal from '../../components/RedeemModal';

const FreeProduct = () => {
    const navigate = useNavigate();
    const [rewardTitle, setRewardTitle] = useState('Free product');
    const [active, setActive] = useState(false);

    return (
        <Page
            backAction={{ content: 'Back', onAction: () => navigate('/loyaltyProgram') }}
            title="Free Product"
            secondaryActions={<Button tone='critical' icon={DeleteIcon} onAction={() => { }}>Delete</Button>}
            primaryAction={{ content: 'Save', onAction: () => { } }}
        >
            <Layout>
                <Layout.Section>
                    <Grid>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 4, md: 4, lg: 8, xl: 8 }}>
                            <BlockStack gap={400}>
                                <Card>
                                    <BlockStack gap={300}>
                                        <Text variant='headingSm' as="span">Reward Title</Text>
                                        <TextField
                                            value={rewardTitle}
                                            onChange={(value) => setRewardTitle(value)}
                                        />
                                    </BlockStack>
                                </Card>
                                <Card>
                                    <Text variant='headingMd' as="span">Reward</Text>
                                    <FormLayout>
                                        <FormLayout.Group>
                                            <TextField
                                                label="Points amount"
                                                type="number"
                                                value={100}
                                                onChange={''}
                                                autoComplete="off"
                                                suffix="points"
                                            />
                                            <TextField
                                                label="Discount"
                                                type="number"
                                                prefix="$"
                                                value={1.0}
                                                onChange={''}
                                                autoComplete="off"
                                            />

                                        </FormLayout.Group>
                                    </FormLayout>
                                </Card>
                                <Card>
                                    <Box style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        <Text variant='headingMd' as="span">Minimum Cart Requirement</Text>
                                        <BlockStack>
                                            <RadioButton
                                                label="None"
                                                checked={'disabled'}
                                                id="disabled"
                                                name="accounts"
                                                onChange={''}
                                            />
                                            <RadioButton
                                                label="Minimum cart value"
                                                id="optional"
                                                name="accounts"
                                                checked={'optional'}
                                                onChange={''}
                                            />
                                            <TextField
                                                type="number"
                                                value={''}
                                                onChange={''}
                                                helpText="Value in cents. Eg: $20 = 2000"
                                            />
                                            <RadioButton
                                                label="Minimum order quantity"
                                                id="optional"
                                                name="accounts"
                                                checked={'optional'}
                                                onChange={''}
                                            />
                                            <TextField
                                                type="number"
                                                value={''}
                                                onChange={''}
                                                helpText="Minimum number of items required in cart"
                                            />
                                        </BlockStack>
                                    </Box>
                                </Card>
                                <Card>
                                    <Box style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        <Text variant='headingMd' as="span">Purchase Type (optional)</Text>
                                        <BlockStack>
                                            <Text>Additional settings for stores that have installed any "subscription" app</Text>
                                            <RadioButton
                                                label="One-time Purchase"
                                                checked={'disabled'}
                                                id="disabled"
                                                name="accounts"
                                                onChange={''}
                                            />
                                            <RadioButton
                                                label="Subscription"
                                                id="optional"
                                                name="accounts"
                                                checked={'optional'}
                                                onChange={''}
                                            />
                                            <RadioButton
                                                label="Both"
                                                id="optional"
                                                name="accounts"
                                                checked={'optional'}
                                                onChange={''}
                                            />
                                        </BlockStack>
                                    </Box>
                                </Card>

                                <Card>
                                    <BlockStack gap={10}>
                                        <Text variant='headingMd' >Reward Expiration</Text>
                                        <TextField
                                            type="number"
                                            value={''}
                                            onChange={''}
                                            autoComplete="off"
                                            suffix="months"
                                        />
                                        <Checkbox
                                            label="Automatically refund points when reward expires"
                                            helpText="When enabled, customers will automatically receive their points back if they don't use this reward before it expires"
                                            checked={''}
                                            onChange={''}
                                        />
                                    </BlockStack>
                                </Card>

                            </BlockStack>
                        </Grid.Cell>

                        <Grid.Cell columnSpan={{ xs: 6, sm: 2, md: 2, lg: 4, xl: 4 }}>
                            <BlockStack gap={400}>
                                <Card>
                                    <Text variant='headingMd' as="span">Reward Summary</Text>
                                    <ul style={{ listStyle: 'inherit', paddingInline: 20 }}>
                                        <li><p>Applies to all orders</p></li>
                                        <li><p>Free shipping off the entire order.</p></li>
                                    </ul>
                                </Card>

                                <Card>
                                    <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <Text variant='headingMd' as="span">Status</Text>
                                        <Badge tone="critical">
                                            active
                                        </Badge>
                                    </Box>
                                    <Box>

                                        <div className="toggle-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    checked="active"
                                                    onChange={''}
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

            <RedeemModal active={active} setActive={setActive} />
        </Page>
    )
}

export default FreeProduct

import { Badge, BlockStack, Box, Button, Card, Checkbox, FormLayout, Grid, Layout, Page, RadioButton, Text, TextField } from '@shopify/polaris'
import { DeleteIcon } from '@shopify/polaris-icons';
import { useNavigate } from 'react-router-dom';

const CouponPage = () => {
    const navigate = useNavigate();

    return (
        <Page
            backAction={{ content: 'Back', onAction: () => navigate('/loyaltyProgram') }}
            title="off coupon"
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
                                        <Text variant='headingSm' as="span">Reward Title</Text>
                                        <TextField
                                            value={''}
                                            onChange={''}
                                            maxLength={255}
                                        />
                                    </BlockStack>
                                </Card>

                                <Card>
                                    <Box style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        <Text variant='headingMd' as="span">Points Type</Text>
                                        <BlockStack>
                                            <RadioButton
                                                label="Fixed amount of points"
                                                checked=""
                                                id=""
                                                name=""
                                                onChange={''}
                                            />
                                            <RadioButton
                                                label="Incremented points"
                                                id=""
                                                name=""
                                                checked=''
                                                onChange={''}
                                            />
                                        </BlockStack>
                                    </Box>
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
                                        <Text variant='headingMd' as="span">Points Type</Text>
                                        <BlockStack>
                                            <RadioButton
                                                label="None"
                                                checked=''
                                                id=""
                                                name=""
                                                onChange={''}
                                            />
                                            <RadioButton
                                                label="Minimum cart value"
                                                id=""
                                                name=""
                                                checked=''
                                                onChange={''}
                                            />
                                            <TextField
                                                type="number"
                                                value={''}
                                                onChange={''}
                                                helpText="Value in cents. Eg: $20 = 2000"
                                            />
                                        </BlockStack>
                                    </Box>
                                </Card>
                                <Card>
                                    <Box style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        <Text variant='headingMd' as="span">Apply to</Text>
                                        <BlockStack>
                                            <RadioButton
                                                label="Entire order"
                                                checked=''
                                                id=""
                                                name=""
                                                onChange={''}
                                            />
                                            <RadioButton
                                                label="Collection"
                                                id=""
                                                name=""
                                                checked=''
                                                onChange={''}
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
                                                checked=''
                                                id=""
                                                name=""
                                                onChange={''}
                                            />
                                            <RadioButton
                                                label="Subscription"
                                                id=""
                                                name=""
                                                checked=''
                                                onChange={''}
                                            />
                                            <RadioButton
                                                label="Both"
                                                id=""
                                                name=""
                                                checked=''
                                                onChange={''}
                                            />
                                        </BlockStack>
                                    </Box>
                                </Card>
                                <Card>
                                    <BlockStack gap={400}>
                                        <Text variant='headingSm' as="span">Recurring Payment Options</Text>
                                        <TextField
                                            value={''}
                                            onChange={''}
                                            helpText='The number of times a discount applies on recurring purchases. For example, if you set this field to 3, then the discount only applies to the first three billing cycles of a subscription. If you specify 0, then the discount applies indefinitely.'
                                        />
                                    </BlockStack>
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
        </Page>
    )
}

export default CouponPage

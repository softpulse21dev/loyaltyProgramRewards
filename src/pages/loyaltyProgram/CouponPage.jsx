import { Badge, BlockStack, Box, Button, Card, Checkbox, FormLayout, Grid, Layout, Page, RadioButton, Text, TextField } from '@shopify/polaris'
import { DeleteIcon } from '@shopify/polaris-icons';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CollectionModal from '../../components/CollectionModal';

const CouponPage = () => {
    const navigate = useNavigate();
    const [rewardTitle, setRewardTitle] = useState('');
    const [pointsType, setPointsType] = useState('fixed');
    const [minimumCartRequirement, setMinimumCartRequirement] = useState('none');
    const [applyTo, setApplyTo] = useState('entire');
    const [purchaseType, setPurchaseType] = useState('one_time');
    const [pointsAmount, setPointsAmount] = useState(100);
    const [discount, setDiscount] = useState(1.0);
    const [incrementPointsValue, setIncrementPointsValue] = useState(0);
    const [customerGets, setCustomerGets] = useState(0);
    const [isMinimumPointsRequired, setIsMinimumPointsRequired] = useState(false);
    const [isMaximumPointsRequired, setIsMaximumPointsRequired] = useState(false);
    const [minimumPointsRequired, setMinimumPointsRequired] = useState(0);
    const [maximumPointsRequired, setMaximumPointsRequired] = useState(0);
    const [minimumCartRequirementValue, setMinimumCartRequirementValue] = useState(0);
    const [recurringPaymentOptions, setRecurringPaymentOptions] = useState(0);
    const [rewardExpiration, setRewardExpiration] = useState(0);
    const [collectionModalOpen, setCollectionModalOpen] = useState(false);

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
                                    <BlockStack gap={300}>
                                        <Text variant='headingSm' as="span">Reward Title</Text>
                                        <TextField
                                            value={rewardTitle}
                                            onChange={(value) => setRewardTitle(value)}
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
                                                checked={pointsType === 'fixed'}
                                                onChange={() => setPointsType('fixed')}
                                            />
                                            <RadioButton
                                                label="Incremented points"
                                                checked={pointsType === 'multiplier'}
                                                onChange={() => setPointsType('multiplier')}
                                            />
                                        </BlockStack>
                                    </Box>
                                </Card>

                                <Card>
                                    <BlockStack gap={300}>
                                        <Text variant='headingMd' as="span">Reward</Text>

                                        {pointsType === 'fixed' && (
                                            <>
                                                <FormLayout>
                                                    <FormLayout.Group>
                                                        <TextField
                                                            label="Points amount"
                                                            type="number"
                                                            value={pointsAmount}
                                                            onChange={(value) => setPointsAmount(value)}
                                                            autoComplete="off"
                                                            suffix="points"
                                                        />
                                                        <TextField
                                                            label="Discount"
                                                            type="number"
                                                            prefix="$"
                                                            value={discount}
                                                            onChange={(value) => setDiscount(value)}
                                                            autoComplete="off"
                                                        />
                                                    </FormLayout.Group>
                                                </FormLayout>
                                                <Text variant='bodyMd' tone='subdued'>Based on your cost per point, {pointsAmount} points is equal to Rs. {discount}</Text>
                                            </>
                                        )}

                                        {pointsType === 'multiplier' && (
                                            <>
                                                <FormLayout>
                                                    <FormLayout.Group>
                                                        <TextField
                                                            label="Increment points value"
                                                            type="number"
                                                            value={incrementPointsValue}
                                                            onChange={(value) => setIncrementPointsValue(value)}
                                                            autoComplete="off"
                                                            suffix="points"
                                                        />
                                                        <TextField
                                                            label="Customer gets"
                                                            type="number"
                                                            prefix="$"
                                                            value={customerGets}
                                                            onChange={(value) => setCustomerGets(value)}
                                                            autoComplete="off"
                                                        />
                                                    </FormLayout.Group>
                                                </FormLayout>
                                                <Text variant='bodyMd' tone='subdued'>Based on your cost per point, {incrementPointsValue} points is equal to Rs. {customerGets}</Text>

                                                <Checkbox
                                                    label="Set a minimum amount of points required to redeem this reward"
                                                    checked={isMinimumPointsRequired}
                                                    onChange={() => setIsMinimumPointsRequired(!isMinimumPointsRequired)}
                                                />
                                                {isMinimumPointsRequired && (
                                                    <TextField
                                                        type="number"
                                                        value={minimumPointsRequired}
                                                        onChange={(value) => setMinimumPointsRequired(value)}
                                                        suffix="points"
                                                    />
                                                )}

                                                <Checkbox
                                                    label="Set a maximum amount of points required to redeem this reward"
                                                    checked={isMaximumPointsRequired}
                                                    onChange={() => setIsMaximumPointsRequired(!isMaximumPointsRequired)}
                                                />
                                                {isMaximumPointsRequired && (
                                                    <TextField
                                                        type="number"
                                                        value={maximumPointsRequired}
                                                        onChange={(value) => setMaximumPointsRequired(value)}
                                                        suffix="points"
                                                    />
                                                )}
                                            </>
                                        )}
                                    </BlockStack>
                                </Card>


                                <Card>
                                    <Box style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        <Text variant='headingMd' as="span">Minimum Cart Requirement</Text>
                                        <BlockStack>
                                            <RadioButton
                                                label="None"
                                                checked={minimumCartRequirement === 'none'}
                                                onChange={() => setMinimumCartRequirement('none')}
                                            />
                                            <RadioButton
                                                label="Minimum cart value"
                                                checked={minimumCartRequirement === 'min_purchase_amount'}
                                                onChange={() => setMinimumCartRequirement('min_purchase_amount')}
                                            />
                                            {minimumCartRequirement === 'min_purchase_amount' && (
                                                <TextField
                                                    type="number"
                                                    value={minimumCartRequirementValue}
                                                    onChange={(value) => setMinimumCartRequirementValue(value)}
                                                    helpText="Value in cents. Eg: $20 = 2000"
                                                />
                                            )}
                                        </BlockStack>
                                    </Box>
                                </Card>


                                <Card>
                                    <Box style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        <Text variant='headingMd' as="span">Apply to</Text>
                                        <BlockStack>
                                            <RadioButton
                                                label="Entire order"
                                                checked={applyTo === 'entire'}
                                                onChange={() => setApplyTo('entire')}
                                            />
                                            <RadioButton
                                                label="Collection"
                                                checked={applyTo === 'collection'}
                                                onChange={() => { setApplyTo('collection') }}
                                                onFocus={() => {
                                                    setCollectionModalOpen(true);
                                                }}
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
                                                checked={purchaseType === 'one_time'}
                                                onChange={() => setPurchaseType('one_time')}
                                            />
                                            <RadioButton
                                                label="Subscription"
                                                checked={purchaseType === 'subscription'}
                                                onChange={() => setPurchaseType('subscription')}
                                            />
                                            <RadioButton
                                                label="Both"
                                                checked={purchaseType === 'both'}
                                                onChange={() => setPurchaseType('both')}
                                            />
                                        </BlockStack>
                                    </Box>
                                </Card>

                                {(purchaseType === 'subscription' || purchaseType === 'both') && (
                                    <>
                                        <Card>
                                            <BlockStack gap={300}>
                                                <Text variant='headingSm' as="span">Recurring Payment Options</Text>
                                                <TextField
                                                    type="number"
                                                    value={recurringPaymentOptions}
                                                    onChange={(value) => setRecurringPaymentOptions(value)}
                                                    helpText='The number of times a discount applies on recurring purchases. For example, if you set this field to 3, then the discount only applies to the first three billing cycles of a subscription. If you specify 0, then the discount applies indefinitely.'
                                                />
                                            </BlockStack>
                                        </Card>
                                    </>
                                )}
                                <Card>
                                    <BlockStack gap={10}>
                                        <Text variant='headingMd' >Reward Expiration</Text>
                                        <TextField
                                            type="number"
                                            value={rewardExpiration}
                                            onChange={(value) => setRewardExpiration(value)}
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
                            <BlockStack gap={300}>
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

            <CollectionModal
                open={collectionModalOpen}
                onClose={() => setCollectionModalOpen(false)}
                onSave={() => { setCollectionModalOpen(false) }}
            />
        </Page>
    )
}

export default CouponPage

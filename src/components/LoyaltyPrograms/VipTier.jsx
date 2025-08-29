import { BlockStack, Box, Button, Card, Collapsible, Icon, Layout, RadioButton, Text } from '@shopify/polaris'
import { CheckIcon, EditIcon, RewardIcon, XIcon } from '@shopify/polaris-icons'
import React, { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom';

const VipTier = () => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false)
    const [selectedEntry, setSelectedEntry] = useState('points-earned');

    const handleSelectedEntry = (value) => {
        setSelectedEntry(value);
    }

    const handleToggle = useCallback(() => setOpen((prev) => !prev), [])
    return (
        <div style={{ marginBottom: '30px' }} className="annotatedSection-border">
            <Layout.AnnotatedSection
                title={'VIP Tier Status'}
                description={'Activate/Deactivate your VIP Tier program'}
            >
                <Card>
                    <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Text variant="headingMd">This feature is Deactivated</Text>
                        <Button primary>Activate</Button>
                    </Box>
                </Card>
            </Layout.AnnotatedSection>

            <Layout.AnnotatedSection
                title={'VIP Tiers'}
                description={
                    <Box>
                        <Text>Incentivize customer spending and activity by allowing members to reach exclusive VIP tiers.</Text>
                        <Box style={{ marginTop: '10px' }}>
                            <Button variant="secondary">Add VIP Tier</Button>
                        </Box>
                    </Box>
                }

            >
                <Card padding='0'>
                    <Box style={{ backgroundColor: "#F5F5F5", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Text variant="headingMd">Referral Rewards</Text>
                        {/* <Button variant="plain">Change Rewards</Button> */}
                    </Box>
                    <Box style={{ backgroundColor: "#fff", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <Icon tone='subdued' source={RewardIcon} />
                                <Box>
                                    <Text variant="bodyMd">Bronze</Text>
                                    <Text variant="bodyMd">place 0 orders</Text>
                                </Box>
                            </div>
                        </Box>
                        <Button icon={<Icon source={EditIcon} />} onClick={() => navigate(`/loyaltyProgram/tierview${window.location.search}`)} primary>Edit</Button>
                    </Box>
                    <Box style={{ backgroundColor: "#fff", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <Icon tone='subdued' source={RewardIcon} />
                                <Box>
                                    <Text variant="bodyMd">silver</Text>
                                    <Text variant="bodyMd">place 0 orders</Text>
                                </Box>
                            </div>
                        </Box>
                        <Button icon={<Icon source={EditIcon} />} primary>Edit</Button>
                    </Box>
                    <Box style={{ backgroundColor: "#fff", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <Icon tone='subdued' source={RewardIcon} />
                                <Box>
                                    <Text variant="bodyMd">Gold</Text>
                                    <Text variant="bodyMd">place 0 orders</Text>
                                </Box>
                            </div>
                        </Box>
                        <Button icon={<Icon source={EditIcon} />} primary>Edit</Button>
                    </Box>
                </Card>
            </Layout.AnnotatedSection>

            <Layout.AnnotatedSection
                title={'Program Settings'}
                description={
                    'We will recalculate your customers tiers after changing any of the following settings.'
                }
            >
                <Card padding='0'>
                    <Box style={{ backgroundColor: "#F5F5F5", padding: "16px", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text variant="headingMd">Program Start Date</Text>
                        <Button variant="plain" onClick={handleToggle}>
                            Edit
                        </Button>
                    </Box>
                    <Box style={{ padding: '10px 16px' }}>
                        <Text>
                            Customers are placed onto VIP Tiers based upon their total number of orders placed.
                        </Text>
                    </Box>

                    <Collapsible
                        open={open}
                        id="basic-collapsible"
                        transition={{ duration: '500ms', timingFunction: 'ease-in-out' }}
                        expandOnPrint
                    >
                        <Box style={{ padding: '10px 16px' }}>
                            <BlockStack >
                                <RadioButton
                                    label="Points Earned"
                                    checked={selectedEntry === 'points-earned'}
                                    id="points-earned"
                                    name="entry-method"
                                    onChange={() => handleSelectedEntry('points-earned')}
                                />
                                <RadioButton
                                    label="Orders Placed"
                                    checked={selectedEntry === 'orders-placed'}
                                    id="orders-placed"
                                    name="entry-method"
                                    onChange={() => handleSelectedEntry('orders-placed')}
                                />
                                <RadioButton
                                    label="Amount Spent"
                                    checked={selectedEntry === 'amount-spent'}
                                    id="amount-spent"
                                    name="entry-method"
                                    onChange={() => handleSelectedEntry('amount-spent')}
                                />
                                <Box style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <Button variant="primary">Cancel</Button>
                                    <Button variant="secondary">Save</Button>
                                </Box>
                            </BlockStack>
                        </Box>
                    </Collapsible>
                </Card>
            </Layout.AnnotatedSection>
        </div>
    )
}

export default VipTier

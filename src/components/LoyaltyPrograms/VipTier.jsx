import { BlockStack, Box, Button, Card, Collapsible, Icon, Layout, RadioButton, ResourceItem, ResourceList, Text } from '@shopify/polaris'
import { CheckIcon, EditIcon, RewardIcon, XIcon } from '@shopify/polaris-icons'
import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { fetchData } from '../../action';
import { iconsMap } from '../../utils';

const VipTier = () => {
    const navigate = useNavigate();
    const [openEntryMethod, setOpenEntryMethod] = useState(false)
    const [openTierProgressExpiry, setOpenTierProgressExpiry] = useState(false)
    const [selectedEntry, setSelectedEntry] = useState('points-earned');
    const [selectedTierProgressExpiry, setSelectedTierProgressExpiry] = useState('lifetime');
    const [vipTierData, setVipTierData] = useState([]);
    const [masterRewardsList, setMasterRewardsList] = useState([]);

    const GetVipTierAPI = async () => {
        try {
            const formData = new FormData();
            const response = await fetchData("/get-tiers", formData);
            console.log('response vip Tier', response);
            if (response.status) {
                setVipTierData(response);
                setMasterRewardsList(response?.master_rewards);
            } else {
                shopify.toast.show(response?.message, { duration: 2000, isError: true });
            }
        } catch (error) {
            console.error('Error fetching VIP tiers:', error);
            shopify.toast.show(error?.message, { duration: 2000, isError: true });
        }
    }

    useEffect(() => {
        GetVipTierAPI();
    }, []);

    const handleAddTierClick = () => {
        navigate(`/loyaltyProgram/tierview`, { state: { masterRewardsList: masterRewardsList } });
    };

    const handleSelectedEntry = (value) => {
        setSelectedEntry(value);
    }

    const handleSelectedTierProgressExpiry = (value) => {
        setSelectedTierProgressExpiry(value);
    }

    const toggleEntryMethod = useCallback(() => setOpenEntryMethod((prev) => !prev), [])
    const toggleTierProgressExpiry = useCallback(() => setOpenTierProgressExpiry((prev) => !prev), [])
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
                            <Button onClick={() => handleAddTierClick()} variant="secondary">Add VIP Tier</Button>
                        </Box>
                    </Box>
                }

            >
                <Card padding='0'>
                    <Box style={{ backgroundColor: "#F5F5F5", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Text variant="headingMd">Referral Rewards</Text>
                        {/* <Button variant="plain">Change Rewards</Button> */}
                    </Box>

                    <ResourceList
                        items={vipTierData?.data?.tier_settings || []}
                        renderItem={(item) => {
                            const IconSource = iconsMap[item?.icon];
                            return (
                                <ResourceItem key={item.id}>
                                    <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <Box>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <Icon tone='subdued' source={RewardIcon} />
                                                <Box>
                                                    <Text variant="bodyMd">{item?.title}</Text>
                                                    <Text variant="bodyMd">Achieve on {item?.points_needed} points  |  {item?.points_multiply} points multiplier</Text>
                                                </Box>
                                            </div>
                                        </Box>
                                        <Button icon={<Icon source={EditIcon} />} onClick={() => navigate(`/loyaltyProgram/tierview`, { state: { rule: item, edit: true } })} primary>Edit</Button>
                                    </Box>
                                </ResourceItem>
                            )
                        }}
                    />
                </Card>
            </Layout.AnnotatedSection>

            <Layout.AnnotatedSection
                title={'Program Settings'}
                description={
                    'We will recalculate your customers tiers after changing any of the following settings.'
                }
            >
                <BlockStack gap={300}>
                    <Card padding='0'>
                        <Box style={{ backgroundColor: "#F5F5F5", padding: "16px", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text variant="headingMd">Entry Method</Text>
                            <Button variant="plain" onClick={toggleEntryMethod}>
                                Edit
                            </Button>
                        </Box>
                        <Box style={{ padding: '10px 16px' }}>
                            <Text>
                                Customers are placed onto VIP Tiers based upon their total number of orders placed.
                            </Text>
                        </Box>

                        <Collapsible
                            open={openEntryMethod}
                            transition={{ duration: '500ms', timingFunction: 'ease-in-out' }}
                            expandOnPrint
                        >
                            <Box style={{ padding: '0px 16px 10px 16px' }}>
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
                                        <Button onClick={() => setOpenEntryMethod(false)} variant="primary">Cancel</Button>
                                        <Button variant="secondary">Save</Button>
                                    </Box>
                                </BlockStack>
                            </Box>
                        </Collapsible>
                    </Card>

                    <Card padding='0'>
                        <Box style={{ backgroundColor: "#F5F5F5", padding: "16px", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text variant="headingMd">Tier Progress Expiry</Text>
                            <Button variant="plain" onClick={toggleTierProgressExpiry}>
                                Edit
                            </Button>
                        </Box>
                        <Box style={{ padding: '10px 16px' }}>
                            <Text>A customer has a Lifetime to successfully achieve a VIP tier.</Text>
                        </Box>

                        <Collapsible
                            open={openTierProgressExpiry}
                            transition={{ duration: '500ms', timingFunction: 'ease-in-out' }}
                            expandOnPrint
                        >
                            <Box style={{ padding: '0px 16px 10px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <Text>Set how long you will allow customers to take to achieve a VIP Tier:</Text>
                                <BlockStack >
                                    <RadioButton
                                        label="A lifetime, once they are a loyalty program member"
                                        checked={selectedTierProgressExpiry === 'lifetime'}
                                        onChange={() => handleSelectedTierProgressExpiry('lifetime')}
                                    />
                                    <RadioButton
                                        label="A full calendar year"
                                        checked={selectedTierProgressExpiry === 'calendar-year'}
                                        onChange={() => handleSelectedTierProgressExpiry('calendar-year')}
                                    />
                                    <RadioButton
                                        label="A rolling year"
                                        checked={selectedTierProgressExpiry === 'rolling-year'}
                                        onChange={() => handleSelectedTierProgressExpiry('rolling-year')}
                                    />
                                    <Box style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                        <Button onClick={() => setOpenTierProgressExpiry(false)} variant="primary">Cancel</Button>
                                        <Button variant="secondary">Save</Button>
                                    </Box>
                                </BlockStack>
                            </Box>
                        </Collapsible>
                    </Card>
                </BlockStack>
            </Layout.AnnotatedSection>
        </div>
    )
}

export default VipTier

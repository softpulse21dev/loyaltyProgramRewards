import { BlockStack, Box, Button, Card, Collapsible, Icon, Layout, RadioButton, ResourceItem, ResourceList, Text } from '@shopify/polaris'
import { CheckIcon, EditIcon, RewardIcon, XIcon } from '@shopify/polaris-icons'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { fetchData } from '../../action';
import { iconsMap } from '../../utils';

const VipTier = () => {
    const navigate = useNavigate();
    const [selectedEntry, setSelectedEntry] = useState(1);
    const [selectedTierProgressExpiry, setSelectedTierProgressExpiry] = useState(1);
    const [vipTierData, setVipTierData] = useState([]);
    const [masterRewardsList, setMasterRewardsList] = useState([]);
    const [vipStatus, setVipStatus] = useState(false);
    const [loading, setLoading] = useState(false);

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

    const UpdateVipTierAPI = async () => {
        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("tier_method", selectedEntry);
            formData.append("tier_expiry", selectedTierProgressExpiry);
            formData.append("status", !vipStatus);

            const response = await fetchData("/tier-setting", formData);
            console.log('responseStatus', response);

            if (response?.status) {
                setVipStatus(!vipStatus);
                GetVipTierAPI();
            } else {
                console.log('response?.message', response?.message)
            }
        } catch (err) {
            console.error("Error updating VIP Tier:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTierClick = () => {
        navigate(`/loyaltyProgram/tierview`, { state: { masterRewardsList: masterRewardsList, navigateTo: 3 } });
    };

    const handleSelectedEntry = (value) => {
        setSelectedEntry(value);
    }

    const handleSelectedTierProgressExpiry = (value) => {
        setSelectedTierProgressExpiry(value);
    }
    return (
        <div style={{ marginBottom: '30px' }} className="annotatedSection-border">
            <Layout.AnnotatedSection
                title={'VIP Tier Status'}
                description={'Activate/Deactivate your VIP Tier program'}
            >
                <Card>
                    <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Text variant="headingMd">
                            {vipStatus ? "This feature is Activated" : "This feature is Deactivated"}
                        </Text>
                        <Button
                            primary={!vipStatus}
                            destructive={vipStatus}
                            onClick={UpdateVipTierAPI}
                            loading={loading}
                        >
                            {vipStatus ? "Deactivate" : "Activate"}
                        </Button>
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
                    </Box>

                    <ResourceList
                        items={vipTierData?.data?.tier_settings || []}
                        renderItem={(item) => {
                            const IconSource = iconsMap[item?.icon];
                            return (
                                <ResourceItem key={item.id}>
                                    <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <Box>
                                            <div className='icon-size' style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <Icon source={RewardIcon} />
                                                <Box>
                                                    <Text variant="bodyMd">{item?.title}</Text>
                                                    <Text variant="bodyMd">Achieve on {item?.points_needed} points  |  {item?.points_multiply} points multiplier</Text>
                                                </Box>
                                            </div>
                                        </Box>
                                        <Button icon={<Icon source={EditIcon} />} onClick={() => navigate(`/loyaltyProgram/tierview`, { state: { rule: item, edit: true, navigateTo: 3 } })} primary>Edit</Button>
                                    </Box>
                                </ResourceItem>
                            )
                        }}
                    />
                </Card>
            </Layout.AnnotatedSection>

            <Layout.AnnotatedSection
                title={'Program Settings'}
                description='We will recalculate your customers tiers after changing any of the following settings.'
            >
                <BlockStack gap={300}>
                    <Card>
                        <Box>
                            <Text variant="headingMd">Entry Method</Text>
                        </Box>
                        <Box style={{ paddingTop: '10px' }}>
                            <Text>
                                Customers are placed onto VIP Tiers based upon their total number of orders placed.
                            </Text>
                            <BlockStack >
                                <RadioButton
                                    label="Points Earned"
                                    checked={selectedEntry === 1}
                                    id="points-earned"
                                    name="entry-method"
                                    onChange={() => handleSelectedEntry(1)}
                                />
                                <RadioButton
                                    label="Orders Placed"
                                    checked={selectedEntry === 2}
                                    id="orders-placed"
                                    name="entry-method"
                                    onChange={() => handleSelectedEntry(2)}
                                />
                                <RadioButton
                                    label="Amount Spent"
                                    checked={selectedEntry === 3}
                                    id="amount-spent"
                                    name="entry-method"
                                    onChange={() => handleSelectedEntry(3)}
                                />
                            </BlockStack>
                        </Box>
                    </Card>

                    <Card>
                        <Box>
                            <Text variant="headingMd">Tier Progress Expiry</Text>
                        </Box>
                        <Box style={{ paddingTop: "10px" }}>
                            <Text>A customer has a Lifetime to successfully achieve a VIP tier.</Text>
                            <Text>Set how long you will allow customers to take to achieve a VIP Tier:</Text>
                            <BlockStack >
                                <RadioButton
                                    label="A lifetime, once they are a loyalty program member"
                                    checked={selectedTierProgressExpiry === 1}
                                    onChange={() => handleSelectedTierProgressExpiry(1)}
                                />
                                <RadioButton
                                    label="A full calendar year"
                                    checked={selectedTierProgressExpiry === 2}
                                    onChange={() => handleSelectedTierProgressExpiry(2)}
                                />
                                <RadioButton
                                    label="A rolling year"
                                    checked={selectedTierProgressExpiry === 3}
                                    onChange={() => handleSelectedTierProgressExpiry(3)}
                                />
                            </BlockStack>
                        </Box>
                    </Card>
                </BlockStack>
            </Layout.AnnotatedSection>
        </div>
    )
}

export default VipTier

import { BlockStack, Box, Button, Card, Collapsible, Icon, Layout, RadioButton, ResourceItem, ResourceList, SkeletonBodyText, Text } from '@shopify/polaris'
import { CheckIcon, EditIcon, RewardIcon, XIcon } from '@shopify/polaris-icons'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { fetchData } from '../../action';
import { iconsMap } from '../../utils';
import { useDispatch, useSelector } from 'react-redux';
import { ClearTierFormData, removeData, RemoveTierId, TierId } from '../../redux/action';

const VipTier = ({ entryMethod, tierProgressExpiry, setEntryMethod, setTierProgressExpiry, vipStatus, setVipStatus, loadingTiers, onRefreshData }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const vipTierData = useSelector((state) => state.merchantSettings.vipTierData);
    console.log('vipTierData', vipTierData)

    const dispatch = useDispatch();

    useEffect(() => {
        // Only clean up Redux state when component mounts, don't fetch data here
        dispatch(RemoveTierId());
        dispatch(removeData());
        dispatch(ClearTierFormData());
        console.log('removed tierid')
    }, [dispatch]);

    const UpdateVipTierAPI = async () => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("status", !vipStatus);
            const response = await fetchData("/tier-setting", formData);
            console.log('responseStatus', response);

            if (response?.status) {
                setVipStatus(!vipStatus);
                // Optionally refresh data if needed
                if (onRefreshData) {
                    onRefreshData();
                }
            } else {
                console.log('response?.message', response?.message)
                shopify.toast.show(response?.message || 'Failed to update VIP Tier status', { duration: 2000, isError: true });
            }
        } catch (err) {
            console.error("Error updating VIP Tier:", err);
            shopify.toast.show(err?.message || 'Error updating VIP Tier status', { duration: 2000, isError: true });
        } finally {
            setLoading(false);
        }
    };

    const handleAddTierClick = () => {
        // Clear any previous edit data
        localStorage.removeItem('tierEditData');
        navigate(`/loyaltyProgram/tierview`, { state: { navigateTo: 2 } });
    };

    return (
        <div style={{ marginBottom: '30px' }} className="annotatedSection-border">
            <Layout.AnnotatedSection
                title={'VIP Tier Status'}
                description={'Activate/Deactivate your VIP Tier program'}
            >
                <Card>
                    {loadingTiers ? <SkeletonBodyText lines={2} /> : (
                        <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Text variant="headingMd">
                                {vipStatus ? "This feature is Activated" : "This feature is Deactivated"}
                            </Text>
                            <Button
                                primary={!vipStatus}
                                destructive={vipStatus}
                                tone={vipStatus ? "critical" : "success"}
                                onClick={() => UpdateVipTierAPI(true)}
                                loading={loading}
                            >
                                {vipStatus ? "Deactivate" : "Activate"}
                            </Button>
                        </Box>
                    )}
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

                    {loadingTiers ? <Box style={{ padding: '16px' }}>
                        <SkeletonBodyText lines={10} />
                    </Box> : (
                        <ResourceList
                            items={vipTierData || []}
                            renderItem={(item) => {
                                const IconSource = iconsMap[item?.icon];
                                return (
                                    <ResourceItem key={item.id}>
                                        <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <Box>
                                                {console.log('item?.icon?.url', item?.icon?.url)}
                                                <div className='icon-size' style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                    <Box style={{ width: '30px', height: '30px', objectFit: 'contain', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        {item?.icon_type === 'default' ?
                                                            <Icon source={RewardIcon} />
                                                            :
                                                            <img
                                                                src={item.icon.url}
                                                                alt={item.title || 'Tier Icon'} // Add alt text for accessibility
                                                                style={{ width: '24px', height: '24px', objectFit: 'contain' }} // Style to match Polaris Icon size
                                                            />}
                                                    </Box>
                                                    <Box>
                                                        <Text variant="bodyMd">{item?.title}</Text>
                                                        <Text variant="bodyMd">Achieve on {item?.points_needed} points  |  {item?.points_multiply} points multiplier</Text>
                                                    </Box>
                                                </div>
                                            </Box>
                                            <Button icon={<Icon source={EditIcon} />} onClick={() => {
                                                // Store only the ID to identify which tier is being edited
                                                localStorage.setItem('tierEditData', JSON.stringify({
                                                    tierId: item.uid,
                                                    editMode: true
                                                }));

                                                dispatch(TierId(item.uid));
                                                navigate(`/loyaltyProgram/tierview`, { state: { rule: item, edit: true, navigateTo: 2 } });
                                            }} primary>Edit</Button>
                                        </Box>
                                    </ResourceItem>
                                )
                            }}
                        />
                    )}
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
                                    label="Lifetime Points Earned"
                                    checked={entryMethod == 1}
                                    id="lifetime-points-earned"
                                    name="entry-method"
                                    onChange={() => setEntryMethod(1)}
                                />
                                <RadioButton
                                    label="Total Orders Placed"
                                    checked={entryMethod == 2}
                                    id="total-orders-placed"
                                    name="entry-method"
                                    onChange={() => setEntryMethod(2)}
                                />
                                <RadioButton
                                    label="Lifetime Amount Spent"
                                    checked={entryMethod == 3}
                                    id="lifetime-amount-spent"
                                    name="entry-method"
                                    onChange={() => setEntryMethod(3)}
                                />
                                <RadioButton
                                    label="Lifetime Points Redeemed"
                                    checked={entryMethod == 4}
                                    id="lifettime-points-redeemed"
                                    name="entry-method"
                                    onChange={() => setEntryMethod(4)}
                                />
                            </BlockStack>
                        </Box>
                    </Card>

                    <Card>
                        <Box>
                            <Text variant="headingMd">Vip Tier Coupon Expiry</Text>
                        </Box>
                        <Box style={{ paddingTop: "10px" }}>
                            <Text>Define how long VIP tier coupons remain valid after being issued.</Text>
                            <Text>Choose how long VIP tier coupons are valid after being issued.</Text>
                            <BlockStack >
                                <RadioButton
                                    label="A lifetime, once they are a loyalty program member"
                                    checked={tierProgressExpiry == 1}
                                    onChange={() => setTierProgressExpiry(1)}
                                />
                                <RadioButton
                                    label="A full calendar year"
                                    checked={tierProgressExpiry == 2}
                                    onChange={() => setTierProgressExpiry(2)}
                                />
                                <RadioButton
                                    label="A rolling year"
                                    checked={tierProgressExpiry == 3}
                                    onChange={() => setTierProgressExpiry(3)}
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

import { Badge, BlockStack, Box, Button, Card, Grid, Icon, IndexTable, InlineGrid, Layout, Link, Page, SkeletonBodyText, SkeletonDisplayText, SkeletonPage, Tabs, Text, TextField } from '@shopify/polaris'
import { ClipboardIcon, EditIcon, PinIcon, ViewIcon } from '@shopify/polaris-icons';
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { BronzeIcon } from '../../assets/svg/svg';
import TierModal from '../../components/TierModal';
import PointsModal from '../../components/PointsModal';
import { fetchData } from '../../action';
import { capitalizeFirst, formatShortDate } from '../../utils';

const CustomerView = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const id = location.state?.id || localStorage.getItem("current_customer_view_id");
    const [selected, setSelected] = useState(0);
    const [tierModalOpen, setTierModalOpen] = useState(false);
    const [pointsModalOpen, setPointsModalOpen] = useState(false);
    const [customerTier, setCustomerTier] = useState();
    const [customerPoints, setCustomerPoints] = useState(0);
    const [customerData, setCustomerData] = useState();
    const [customerOrdersData, setCustomerOrdersData] = useState({ data: [], pagination: {} });
    const [customerPointsData, setCustomerPointsData] = useState({ data: [], pagination: {} });
    const [customerTiersData, setCustomerTiersData] = useState({ data: [], pagination: {} });
    const [customerReferralsData, setCustomerReferralsData] = useState({ data: [], pagination: {} });
    const [customerRedeemData, setCustomerRedeemData] = useState({ data: [], pagination: {} });
    const [customerRewardsData, setCustomerRewardsData] = useState({ data: [], pagination: {} });
    const [isLoading, setIsLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [excludeLoading, setExcludeLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState({
        orders: false,
        points: false,
        vip_tier: false,
        referrals: false,
        redeem: false,
        rewards: false,
    });

    // --- EFFECT: If we have an ID from location.state (new navigation), update localStorage ---
    useEffect(() => {
        if (location.state?.id) {
            localStorage.setItem("current_customer_view_id", location.state.id);
        }
    }, [location.state?.id]);

    const GetCustomerByIdAPI = async () => {
        // Prevent call if no ID exists
        if (!id) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("customer_id", id);
            formData.append("type", 'all');
            const response = await fetchData("/get-customer", formData);
            console.log('GetCustomerByIdAPI', response);
            if (response?.status === true) {
                setCustomerData(response.data);
                setCustomerPoints(Number(response.data?.points_balance) || 0);
                setCustomerOrdersData(response.data?.orders_data || []);
                setCustomerPointsData(response.data?.points_history || []);
                setCustomerTiersData(response.data?.vip_tier_history || []);
                setCustomerReferralsData(response.data?.referrals || []);
                setCustomerRedeemData(response.data?.redeem_history || []);
                setCustomerRewardsData(response.data?.rewards_history || []);
                const currentTierTitle = response.data?.current_tier_info?.title;

                if (currentTierTitle) {
                    const currentTierObj = response.data?.tier_titles.find(t => t.content === currentTierTitle);
                    if (currentTierObj) {
                        setCustomerTier(currentTierObj.id);
                    } else {
                        setCustomerTier(1);
                    }
                } else {
                    setCustomerTier(1);
                }
            } else {
                shopify.toast.show(response?.message, { duration: 2000, isError: true });
            }
        } catch (error) {
            console.error('Get Customer By Id Error', error);
        }
        finally {
            setLoading(false);
        }
    }

    const handleLoadMoreAPI = async (pageNumber, type) => {
        setLoadingMore(prev => ({ ...prev, [type]: true }));
        try {
            const formData = new FormData();
            formData.append("customer_id", id);
            formData.append("type", type);
            formData.append("page", pageNumber);
            const response = await fetchData("/get-customer", formData);
            if (response?.status === true) {
                if (type === 'orders') {
                    setCustomerOrdersData(response.data?.orders_data || []);
                } else if (type === 'points') {
                    setCustomerPointsData(response.data?.points_history || []);
                } else if (type === 'vip_tier') {
                    setCustomerTiersData(response.data?.vip_tier_history || []);
                } else if (type === 'referrals') {
                    setCustomerReferralsData(response.data?.referrals || []);
                } else if (type === 'redeem') {
                    setCustomerRedeemData(response.data?.redeem_history || []);
                } else if (type === 'rewards') {
                    setCustomerRewardsData(response.data?.rewards_history || []);
                }
            } else {
                shopify.toast.show(response?.message, { duration: 2000, isError: true });
            }
        } catch (error) {
            console.error('Load More Orders Error', error);
        } finally {
            setLoadingMore(prev => ({ ...prev, [type]: false }));
        }
    }

    useEffect(() => {
        GetCustomerByIdAPI();
    }, [id]);

    const handleAdjustPointsAPI = async ({ points, point_type, reason }) => {

        setIsLoading(true);
        const formData = new FormData();
        formData.append("customer_id", id);
        formData.append("point_type", point_type);
        formData.append("points", points);
        if (reason) formData.append("reason", reason);

        try {
            const response = await fetchData("/manage-customer-points", formData);
            console.log('response', response);

            if (response?.status === true) {
                await GetCustomerByIdAPI();
                setPointsModalOpen(false);
                shopify.toast.show(response.message || "Points updated successfully!", { duration: 2000 });
            } else {
                shopify.toast.show(response?.message || "Failed to update points.", { duration: 2000, isError: true });
            }
        } catch (error) {
            console.error('Adjust Customer Points Error', error);
            shopify.toast.show("An error occurred while adjusting points.", { duration: 2000, isError: true });
        } finally {
            setIsLoading(false);
        }
    };

    const handleExcludeFromProgramAPI = async (customerId) => {
        setExcludeLoading(true);
        try {
            const formData = new FormData();
            formData.append("customer_ids", JSON.stringify([customerId]));
            formData.append("is_excluded", customerData?.is_excluded === '1' ? '0' : '1');
            const response = await fetchData("/toggle-customer-exclusion", formData);

            if (response?.status === true) {
                // UPDATE LOCAL STATE: Toggle 'is_excluded' between "0" and "1"
                setCustomerData((prev) => ({
                    ...prev,
                    is_excluded: prev.is_excluded === '1' ? '0' : '1'
                }));

                shopify.toast.show(response.message, { duration: 2000 });
            } else {
                shopify.toast.show(response?.message, { duration: 2000, isError: true });
            }
        } catch (error) {
            console.error('Exclude From Program Error', error);
        } finally {
            setExcludeLoading(false);
        }
    }

    const handleTierSaveAPI = async (newTierId, reason) => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append("customer_id", id);
        formData.append("new_tier", newTierId);
        if (reason) formData.append("reason", reason);

        try {
            const response = await fetchData("/manage-customer-tier", formData);

            if (response?.status === true) {
                await GetCustomerByIdAPI();
                shopify.toast.show(response.message || "Tier updated successfully!", { duration: 2000 });
            } else {
                shopify.toast.show(response?.message || "Failed to update tier.", { duration: 2000, isError: true });
            }
        } catch (error) {
            console.error('Update Customer Tier Error', error);
        } finally {
            setIsLoading(false);
            setTierModalOpen(false);
        }
    };

    const handleTabChange = useCallback(
        (selected) => setSelected(selected),
        [],
    );
    const handleCopy = () => { navigator.clipboard.writeText(customerData?.referral_link); };

    // --- CHANGED: Handler to clear storage on exit ---
    const handleBackNavigation = () => {
        localStorage.removeItem("current_customer_view_id");
        navigate('/Customer');
    };

    const tabs = [
        { id: 'points', content: 'Points' },
        { id: 'vip', content: 'VIP' },
        { id: 'referrals', content: 'Referrals' },
        { id: 'redeem', content: 'Redeem' },
        { id: 'rewards', content: 'Rewards' },
    ];

    const orderRows = useMemo(() => customerOrdersData?.data?.map((order) => (
        <IndexTable.Row key={order.order_id}>
            <IndexTable.Cell>
                <Link removeUnderline target='_blank' url={order.order_id}>{order.order_name}</Link>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text variant='bodyMd' as="span">{order.order_total}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>{order.order_total_with_tax}</IndexTable.Cell>
            <IndexTable.Cell>
                <Badge tone={order.payment_status === 'paid' ? 'success' : 'enabled'}>{capitalizeFirst(order.payment_status)}</Badge>
            </IndexTable.Cell>
            <IndexTable.Cell flush>
                <Text variant='bodyMd' as="span">{formatShortDate(order.created_at)}</Text>
            </IndexTable.Cell>
        </IndexTable.Row>
    )), [customerOrdersData]);

    const pointsRows = useMemo(() => customerPointsData?.data?.map((point) => (
        <IndexTable.Row key={point.id}> {/* <-- Use a unique, stable ID */}
            <IndexTable.Cell>
                <Text variant='bodyMd' as="span">{point.description}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text variant='bodyMd' as="span">{point.points}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text variant='bodyMd' as="span">{formatShortDate(point.created_at)}</Text>
            </IndexTable.Cell>
        </IndexTable.Row>
    )), [customerPointsData]);

    const tierRows = useMemo(() => customerTiersData?.data?.map((tier) => (
        <IndexTable.Row key={tier.id}>
            <IndexTable.Cell>
                <Text variant='bodyMd' as="span">{tier.tier_after_name}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text variant='bodyMd' as="span">{tier.description}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text variant='bodyMd' as="span">{formatShortDate(tier.created_at)}</Text>
            </IndexTable.Cell>
        </IndexTable.Row>
    )), [customerTiersData]);

    const referralRows = useMemo(() => customerReferralsData?.data?.map((referral) => (
        <IndexTable.Row key={referral.email}>
            <IndexTable.Cell>
                <Text variant='bodyMd' as="span">{referral.email}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text variant='bodyMd' as="span">{referral.total_orders}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text variant='bodyMd' as="span">{formatShortDate(referral.created_at)}</Text>
            </IndexTable.Cell>
        </IndexTable.Row>
    )), [customerReferralsData]);

    const redeemRows = useMemo(() => customerRedeemData?.data?.map((redeem) => (
        <IndexTable.Row key={redeem?.id}>
            <IndexTable.Cell>
                <Text variant='bodyMd' as="span">{redeem?.email}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text variant='bodyMd' as="span">{redeem?.total_orders}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text variant='bodyMd' as="span">{formatShortDate(redeem?.created_at)}</Text>
            </IndexTable.Cell>
        </IndexTable.Row>
    )))

    const rewardRows = useMemo(() => customerRewardsData?.data?.map((reward) => (
        <IndexTable.Row key={reward?.id}>
            <IndexTable.Cell>
                <Text variant='bodyMd' as="span">{reward?.source}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text variant='bodyMd' as="span">{reward?.points_cost}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text variant='bodyMd' as="span">{reward?.code}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Badge tone={reward?.status === 'active' ? 'success' : 'critical'}>{capitalizeFirst(reward?.status)}</Badge>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text variant='bodyMd' as="span">{formatShortDate(reward?.created_at)}</Text>
            </IndexTable.Cell>
        </IndexTable.Row>
    )));


    return (
        <div>
            {loading ?
                <SkeletonPage
                    primaryAction={{ content: <SkeletonDisplayText size="small" /> }}
                >

                    <InlineGrid columns={['twoThirds', 'oneThird']} gap={400} >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <Card>
                                <SkeletonBodyText lines={4} />
                            </Card>
                            <Card>
                                <SkeletonBodyText lines={3} />
                            </Card>
                            <Card>
                                <SkeletonBodyText lines={8} />
                            </Card>
                            <Card>
                                <SkeletonBodyText lines={8} />
                            </Card>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <Card>
                                <SkeletonBodyText lines={4} />
                            </Card>
                            <Card>
                                <SkeletonBodyText lines={4} />
                            </Card>
                        </div>
                    </InlineGrid>

                </SkeletonPage>
                :
                <Page
                    title={customerData?.name}
                    subtitle={`Joined on: ${formatShortDate(customerData?.created_at)}`}
                    titleMetadata={
                        <Badge tone={customerData?.is_excluded === '1' ? 'critical' : 'success'}>
                            {customerData?.is_excluded === '1' ? 'Excluded' : 'Active'}
                        </Badge>
                    }
                    backAction={{ content: 'Back', onAction: handleBackNavigation }}
                    secondaryActions={[
                        {
                            icon: EditIcon,
                            content: customerData?.is_excluded === '1' ? 'Include in Program' : 'Exclude from Program',
                            accessibilityLabel: 'Secondary action label',
                            loading: excludeLoading,
                            onAction: () => handleExcludeFromProgramAPI(customerData?.id),
                        },
                        {
                            icon: ViewIcon,
                            content: 'View in Shopify',
                            accessibilityLabel: 'View in Shopify',
                            onAction: () => window.open(customerData?.customerUrl, '_blank'),
                        },
                    ]}
                >
                    <Layout>
                        <Layout.Section>
                            <Grid>
                                <Grid.Cell columnSpan={{ xs: 6, sm: 4, md: 4, lg: 8, xl: 8 }}>

                                    <BlockStack gap={400}>
                                        <Card padding='0'>
                                            <Box style={{ padding: '16px 16px 0px 16px' }}>
                                                <Text variant='headingMd' as='span'>Referrals</Text>
                                            </Box>

                                            <Box style={{ padding: '16px 16px 16px 16px' }}>
                                                <TextField
                                                    label="Referral Link"
                                                    tone='subdued'
                                                    value={customerData?.referral_link}
                                                    autoComplete="off"
                                                    readOnly
                                                    connectedRight={<Button icon={ClipboardIcon} onClick={handleCopy}></Button>}
                                                >
                                                </TextField>
                                            </Box>

                                            <Box style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0px 16px 16px 16px' }} tone="subdued">
                                                <Box>
                                                    <Icon source={PinIcon} />
                                                </Box>
                                                <Text> Referred a total of 0 customers</Text>
                                            </Box>
                                        </Card>


                                        {(orderRows?.length === 0 || orderRows?.length === undefined) ?
                                            (undefined)
                                            : (
                                                <BlockStack gap={400}>
                                                    <Box style={{ padding: '0px 0px 0px 6px' }}>
                                                        <Text variant='headingMd' as='span'>Orders</Text>
                                                    </Box>
                                                    <Card padding='0'>
                                                        <IndexTable
                                                            resourceName={{ singular: 'order', plural: 'Orders' }}
                                                            itemCount={loadingMore.orders ? 5 : (customerOrdersData.data?.length || 0)}
                                                            selectable={false}
                                                            headings={[
                                                                { title: 'Order ID' },
                                                                { title: 'Total' },
                                                                { title: 'Amount Spent' },
                                                                { title: 'Status' },
                                                                { title: 'Date' },
                                                            ]}
                                                            pagination={(!loadingMore.orders && (customerOrdersData.pagination?.has_next || customerOrdersData.pagination?.has_previous)) ? (
                                                                {
                                                                    hasNext: Boolean(customerOrdersData.pagination?.has_next),
                                                                    hasPrevious: Boolean(customerOrdersData.pagination?.has_previous),
                                                                    onNext: () => {
                                                                        const page = (customerOrdersData.pagination?.page || 0) + 1;
                                                                        handleLoadMoreAPI(page, 'orders');
                                                                    },
                                                                    onPrevious: () => {
                                                                        const page = (customerOrdersData.pagination?.page || 1) - 1;
                                                                        handleLoadMoreAPI(page, 'orders');
                                                                    },
                                                                }
                                                            ) : undefined}
                                                        >
                                                            {loadingMore.orders ? (
                                                                [...Array(5)].map((_, index) => (
                                                                    <IndexTable.Row key={index} position={index}>
                                                                        <IndexTable.Cell><SkeletonBodyText lines={1} /></IndexTable.Cell>
                                                                        <IndexTable.Cell><SkeletonBodyText lines={1} /></IndexTable.Cell>
                                                                        <IndexTable.Cell><SkeletonBodyText lines={1} /></IndexTable.Cell>
                                                                        <IndexTable.Cell><SkeletonBodyText lines={1} /></IndexTable.Cell>
                                                                        <IndexTable.Cell><SkeletonBodyText lines={1} /></IndexTable.Cell>
                                                                    </IndexTable.Row>
                                                                ))
                                                            ) : (
                                                                orderRows
                                                            )}
                                                        </IndexTable>
                                                    </Card>
                                                </BlockStack>
                                            )}
                                        <Box style={{ padding: '0px 0px 0px 6px' }}>
                                            <Text variant='headingMd' as='span'>Activity</Text>
                                        </Box>

                                        <Card padding='0'>
                                            <Box style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0px 0px 6px 0px' }} tone="subdued">
                                                <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}></Tabs>
                                            </Box>
                                            {selected === 0 && (
                                                pointsRows?.length === 0 || pointsRows?.length === undefined ? (
                                                    <Box padding="600">
                                                        <BlockStack align="center" inlineAlign='center'>
                                                            <Box>
                                                                <Text variant="bodyLg" tone="subdued">
                                                                    No data found
                                                                </Text>
                                                            </Box>
                                                        </BlockStack>
                                                    </Box>
                                                ) : (
                                                    <IndexTable
                                                        resourceName={{ singular: 'point', plural: 'Points' }}
                                                        itemCount={loadingMore.points ? 5 : (customerPointsData.data?.length || 0)}
                                                        selectable={false}
                                                        headings={[
                                                            { title: 'Description' },
                                                            { title: 'Points' },
                                                            { title: 'Date', alignment: 'center' },
                                                        ]}
                                                        pagination={(!loadingMore.points && (customerPointsData?.pagination?.has_next || customerPointsData?.pagination?.has_previous)) ? (
                                                            {
                                                                hasNext: Boolean(customerPointsData?.pagination?.has_next),
                                                                hasPrevious: Boolean(customerPointsData?.pagination?.has_previous),
                                                                onNext: () => {
                                                                    const page = customerPointsData?.pagination?.page + 1;
                                                                    handleLoadMoreAPI(page, 'points');
                                                                },
                                                                onPrevious: () => {
                                                                    const page = customerPointsData?.pagination?.page - 1;
                                                                    handleLoadMoreAPI(page, 'points');
                                                                },
                                                            }
                                                        ) : undefined}
                                                    >
                                                        {loadingMore.points ? (
                                                            [...Array(5)].map((_, index) => (
                                                                <IndexTable.Row key={index} position={index}>
                                                                    <IndexTable.Cell><SkeletonBodyText lines={1} /></IndexTable.Cell>
                                                                    <IndexTable.Cell><SkeletonBodyText lines={1} /></IndexTable.Cell>
                                                                    <IndexTable.Cell><SkeletonBodyText lines={1} /></IndexTable.Cell>
                                                                </IndexTable.Row>
                                                            ))
                                                        ) : (
                                                            pointsRows
                                                        )}
                                                    </IndexTable>
                                                )
                                            )}
                                            {selected === 1 && (
                                                tierRows?.length === 0 || tierRows?.length === undefined ? (
                                                    <Box padding="600">
                                                        <BlockStack align="center" inlineAlign='center'>
                                                            <Box>
                                                                <Text variant="bodyLg" tone="subdued">
                                                                    No data found
                                                                </Text>
                                                            </Box>
                                                        </BlockStack>
                                                    </Box>
                                                ) : (
                                                    <IndexTable
                                                        resourceName={{ singular: 'Tier', plural: 'Tiers' }}
                                                        itemCount={loadingMore.vip_tier ? 5 : (customerTiersData.data?.length || 0)}
                                                        selectable={false}
                                                        headings={[
                                                            { title: 'Tier Achieved' },
                                                            { title: 'Description' },
                                                            { title: 'Date' },
                                                        ]}
                                                        pagination={(!loadingMore.vip_tier && (customerTiersData?.pagination?.has_next || customerTiersData?.pagination?.has_previous)) ? (
                                                            {
                                                                hasNext: Boolean(customerTiersData?.pagination?.has_next),
                                                                hasPrevious: Boolean(customerTiersData?.pagination?.has_previous),
                                                                onNext: () => {
                                                                    const page = customerTiersData?.pagination?.page + 1;
                                                                    handleLoadMoreAPI(page, 'vip_tier');
                                                                },
                                                                onPrevious: () => {
                                                                    const page = customerTiersData?.pagination?.page - 1;
                                                                    handleLoadMoreAPI(page, 'vip_tier');
                                                                },
                                                            }
                                                        ) : undefined}
                                                    >
                                                        {loadingMore.vip_tier ? (
                                                            [...Array(5)].map((_, index) => (
                                                                <IndexTable.Row key={index} position={index}>
                                                                    <IndexTable.Cell><SkeletonBodyText lines={1} /></IndexTable.Cell>
                                                                    <IndexTable.Cell><SkeletonBodyText lines={1} /></IndexTable.Cell>
                                                                    <IndexTable.Cell><SkeletonBodyText lines={1} /></IndexTable.Cell>
                                                                </IndexTable.Row>
                                                            ))
                                                        ) : (
                                                            tierRows
                                                        )}
                                                    </IndexTable>
                                                )
                                            )}
                                            {selected === 2 && (
                                                referralRows?.length === 0 || referralRows?.length === undefined ? (
                                                    <Box padding="600">
                                                        <BlockStack align="center" inlineAlign='center'>
                                                            <Box>
                                                                <Text variant="bodyLg" tone="subdued">
                                                                    No data found
                                                                </Text>
                                                            </Box>
                                                        </BlockStack>
                                                    </Box>
                                                ) : (
                                                    <IndexTable
                                                        resourceName={{ singular: 'Referral', plural: 'Referrals' }}
                                                        itemCount={loadingMore.referrals ? 5 : (customerReferralsData.data?.length || 0)}
                                                        selectable={false}
                                                        headings={[
                                                            { title: 'Referred Friend' },
                                                            { title: 'Order Total' },
                                                            { title: 'Date' },
                                                        ]}
                                                        pagination={(!loadingMore.referrals && (customerReferralsData?.pagination?.has_next || customerReferralsData?.pagination?.has_previous)) ? (
                                                            {
                                                                hasNext: Boolean(customerReferralsData?.pagination?.has_next),
                                                                hasPrevious: Boolean(customerReferralsData?.pagination?.has_previous),
                                                                onNext: () => {
                                                                    const page = customerReferralsData?.pagination?.page + 1;
                                                                    handleLoadMoreAPI(page, 'referrals');
                                                                },
                                                                onPrevious: () => {
                                                                    const page = customerReferralsData?.pagination?.page - 1;
                                                                    handleLoadMoreAPI(page, 'referrals');
                                                                },
                                                            }
                                                        ) : undefined}
                                                    >
                                                        {loadingMore.referrals ? (
                                                            [...Array(5)].map((_, index) => (
                                                                <IndexTable.Row key={index} position={index}>
                                                                    <IndexTable.Cell><SkeletonBodyText lines={1} /></IndexTable.Cell>
                                                                    <IndexTable.Cell><SkeletonBodyText lines={1} /></IndexTable.Cell>
                                                                    <IndexTable.Cell><SkeletonBodyText lines={1} /></IndexTable.Cell>
                                                                </IndexTable.Row>
                                                            ))
                                                        ) : (
                                                            referralRows
                                                        )}
                                                    </IndexTable>
                                                )
                                            )}
                                            {selected === 3 && (
                                                redeemRows?.length === 0 || redeemRows?.length === undefined ? (
                                                    <Box padding="600">
                                                        <BlockStack align="center" inlineAlign='center'>
                                                            <Box>
                                                                <Text variant="bodyLg" tone="subdued">
                                                                    No data found
                                                                </Text>
                                                            </Box>
                                                        </BlockStack>
                                                    </Box>
                                                ) : (
                                                    <IndexTable
                                                        resourceName={{ singular: 'Redeem', plural: 'Redeems' }}
                                                        itemCount={loadingMore.redeem ? 5 : (customerRedeemData.data?.length || 0)}
                                                        selectable={false}
                                                        headings={[
                                                            { title: 'Order Total' },
                                                            { title: 'Points' },
                                                            { title: 'Code' },
                                                            { title: 'Status' },
                                                            { title: 'Date' },
                                                        ]}
                                                        pagination={(!loadingMore.redeem && (customerRedeemData?.pagination?.has_next || customerRedeemData?.pagination?.has_previous)) ? (
                                                            {
                                                                hasNext: Boolean(customerRedeemData?.pagination?.has_next),
                                                                hasPrevious: Boolean(customerRedeemData?.pagination?.has_previous),
                                                                onNext: () => {
                                                                    const page = customerRedeemData?.pagination?.page + 1;
                                                                    handleLoadMoreAPI(page, 'redeem');
                                                                },
                                                                onPrevious: () => {
                                                                    const page = customerRedeemData?.pagination?.page - 1;
                                                                    handleLoadMoreAPI(page, 'redeem');
                                                                },
                                                            }
                                                        ) : undefined}
                                                    >
                                                        {loadingMore.redeem ? (
                                                            [...Array(5)].map((_, index) => (
                                                                <IndexTable.Row key={index} position={index}>
                                                                    <IndexTable.Cell><SkeletonBodyText lines={1} /></IndexTable.Cell>
                                                                    <IndexTable.Cell><SkeletonBodyText lines={1} /></IndexTable.Cell>
                                                                    <IndexTable.Cell><SkeletonBodyText lines={1} /></IndexTable.Cell>
                                                                </IndexTable.Row>
                                                            ))
                                                        ) : (
                                                            redeemRows
                                                        )}
                                                    </IndexTable>
                                                )
                                            )}
                                            {selected === 4 && (
                                                rewardRows?.length === 0 || rewardRows?.length === undefined ? (
                                                    <Box padding="600">
                                                        <BlockStack align="center" inlineAlign='center'>
                                                            <Box>
                                                                <Text variant="bodyLg" tone="subdued">
                                                                    No data found
                                                                </Text>
                                                            </Box>
                                                        </BlockStack>
                                                    </Box>
                                                ) : (
                                                    <IndexTable
                                                        resourceName={{ singular: 'Reward', plural: 'Rewards' }}
                                                        itemCount={loadingMore.rewards ? 5 : (customerRewardsData.data?.length || 0)}
                                                        selectable={false}
                                                        headings={[
                                                            { title: 'Order Total' },
                                                            { title: 'Points' },
                                                            { title: 'Code' },
                                                            { title: 'Status' },
                                                            { title: 'Date' },
                                                        ]}
                                                        pagination={(!loadingMore.rewards && (customerRewardsData?.pagination?.has_next || customerRewardsData?.pagination?.has_previous)) ? (
                                                            {
                                                                hasNext: Boolean(customerRewardsData?.pagination?.has_next),
                                                                hasPrevious: Boolean(customerRewardsData?.pagination?.has_previous),
                                                                onNext: () => {
                                                                    const page = customerRewardsData?.pagination?.page + 1;
                                                                    handleLoadMoreAPI(page, 'rewards');
                                                                },
                                                                onPrevious: () => {
                                                                    const page = customerRewardsData?.pagination?.page - 1;
                                                                    handleLoadMoreAPI(page, 'rewards');
                                                                },
                                                            }
                                                        ) : undefined}
                                                    >
                                                        {loadingMore.rewards ? (
                                                            [...Array(5)].map((_, index) => (
                                                                <IndexTable.Row key={index} position={index}>
                                                                    <IndexTable.Cell><SkeletonBodyText lines={1} /></IndexTable.Cell>
                                                                    <IndexTable.Cell><SkeletonBodyText lines={1} /></IndexTable.Cell>
                                                                    <IndexTable.Cell><SkeletonBodyText lines={1} /></IndexTable.Cell>
                                                                </IndexTable.Row>
                                                            ))
                                                        ) : (
                                                            rewardRows
                                                        )}
                                                    </IndexTable>
                                                )
                                            )}
                                        </Card>


                                    </BlockStack>
                                </Grid.Cell>

                                <Grid.Cell columnSpan={{ xs: 6, sm: 2, md: 2, lg: 4, xl: 4 }}>
                                    <BlockStack gap={400}>
                                        <Card>
                                            <BlockStack>
                                                <Box style={{ margin: '0px 0px 16px 0px' }}>
                                                    <Text variant='headingMd' as="span">Details</Text>
                                                </Box>
                                                <Text variant='bodyMd' as="span">{customerData?.name}</Text>
                                                <Text variant='bodyMd' as="span">{customerData?.email}</Text>
                                                <Text variant='bodyMd' as="span">Diamond World, Mini - Bazzar</Text>
                                            </BlockStack>
                                        </Card>
                                        <Card>
                                            <BlockStack>
                                                <Text variant='headingMd' as="span">VIP Tier</Text>
                                                <Box style={{ margin: '15px 0px 10px 0px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <img
                                                            height={25}
                                                            width={25}
                                                            src={customerData?.current_tier_info?.icon}
                                                        />
                                                    </Box>
                                                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Text variant='headingLg' fontWeight='bold' alignment='center'>
                                                            {customerData?.current_tier_info?.title}
                                                        </Text>
                                                    </Box>
                                                </Box>
                                                <Button
                                                    variant='primary'
                                                    tone='success'
                                                    size='medium'
                                                    onClick={() => setTierModalOpen(true)}
                                                    icon={EditIcon}
                                                >
                                                    Change Tier
                                                </Button>
                                            </BlockStack>
                                        </Card>
                                        <Card>
                                            <BlockStack>
                                                <Text variant='headingMd' as="span">Points</Text>
                                                <Box style={{ margin: '15px 0px 10px 0px' }}>
                                                    <Text variant='headingLg' fontWeight='bold'>{customerPoints.toFixed(2)} points</Text>
                                                </Box>
                                                <Button
                                                    variant='secondary'
                                                    size='medium'
                                                    icon={EditIcon}
                                                    onClick={() => setPointsModalOpen(true)}
                                                >
                                                    Adjust Points
                                                </Button>
                                            </BlockStack>
                                        </Card>
                                    </BlockStack>
                                </Grid.Cell>
                            </Grid>
                        </Layout.Section>
                    </Layout>

                    <TierModal
                        open={tierModalOpen}
                        onClose={() => setTierModalOpen(false)}
                        tiers={customerData?.tier_titles}
                        selectedTier={customerTier}
                        onSave={handleTierSaveAPI}
                        isLoading={isLoading}
                    />
                    <PointsModal
                        open={pointsModalOpen}
                        onClose={() => setPointsModalOpen(false)}
                        customerPoints={customerPoints}
                        onSave={handleAdjustPointsAPI}
                        isLoading={isLoading}
                    />
                </Page>
            }
        </div >
    )
}

export default CustomerView

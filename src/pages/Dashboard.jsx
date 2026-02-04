import { ActionList, Banner, BlockStack, Box, Button, Card, Collapsible, Grid, Layout, MediaCard, Page, Popover, SkeletonBodyText, SkeletonDisplayText, SkeletonPage, Text, VideoThumbnail } from '@shopify/polaris'
import { PlayCircleIcon } from '@shopify/polaris-icons';
import { useCallback, useEffect, useState } from 'react'
import { fetchData } from '../action';
import DateRangePicker from '../components/DateRangePicker';
import { useDispatch } from 'react-redux';
import { DefaultData } from '../redux/action';

const Dashboard = () => {
    const [active, setActive] = useState(false);
    const [open, setOpen] = useState(true);
    const handleToggle = useCallback(() => setOpen((open) => !open), []);
    const [loyaltyStatus, setLoyaltyStatus] = useState(null);
    const [programStatusLoading, setProgramStatusLoading] = useState(false);
    const [dashboardLoading, setDashboardLoading] = useState(false);
    const [dashboardData, setDashboardData] = useState({
        new_members: 0,
        orders_from_member: 0,
        rewards_claimed: 0,
        points_generated: 0,
        retention_revenue: 0,
        total_sales: 0,
        filters: {
            start_date: '',
            end_date: ''
        }
    });
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    const since = new Date(today);
    since.setDate(today.getDate() - 6);
    const formatDate = (date) =>
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const [inputValues, setInputValues] = useState({
        since: formatDate(since),
        until: formatDate(today),
    });
    const dispatch = useDispatch();

    const getDefaultDataApi = async () => {
        try {
            const formData = new FormData();
            const response = await fetchData("/get-shop-details", formData);
            if (response?.status === true) {
                // Save to Redux
                dispatch(DefaultData(response.data));
            } else {
                shopify.toast.show(response?.message, { duration: 2000, isError: true, });
            }
            console.log("getDefaultDataApi", response);
        } catch (error) {
            console.error("Error fetching default data:", error);
        }
    };

    const fetchDashboardAPI = useCallback(async () => {
        setDashboardLoading(true);
        try {
            const formData = new FormData();
            formData.append("start_date", inputValues.since);
            formData.append("end_date", inputValues.until);
            const response = await fetchData("/get-dashboard-summary", formData);
            console.log('Dashboardresponse', response);
            if (response) {
                setDashboardData(response.data);
                setLoyaltyStatus(response.data.program_status == 0 ? false : true);
            } else {
                shopify.toast.show(response?.message, { duration: 2000, isError: true });
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setDashboardLoading(false);
        }
    }, [inputValues]);

    const updateLoyaltyStatusAPI = async (newStatus) => {
        console.log('newStatus', newStatus)
        setProgramStatusLoading(true);
        try {
            const formData = new FormData();
            formData.append("program_status", newStatus ? "1" : "0");
            const response = await fetchData("/toggle-loyalty-program", formData);
            console.log('updateLoyaltyStatusAPI', response);
            if (response.status === true) {
                // Update local state instead of calling fetchDashboardAPI to avoid page reload
                setLoyaltyStatus(newStatus);
                shopify.toast.show(response?.message, { duration: 2000 });
            } else {
                shopify.toast.show(response?.message, { duration: 2000, isError: true });
            }
        } catch (error) {
            console.error('Error updating loyalty status:', error);
        } finally {
            setProgramStatusLoading(false);
        }
    }

    useEffect(() => {
        fetchDashboardAPI();
    }, [fetchDashboardAPI]);

    useEffect(() => {
        getDefaultDataApi();
    }, []);

    return (
        <>
            {dashboardLoading ? (
                <SkeletonPage
                    primaryAction={<SkeletonDisplayText />}
                >
                    <BlockStack gap="300">
                        <Card>
                            <SkeletonBodyText lines={3} />
                        </Card>
                        <SkeletonDisplayText />
                        <Card>
                            <SkeletonBodyText lines={5} />
                        </Card>
                        <SkeletonDisplayText />
                        <Card>
                            <SkeletonBodyText lines={8} />
                        </Card>
                        <Card>
                            <SkeletonBodyText lines={3} />
                        </Card>
                    </BlockStack>
                </SkeletonPage>
            ) : (
                <Page
                    title='Dashboard'
                    primaryAction={<DateRangePicker inputValues={inputValues} setInputValues={setInputValues} />}
                >
                    <Box>
                        <BlockStack gap="500">
                            <Banner
                                title={loyaltyStatus ? "Your loyalty program is currently enabled" : "Your loyalty program is currently disabled"}
                                action={{ content: loyaltyStatus ? 'Turn off' : 'Turn on', onAction: () => { updateLoyaltyStatusAPI(!loyaltyStatus) }, loading: programStatusLoading }}
                                tone={loyaltyStatus ? 'success' : 'warning'}
                            >
                                <p>
                                    Turn on your loyalty program to let customers earn points and explore rewards. The widget and loyalty page (if set up) will be visible.
                                </p>
                            </Banner>

                            {/* Tutorial Section */}
                            {/* <MediaCard
                        size="small"
                        title="Getting Started"
                        primaryAction={{
                            icon: PlayCircleIcon,
                            content: <Text as="p">Watch tutorial</Text>,
                            onAction: () => { window.open('https://youtu.be/VU-zVyMsxmg', '_blank') },
                        }}
                        description="Discover how Shopify can power up your entrepreneurial journey."
                        onDismiss={() => { }}
                    >
                        <VideoThumbnail
                            videoLength={30}
                            thumbnailUrl="https://burst.shopifycdn.com/photos/business-woman-smiling-in-office.jpg?width=1850"
                            onClick={() => console.log(window.open('https://youtu.be/VU-zVyMsxmg', '_blank'))}
                        />
                    </MediaCard> */}

                            {/* Revenue Section */}
                            <BlockStack gap="300">
                                <Text as="h1" variant="headingMd">Revenue from loyalty programs</Text>
                                <Layout>
                                    <Layout.Section>
                                        <Grid>
                                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 2, lg: 4, xl: 4 }}>
                                                <Card>
                                                    <Box style={styles.dashboardCardInfo}>
                                                        <Text variant="bodyLg">Total Sales Generated</Text>
                                                        <Box style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                                                            <Text variant="headingLg">₹{dashboardData?.total_sales}</Text>
                                                            {dashboardData?.total_sales_percentage > 0 && (
                                                                <Text tone='success' variant="bodyLg">+{dashboardData?.total_sales_percentage}%</Text>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </Card>
                                            </Grid.Cell>
                                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 2, lg: 4, xl: 4 }}>
                                                <Card>
                                                    <Box style={styles.dashboardCardInfo}>
                                                        <Text variant="bodyLg">Retention Revenue</Text>
                                                        <Box style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                                                            <Text variant="headingLg">₹{dashboardData?.retention_revenue}</Text>
                                                            {dashboardData?.retention_percentage > 0 && (
                                                                <Text tone='success' variant="bodyLg">+{dashboardData?.retention_percentage}%</Text>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </Card>
                                            </Grid.Cell>
                                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 2, lg: 4, xl: 4 }}>
                                                <Card>
                                                    <Box style={styles.dashboardCardInfo}>
                                                        <Text variant="bodyLg">Referral Revenue</Text>
                                                        <Box style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                                                            <Text variant="headingLg">₹{dashboardData?.referral_revenue}</Text>
                                                            {dashboardData?.referral_revenue_percentage > 0 && (
                                                                <Text tone='success' variant="bodyLg">+{dashboardData?.referral_revenue_percentage}%</Text>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </Card>
                                            </Grid.Cell>
                                        </Grid>
                                    </Layout.Section>
                                </Layout>
                            </BlockStack>

                            {/* Engagement Section */}
                            <BlockStack gap="300">
                                <Text as="h1" variant="headingMd">Engagement metrics</Text>
                                <Layout>
                                    <Layout.Section>
                                        <Grid>
                                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 6, xl: 46 }}>
                                                <Card>
                                                    <Box style={styles.dashboardCardInfo}>
                                                        <Text variant="bodyLg">Points generated</Text>
                                                        <Box style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                                                            <Text variant="headingLg">{dashboardData?.points_generated}</Text>
                                                            {dashboardData?.points_generated_percentage > 0 && (
                                                                <Text tone='success' variant="bodyLg">+{dashboardData?.points_generated_percentage}%</Text>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </Card>
                                            </Grid.Cell>
                                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 6, xl: 6 }}>
                                                <Card>
                                                    <Box style={styles.dashboardCardInfo}>
                                                        <Text variant="bodyLg">New members</Text>
                                                        <Box style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                                                            <Text variant="headingLg">{dashboardData?.new_members}</Text>
                                                            {dashboardData?.new_members_percentage > 0 && (
                                                                <Text tone='success' variant="bodyLg">+{dashboardData?.new_members_percentage}%</Text>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </Card>
                                            </Grid.Cell>
                                            {/* <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 2, lg: 4, xl: 4 }}>
                                    <Card>
                                        <Text variant="headingSm">Loyalty member orders</Text>
                                        <Text variant="bodyLg">₹0.00</Text>
                                    </Card>
                                </Grid.Cell> */}
                                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 6, xl: 6 }}>
                                                <Card>
                                                    <Box style={styles.dashboardCardInfo}>
                                                        <Text variant="bodyLg">Rewards claimed</Text>
                                                        <Box style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                                                            <Text variant="headingLg">{dashboardData?.rewards_claimed}</Text>
                                                            {dashboardData?.rewards_claimed_percentage > 0 && (
                                                                <Text tone='success' variant="bodyLg">+{dashboardData?.rewards_claimed_percentage}%</Text>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </Card>
                                            </Grid.Cell>
                                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 6, xl: 6 }}>
                                                <Card>
                                                    <Box style={styles.dashboardCardInfo}>
                                                        <Text variant="bodyLg">Orders from referrals</Text>
                                                        <Box style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                                                            <Text variant="headingLg">{dashboardData?.orders_from_referral}</Text>
                                                            {dashboardData?.orders_referral_percentage > 0 && (
                                                                <Text tone='success' variant="bodyLg">+{dashboardData?.orders_referral_percentage}%</Text>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </Card>
                                            </Grid.Cell>
                                            {/* <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 2, lg: 4, xl: 4 }}>
                                    <Card>
                                        <Text variant="headingSm">VIP members</Text>
                                        <Text variant="bodyLg">₹0.00</Text>
                                    </Card>
                                </Grid.Cell> */}
                                        </Grid>
                                    </Layout.Section>
                                </Layout>
                            </BlockStack>

                            {/* Collapsible Section */}
                            <Card >
                                <div className="accordian-title">
                                    <Button
                                        variant="monochromePlain"
                                        disclosure={open ? 'up' : 'down'}
                                        onClick={() => {
                                            handleToggle();
                                        }}
                                        aria-controls="basic-collapsible"
                                        fullWidth
                                        textAlign="left"
                                    >
                                        <Text as="h1" variant="headingMd">Get started with Loyalty program & Rewards</Text>
                                    </Button>
                                    <Text as="h1" variant="headingMd"></Text>
                                </div>
                                <Collapsible
                                    open={open}
                                    id="basic-collapsible"
                                    transition={{ duration: '500ms', timingFunction: 'ease-in-out' }}
                                    expandOnPrint
                                >
                                    <p>
                                        Your mailing list lets you contact customers or visitors who
                                        have shown an interest in your store. Reach out to them with
                                        exclusive offers or updates about your products.
                                    </p>
                                </Collapsible>
                            </Card>
                        </BlockStack>
                    </Box>
                </Page>
            )}
        </>
    )
}

export default Dashboard

const styles = {
    dashboardCardInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    }
}
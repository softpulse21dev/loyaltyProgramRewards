import { ActionList, Banner, BlockStack, Box, Button, Card, Collapsible, Grid, Layout, Link, MediaCard, Page, Popover, SkeletonBodyText, SkeletonDisplayText, SkeletonPage, Text, VideoThumbnail } from '@shopify/polaris'
import { PlayCircleIcon } from '@shopify/polaris-icons';
import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchData } from '../action';
import DateRangePicker from '../components/DateRangePicker';
import { useDispatch, useSelector } from 'react-redux';
import { DefaultData } from '../redux/action';
import NeedSupport from '../components/NeedSupport';
import { SetupGuide } from '../components/SetupGuide';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [active, setActive] = useState(false);
    const [open, setOpen] = useState(true);
    const handleToggle = useCallback(() => setOpen((open) => !open), []);
    const [loyaltyStatus, setLoyaltyStatus] = useState(null);
    const [programStatusLoading, setProgramStatusLoading] = useState(false);
    // const [dashboardLoading, setDashboardLoading] = useState(false);

    const [dashboardLoading, setDashboardLoading] = useState(true);
    const [defaultDataLoading, setDefaultDataLoading] = useState(true);
    const hideGuide = localStorage.getItem('hideGuide');

    const navigate = useNavigate();
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

    const [defaultData, setDefaultData] = useState([]);
    const [showGuide, setShowGuide] = useState(true);


    const currencySymbol = useSelector((state) => state?.merchantSettings?.defaultData?.currency?.symbol);
    const dateFormat = useSelector((state) => state?.merchantSettings?.defaultData?.date_format);

    console.log('defaultData', defaultData)
    console.log('currencySymbol', currencySymbol)

    const getDefaultDataApi = useCallback(async (silent = false) => {
        // Only show skeleton if it's NOT a silent fetch
        if (!silent) {
            setDefaultDataLoading(true);
        }

        try {
            const formData = new FormData();
            const response = await fetchData("/get-shop-details", formData);
            if (response?.status === true) {
                // Save to Redux
                console.log("getDefaultDataApi", response?.data);
                dispatch(DefaultData(response?.data));
                setDefaultData(response?.data);
            } else {
                shopify.toast.show(response?.message, { duration: 2000, isError: true, });
            }
            console.log("getDefaultDataApi", response);
        } catch (error) {
            console.error("Error fetching default data:", error);
        } finally {
            if (!silent) {
                setDefaultDataLoading(false);
            }
        }
    }, [dispatch]); // Added dispatch as dependency

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

    // 1. Initial Load Effect
    useEffect(() => {
        fetchDashboardAPI();
        getDefaultDataApi(false); // false = not silent, show skeleton on initial load
    }, [fetchDashboardAPI, getDefaultDataApi]);

    // 2. Tab Focus / Visibility Change Effect
    useEffect(() => {
        const handleVisibilityChange = () => {
            // document.visibilityState === 'visible' means the user just returned to this tab
            if (document.visibilityState === 'visible') {
                console.log("User returned to tab, fetching fresh data silently...");
                getDefaultDataApi(true); // true = silent fetch, updates the checkmarks without showing skeleton
            }
        };

        // Listen for tab switching
        document.addEventListener("visibilitychange", handleVisibilityChange);

        // Listen for window focus as a fallback (good for iframe embeds)
        // window.addEventListener("focus", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            // window.removeEventListener("focus", handleVisibilityChange);
        };
    }, [getDefaultDataApi]);


    const items = useMemo(() => [
        {
            id: 0,
            title: 'Activate Loyalty Program',
            description: (
                <Box style={{ marginTop: '10px' }}>
                    <Text variant="bodyMd">Activate your Loyalty program to start rewarding your customers for their purchases.</Text>
                </Box>

            ),
            image: {
                url: "https://cdn.shopify.com/shopifycloud/shopify/assets/admin/home/onboarding/shop_pay_task-70830ae12d3f01fed1da23e607dc58bc726325144c29f96c949baca598ee3ef6.svg",
                alt: "Illustration highlighting ShopPay integration",
            },
            complete: !!loyaltyStatus, // Converted directly to boolean
            primaryButton: {
                content: "Activate Program",
                props: {
                    onAction: () => updateLoyaltyStatusAPI(true), // Passed boolean to match state type
                },
            },
            loading: programStatusLoading,
        },
        {
            id: 1,
            title: 'Add Rewards to your Loyalty Program',
            description: (
                <Box style={{ marginTop: '10px' }}>
                    <Text variant="bodyMd">Add rewards to your Loyalty program to reward your customers for their purchases.</Text>
                    <Text><b>Step 1 :</b> Go to <Link removeUnderline onClick={() => navigate('/loyaltyProgram')}><b>Loyalty Program → Loyalty</b></Link></Text>
                    <Text><b>Step 2 :</b> Make sure the Earning Points / Redeeming Rules are active.</Text>
                </Box>
            ),
            image: {
                url: "https://cdn.shopify.com/shopifycloud/shopify/assets/admin/home/onboarding/detail-images/home-onboard-share-store-b265242552d9ed38399455a5e4472c147e421cb43d72a0db26d2943b55bdb307.svg",
                alt: "Illustration showing an online storefront with a 'share' icon in top right corner",
            },
            complete: defaultData?.reward_module_active == 1 ? true : false, // This will now correctly evaluate when the API updates!
        },
        {
            id: 2,
            title: "Turn on App Embed",
            description: (
                <Box style={{ marginTop: '10px' }}>
                    <Text variant="bodyMd">Turn on app Embed to display the Loyalty program widget on your store.</Text>
                    <Text><b>Step 1 :</b> Go to <Link url={defaultData?.themesUrl} target='_blank' removeUnderline ><b>Online Store → Themes</b></Link> Click <b>Edit theme</b>.</Text>
                    <Text>
                        <b>Step 2:</b> From the top-left menu, open <b>App embeds</b>.
                        Locate your Loyalty App and turn the toggle switch on (it should appear enabled).
                    </Text>
                </Box>
            ),
            image: {
                url: "https://cdn.shopify.com/b/shopify-guidance-dashboard-public/nqjyaxwdnkg722ml73r6dmci3cpn.svgz",
            },
            complete: defaultData?.app_embed_enabled == 1 ? true : false,
        },
        {
            id: 3,
            title: "Activate Widget",
            description: (
                <Box style={{ marginTop: '10px' }}>
                    <Text variant="bodyMd">Activate the Loyalty program widget on your store.</Text>
                    <Text><b>Step 1 :</b> From the left sidebar, click <Link onClick={() => navigate('/widget')} removeUnderline ><b>Widget</b></Link>.</Text>
                    <Text><b>Step 2:</b> On the Widget page, locate the yellow banner that says <b>“Widget is Disabled.”</b></Text>
                    <Text><b>Step 3:</b> Click the <b>Enable</b> button to activate the loyalty widget.</Text>
                    <Box style={{ marginTop: '8px' }}>
                        <Text tone="subdued">Once enabled, the widget will become visible to customers on your store.</Text>
                    </Box>
                </Box>
            ),
            image: {
                url: "https://cdn.shopify.com/b/shopify-guidance-dashboard-public/nqjyaxwdnkg722ml73r6dmci3cpn.svgz",
            },
            complete: defaultData?.widget_enabled == 1 ? true : false,
        },
    ], [loyaltyStatus, defaultData, programStatusLoading, navigate]);

    return (
        <>
            {dashboardLoading || defaultDataLoading ? (
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
                                title={loyaltyStatus ? "Your Loyalty program is currently enabled" : "Your Loyalty program is currently disabled"}
                                action={{ content: loyaltyStatus ? 'Turn off' : 'Turn on', onAction: () => { updateLoyaltyStatusAPI(!loyaltyStatus) }, loading: programStatusLoading }}
                                tone={loyaltyStatus ? 'success' : 'warning'}
                            >
                                {!loyaltyStatus ?
                                    <p>
                                        {/* Turn on your loyalty program to let customers earn points and explore rewards. The widget and loyalty page (if set up) will be visible. */}
                                        Customers can't earn points or redeem rewards while the program is turned off. The widget and loyalty page (if set up) will be visible.
                                    </p>
                                    :
                                    <p>
                                        {/* Turn on your loyalty program to let customers earn points and explore rewards. The widget and loyalty page (if set up) will be visible. */}
                                        Customers can earn points, redeem rewards, and access the loyalty widget and loyalty page.
                                    </p>
                                }
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

                            {/* Setup Guide */}
                            {showGuide && hideGuide !== 'true' && (
                                <SetupGuide
                                    onDismiss={() => { setShowGuide(false), localStorage.setItem('hideGuide', true) }}
                                    items={items}
                                />
                            )}

                            {/* Revenue Section */}
                            <BlockStack gap="300">
                                <Text as="h1" variant="headingMd">Revenue from Loyalty Programs</Text>
                                <Layout>
                                    <Layout.Section>
                                        <Grid>
                                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 2, lg: 4, xl: 4 }}>
                                                <Card>
                                                    <Box style={styles.dashboardCardInfo}>
                                                        <Text variant="bodyLg">Total Sales Generated</Text>
                                                        <Box style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                                                            <Text variant="headingLg">{currencySymbol}{dashboardData?.total_sales}</Text>
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
                                                            <Text variant="headingLg">{currencySymbol}{dashboardData?.retention_revenue}</Text>
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
                                                            <Text variant="headingLg">{currencySymbol}{dashboardData?.referral_revenue}</Text>
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
                                <Text as="h1" variant="headingMd">Engagement Metrics</Text>
                                <Layout>
                                    <Layout.Section>
                                        <Grid>
                                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 6, xl: 46 }}>
                                                <Card>
                                                    <Box style={styles.dashboardCardInfo}>
                                                        <Text variant="bodyLg">Points Generated</Text>
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
                                                        <Text variant="bodyLg">New Members</Text>
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
                                        <Text variant="bodyLg">{currencySymbol}0.00</Text>
                                    </Card>
                                </Grid.Cell> */}
                                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 6, xl: 6 }}>
                                                <Card>
                                                    <Box style={styles.dashboardCardInfo}>
                                                        <Text variant="bodyLg">Rewards Claimed</Text>
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
                                                        <Text variant="bodyLg">Orders from Referrals</Text>
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
                                        <Text variant="bodyLg">{currencySymbol}0.00</Text>
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
                            <NeedSupport />
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
import { ActionList, Banner, BlockStack, Box, Button, Card, Collapsible, Grid, Layout, MediaCard, Page, Popover, Text, VideoThumbnail } from '@shopify/polaris'
import { PlayCircleIcon } from '@shopify/polaris-icons';
import { useCallback, useEffect, useState } from 'react'
import { fetchData } from '../action';
import DateRangePicker from '../components/DateRangePicker';

const Dashboard = () => {
    const [active, setActive] = useState(false);
    const [loyaltyStatus, setLoyaltyStatus] = useState(false);
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
    const formatDate = (date) =>
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const [inputValues, setInputValues] = useState({
        since: formatDate(since),
        until: formatDate(today),
    });

    const activator = <Button onClick={() => setActive(!active)} disclosure="down">Open</Button>;
    const toggleActive = () => setActive(!active);
    const handleImportedAction = () => console.log('Imported');
    const handleExportedAction = () => console.log('Exported');
    const [open, setOpen] = useState(true);
    const handleToggle = useCallback(() => setOpen((open) => !open), []);

    const fetchDashboardAPI = useCallback(async () => {
        const formData = new FormData();
        formData.append("start_date", inputValues.since);
        formData.append("end_date", inputValues.until);
        const response = await fetchData("/get-dashboard-summary", formData);
        console.log('Dashboardresponse', response);
        if (response) {
            setDashboardData(response.data);
        }
    }, [inputValues]);

    useEffect(() => {
        fetchDashboardAPI();
    }, [fetchDashboardAPI]);

    return (
        <Page
            title='Dashboard'
            primaryAction={<DateRangePicker inputValues={inputValues} setInputValues={setInputValues} />}
        >
            <Box>
                <BlockStack gap="500">
                    <Banner
                        title={loyaltyStatus ? "Your loyalty program is currently enabled" : "Your loyalty program is currently disabled"}
                        action={{ content: loyaltyStatus ? 'Turn off' : 'Turn on', onAction: () => { setLoyaltyStatus(!loyaltyStatus) } }}
                        tone={loyaltyStatus ? 'success' : 'warning'}
                    >
                        <p>
                            Turn on your loyalty program to let customers earn points and explore rewards. The widget and loyalty page (if set up) will be visible.
                        </p>
                    </Banner>

                    {/* Tutorial Section */}
                    <MediaCard
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
                    </MediaCard>

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
                                                <Text variant="headingLg">₹{dashboardData?.total_sales}</Text>
                                            </Box>
                                        </Card>
                                    </Grid.Cell>
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 2, lg: 4, xl: 4 }}>
                                        <Card>
                                            <Box style={styles.dashboardCardInfo}>
                                                <Text variant="bodyLg">Retention Revenue</Text>
                                                <Text variant="headingLg">₹{dashboardData?.retention_revenue}</Text>
                                            </Box>
                                        </Card>
                                    </Grid.Cell>
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 2, lg: 4, xl: 4 }}>
                                        <Card>
                                            <Box style={styles.dashboardCardInfo}>
                                                <Text variant="bodyLg">Referral Revenue</Text>
                                                <Text variant="headingLg">₹0.00</Text>
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
                                                <Text variant="headingLg">{dashboardData?.points_generated}</Text>
                                            </Box>
                                        </Card>
                                    </Grid.Cell>
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 6, xl: 6 }}>
                                        <Card>
                                            <Box style={styles.dashboardCardInfo}>
                                                <Text variant="bodyLg">New members</Text>
                                                <Text variant="headingLg">{dashboardData?.new_members}</Text>
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
                                                <Text variant="headingLg">{dashboardData?.rewards_claimed}</Text>
                                            </Box>
                                        </Card>
                                    </Grid.Cell>
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 6, xl: 6 }}>
                                        <Card>
                                            <Box style={styles.dashboardCardInfo}>
                                                <Text variant="bodyLg">Orders from referrals</Text>
                                                <Text variant="headingLg">{dashboardData?.orders_from_referral}</Text>
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
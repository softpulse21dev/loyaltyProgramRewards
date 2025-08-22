import { ActionList, Banner, BlockStack, Box, Button, Card, Collapsible, Grid, Layout, LegacyCard, LegacyStack, MediaCard, Page, Popover, Text, VideoThumbnail } from '@shopify/polaris'
import { PlayCircleIcon } from '@shopify/polaris-icons';
import React, { useCallback, useState } from 'react'

const Dashboard = () => {
    const [active, setActive] = useState(false);
    const [loyaltyStatus, setLoyaltyStatus] = useState(false);
    const activator = <Button onClick={() => setActive(!active)} disclosure="down">Open</Button>;
    const toggleActive = () => setActive(!active);
    const handleImportedAction = () => console.log('Imported');
    const handleExportedAction = () => console.log('Exported');
    const [open, setOpen] = useState(true);
    const handleToggle = useCallback(() => setOpen((open) => !open), []);
    return (
        <Page
            title='Dashboard'
            primaryAction={
                <Popover
                    active={active}
                    activator={activator}
                    autofocusTarget="first-node"
                    onClose={toggleActive}
                >
                    <ActionList
                        actionRole="menuitem"
                        items={[
                            {
                                content: 'Yesterday',
                                onAction: handleImportedAction,
                            },
                            {
                                content: 'Today',
                                onAction: handleExportedAction,
                            },
                        ]}
                    />
                </Popover>
            }
        >
            <Box paddingBlockEnd="800">
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
                                                <Text variant="headingLg">₹0.00</Text>
                                            </Box>
                                        </Card>
                                    </Grid.Cell>
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 2, lg: 4, xl: 4 }}>
                                        <Card>
                                            <Box style={styles.dashboardCardInfo}>
                                                <Text variant="bodyLg">Retention Revenue</Text>
                                                <Text variant="headingLg">₹0.00</Text>
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
                                                <Text variant="headingLg">₹0.00</Text>
                                            </Box>
                                        </Card>
                                    </Grid.Cell>
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 6, xl: 6 }}>
                                        <Card>
                                            <Box style={styles.dashboardCardInfo}>
                                                <Text variant="bodyLg">New members</Text>
                                                <Text variant="headingLg">₹0.00</Text>
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
                                                <Text variant="headingLg">₹0.00</Text>
                                            </Box>
                                        </Card>
                                    </Grid.Cell>
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 6, xl: 6 }}>
                                        <Card>
                                            <Box style={styles.dashboardCardInfo}>
                                                <Text variant="bodyLg">Orders from referrals</Text>
                                                <Text variant="headingLg">₹0.00</Text>
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
                    <div style={{ height: '200px' }}>

                        <Card >
                            <div className="accordian-title">
                                <Button
                                    variant="monochromePlain"
                                    disclosure={open ? 'down' : 'up'}
                                    onClick={() => {
                                        handleToggle();
                                    }}
                                    // aria-expanded={open}
                                    aria-controls="basic-collapsible"
                                    fullWidth
                                    textAlign="left"
                                >
                                    <Text as="h1" variant="headingMd">Get started with Loyalty program & Rewards</Text>
                                </Button>
                                <Text as="h1" variant="headingMd">Get started with Loyalty program & Rewards</Text>
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

                    </div>

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

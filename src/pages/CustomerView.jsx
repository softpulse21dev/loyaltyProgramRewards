import { Avatar, Badge, BlockStack, Box, Button, Card, Grid, Icon, IndexTable, InlineStack, Layout, Page, ResourceItem, ResourceList, Tabs, Text, TextField, useCopyToClipboard } from '@shopify/polaris'
import { ClipboardIcon, DeleteIcon, EditIcon, InfoIcon, PinIcon, PlusIcon, RewardIcon, ViewIcon } from '@shopify/polaris-icons';
import React, { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { BronzeIcon } from '../assets/svg/svg';
import TierModal from '../components/TierModal';
import PointsModal from '../components/PointsModal';

const CustomerView = () => {
    const navigate = useNavigate();
    const [selected, setSelected] = useState(0);
    const [tierModalOpen, setTierModalOpen] = useState(false);
    const [pointsModalOpen, setPointsModalOpen] = useState(false);
    const [customerTier, setCustomerTier] = useState("Bronze");
    const [customerPoints, setCustomerPoints] = useState(0);

    const handlePointsSave = (newPoints) => {
        setCustomerPoints(newPoints); // update customer points when modal saves
        setPointsModalOpen(false);  // close modal
    };

    const handleTierSave = (newTier) => {
        setCustomerTier(newTier); // update customer tier when modal saves
        setTierModalOpen(false);  // close modal
    };

    const Tiers = [
        { id: 'bronze', content: 'Bronze' },
        { id: 'silver', content: 'Silver' },
        { id: 'gold', content: 'Gold' },
        { id: 'platinum', content: 'Platinum' },
    ];

    const handleTabChange = useCallback(
        (selected) => setSelected(selected),
        [],
    );
    const referralLink =
        "https://kg-store-demo.myshopify.com?referral_code=D3CmLr60awIvMKKpOD1H";
    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
    };

    const tabs = [
        { id: 'orders', content: 'Orders' },
        { id: 'points', content: 'Points' },
        { id: 'credits', content: 'Credits' },
        { id: 'vip', content: 'VIP' },
    ];
    const rows = [];

    return (
        <div>
            <Page
                title="Customer Name"
                subtitle="Joined on: 19 Aug 2025"
                titleMetadata={<Badge tone='success'>Active</Badge>}
                backAction={{ content: 'Back', onAction: () => navigate('/Customer') }}
                secondaryActions={[
                    {
                        // destructive: true,
                        // tone: 'critical',
                        icon: EditIcon,
                        content: 'Exclude from Program',
                        accessibilityLabel: 'Secondary action label',
                        onAction: () => alert('Delete action'),
                    },
                    {
                        icon: ViewIcon,
                        content: 'View in Shopify',
                        accessibilityLabel: 'View in Shopify',
                        onAction: () => alert('Duplicate action'),
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
                                                value={referralLink}
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

                                        {rows.length === 0 ? (
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
                                                itemCount={10}
                                                selectedItemsCount={0}
                                                bulkActions={[]}
                                                promotedBulkActions={[]}
                                                onSelectionChange={() => { }}
                                                headings={[
                                                    { title: 'Email' },
                                                    { title: 'Customer' },
                                                    { title: 'Status' },
                                                    { title: 'Amount Spent' },
                                                    { title: 'Joined at' },
                                                ]}
                                                selectable={false}
                                                pagination={
                                                    rows.length > 5
                                                        ? {
                                                            hasNext: true,
                                                            onNext: () => {
                                                                console.log("Load more");
                                                            },
                                                        }
                                                        : undefined // ✅ hide pagination if less than 5
                                                }
                                            >
                                                {/* {rowMarkup} */}
                                            </IndexTable>
                                        )}
                                    </Card>


                                    <Card padding='0'>
                                        <Box style={{ padding: '16px 16px 0px 16px' }}>
                                            <Text variant='headingMd' as='span'>Activity</Text>
                                        </Box>

                                        <Box style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 16px 16px 8px' }} tone="subdued">
                                            <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}></Tabs>
                                        </Box>
                                        {console.log('selected', selected)}

                                        {/* ORDERS SELECTED */}
                                        {selected === 0 && (
                                            rows.length === 0 ? (
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
                                                    itemCount={10}
                                                    selectedItemsCount={0}
                                                    bulkActions={[]}
                                                    promotedBulkActions={[]}
                                                    onSelectionChange={() => { }}
                                                    headings={[
                                                        { title: 'Email' },
                                                        { title: 'Customer' },
                                                        { title: 'Status' },
                                                        { title: 'Amount Spent' },
                                                        { title: 'Joined at' },
                                                    ]}
                                                    selectable={false}
                                                    pagination={
                                                        rows.length > 5
                                                            ? {
                                                                hasNext: true,
                                                                onNext: () => {
                                                                    console.log("Load more");
                                                                },
                                                            }
                                                            : undefined // ✅ hide pagination if less than 5
                                                    }
                                                >
                                                    {/* {rowMarkup} */}
                                                </IndexTable>
                                            )
                                        )}

                                        {/* POINTS SELECTED */}
                                        {selected === 1 && (
                                            rows.length === 2 ? (
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
                                                    itemCount={10}
                                                    selectedItemsCount={0}
                                                    bulkActions={[]}
                                                    promotedBulkActions={[]}
                                                    onSelectionChange={() => { }}
                                                    headings={[
                                                        { title: 'Email' },
                                                        { title: 'Customer' },
                                                        { title: 'Status' },
                                                        { title: 'Points' },
                                                        { title: 'Date' },
                                                    ]}
                                                    selectable={false}
                                                    pagination={
                                                        rows.length > 5
                                                            ? {
                                                                hasNext: true,
                                                                onNext: () => {
                                                                    console.log("Load more");
                                                                },
                                                            }
                                                            : undefined // ✅ hide pagination if less than 5
                                                    }
                                                >
                                                    {/* {rowMarkup} */}
                                                </IndexTable>
                                            )
                                        )}

                                        {/* CREDITS SELECTED */}
                                        {selected === 2 && (
                                            rows.length === 3 ? (
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
                                                    itemCount={10}
                                                    selectedItemsCount={0}
                                                    bulkActions={[]}
                                                    promotedBulkActions={[]}
                                                    onSelectionChange={() => { }}
                                                    headings={[
                                                        { title: 'Email' },
                                                        { title: 'Customer' },
                                                        { title: 'Status' },
                                                        { title: 'Amount Spent' },
                                                        { title: 'Joined at' },
                                                    ]}
                                                    selectable={false}
                                                    pagination={
                                                        rows.length > 5
                                                            ? {
                                                                hasNext: true,
                                                                onNext: () => {
                                                                    console.log("Load more");
                                                                },
                                                            }
                                                            : undefined // ✅ hide pagination if less than 5
                                                    }
                                                >
                                                    {/* {rowMarkup} */}
                                                </IndexTable>
                                            )
                                        )}

                                        {/* VIP SELECTED */}
                                        {selected === 3 && (
                                            rows.length === 2 ? (
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
                                                    itemCount={10}
                                                    selectedItemsCount={0}
                                                    bulkActions={[]}
                                                    promotedBulkActions={[]}
                                                    onSelectionChange={() => { }}
                                                    headings={[
                                                        { title: 'Email' },
                                                        { title: 'Customer' },
                                                        { title: 'Status' },
                                                        { title: 'Amount Spent' },
                                                        { title: 'Joined at' },
                                                    ]}
                                                    selectable={false}
                                                    pagination={
                                                        rows.length > 5
                                                            ? {
                                                                hasNext: true,
                                                                onNext: () => {
                                                                    console.log("Load more");
                                                                },
                                                            }
                                                            : undefined // ✅ hide pagination if less than 5
                                                    }
                                                >
                                                    {/* {rowMarkup} */}
                                                </IndexTable>
                                            )
                                        )}
                                    </Card>
                                </BlockStack>
                            </Grid.Cell>

                            <Grid.Cell columnSpan={{ xs: 6, sm: 2, md: 2, lg: 4, xl: 4 }}>
                                <BlockStack gap={400}>
                                    {/* DETAILS */}
                                    <Card>
                                        <BlockStack>
                                            <Box style={{ margin: '0px 0px 16px 0px' }}>
                                                <Text variant='headingMd' as="span">Details</Text>
                                            </Box>
                                            <Text variant='bodyMd' as="span">Kenil SP</Text>
                                            <Text variant='bodyMd' as="span">ansgbajsf@gmail.com</Text>
                                            <Text variant='bodyMd' as="span">Diamond World, Mini - Bazzar</Text>
                                        </BlockStack>
                                    </Card>

                                    {/* VIP TIER */}
                                    <Card>
                                        <BlockStack>
                                            <Text variant='headingMd' as="span">VIP Tier</Text>
                                            <Box style={{ margin: '15px 0px 10px 0px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <Box>
                                                    <Icon source={BronzeIcon} />
                                                </Box>
                                                <Text variant='headingLg' fontWeight='bold'>
                                                    {Tiers.find(t => t.id === customerTier)?.content}
                                                </Text>
                                            </Box>
                                            <Button variant='primary' tone='success' size='medium' onClick={() => setTierModalOpen(true)} icon={EditIcon}>Change Tier</Button>
                                        </BlockStack>
                                    </Card>

                                    {/* POINTS */}
                                    {/* <Card>
                                        <BlockStack>
                                            <Text variant='headingMd' as="span">Points</Text>
                                            <Box style={{ margin: '15px 0px 10px 0px' }}>
                                                <Text variant='headingLg' fontWeight='bold'>4456 points</Text>
                                            </Box>
                                            <Button variant='secondary' size='medium' icon={EditIcon}>Adjust Points</Button>
                                        </BlockStack>
                                    </Card> */}

                                    <Card>
                                        <BlockStack>
                                            <Text variant='headingMd' as="span">Points</Text>
                                            <Box style={{ margin: '15px 0px 10px 0px' }}>
                                                <Text variant='headingLg' fontWeight='bold'>{customerPoints} points</Text>
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
                    tiers={Tiers}
                    customerTier={customerTier}
                    onSave={handleTierSave}
                />

                <PointsModal
                    open={pointsModalOpen}
                    onClose={() => setPointsModalOpen(false)}
                    customerPoints={customerPoints}
                    onSave={handlePointsSave}
                />
            </Page>
        </div >
    )
}

export default CustomerView

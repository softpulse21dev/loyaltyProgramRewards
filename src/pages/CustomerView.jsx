import { Badge, BlockStack, Box, Button, Card, Grid, Icon, IndexTable, Layout, Page, Tabs, Text, TextField } from '@shopify/polaris'
import { ClipboardIcon, EditIcon, PinIcon, ViewIcon } from '@shopify/polaris-icons';
import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { BronzeIcon } from '../assets/svg/svg';
import TierModal from '../components/TierModal';
import PointsModal from '../components/PointsModal';
import { fetchData } from '../action';
import { formatShortDate } from '../utils';

const CustomerView = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = location.state || {};
    const [selected, setSelected] = useState(0);
    const [tierModalOpen, setTierModalOpen] = useState(false);
    const [pointsModalOpen, setPointsModalOpen] = useState(false);
    const [customerTier, setCustomerTier] = useState();
    const [customerPoints, setCustomerPoints] = useState(0);
    const [customerData, setCustomerData] = useState();
    const [isLoading, setIsLoading] = useState(false);

    const GetCustomerByIdAPI = async () => {
        try {
            const formData = new FormData();
            formData.append("customer", id);
            const response = await fetchData("/get-customer", formData);
            console.log('GetCustomerByIdAPI', response);
            if (response?.status === true) {
                setCustomerData(response.data);
                setCustomerPoints(response.data?.points_balance || 0);
                const currentTierTitle = response.data?.current_tier_info?.title;
                if (currentTierTitle) {
                    const currentTierObj = customerData?.tier_titles.find(t => t.content === currentTierTitle);
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
    }

    useEffect(() => {
        GetCustomerByIdAPI();
    }, [id]);

    const handleAdjustPoints = async ({ points, point_type, reason }) => {
        if (!points || Number(points) <= 0) {
            shopify.toast.show("Please enter a valid number of points.", { duration: 2000, isError: true });
            console.log('hey error')
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        formData.append("customer_id", id);
        formData.append("point_type", point_type);
        formData.append("points", points);
        if (reason) formData.append("reason", reason);

        try {
            const response = await fetchData("/manage-customer-points", formData);
            console.log('response', response);
            const result = await response.json();

            if (result?.status === true) {
                if (result.data?.updated_balance !== undefined) {
                    setCustomerPoints(result.data.updated_balance);
                } else {
                    await GetCustomerByIdAPI();
                }
                setPointsModalOpen(false);
                shopify.toast.show(result.message || "Points updated successfully!", { duration: 2000 });
            } else {
                shopify.toast.show(result?.message || "Failed to update points.", { duration: 2000, isError: true });
            }
        } catch (error) {
            console.error('Adjust Customer Points Error', error);
            shopify.toast.show("An error occurred while adjusting points.", { duration: 2000, isError: true });
        } finally {
            setIsLoading(false);
        }
    };

    const handleTierSave = async (newTierId, reason) => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append("customer_id", id);
        formData.append("new_tier", newTierId);
        if (reason) formData.append("reason", reason);

        try {
            const response = await fetchData("/manage-customer-tier", formData);
            const result = await response.json();

            if (result?.status === true) {
                await GetCustomerByIdAPI();
                shopify.toast.show(result.message || "Tier updated successfully!", { duration: 2000 });
            } else {
                shopify.toast.show(result?.message || "Failed to update tier.", { duration: 2000, isError: true });
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
    const referralLink =
        `https://kg-store-demo.myshopify.com?referral_code=${customerData?.referral_code}`;
    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
    };

    const tabs = [
        { id: 'orders', content: 'Orders' },
        { id: 'points', content: 'Points' },
        { id: 'vip', content: 'VIP' },
    ];
    const rows = [];

    return (
        <div>
            <Page
                title={customerData?.name}
                subtitle={`Joined on: ${formatShortDate(customerData?.created_at)}`}
                titleMetadata={<Badge tone='success'>Active</Badge>}
                backAction={{ content: 'Back', onAction: () => navigate('/Customer') }}
                secondaryActions={[
                    {
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
                                                        : undefined
                                                }
                                            >
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
                                                            : undefined
                                                    }
                                                >
                                                </IndexTable>
                                            )
                                        )}
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
                                                            : undefined
                                                    }
                                                >
                                                </IndexTable>
                                            )
                                        )}

                                        {selected === 2 && (
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
                                                            : undefined
                                                    }
                                                >
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
                                                <Box>
                                                    <Icon source={BronzeIcon} />
                                                </Box>
                                                <Text variant='headingLg' fontWeight='bold'>
                                                    {customerData?.current_tier_info?.title}
                                                </Text>
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
                    tiers={customerData?.tier_titles}
                    selectedTier={customerTier}
                    onSave={handleTierSave}
                    isLoading={isLoading}
                />
                <PointsModal
                    open={pointsModalOpen}
                    onClose={() => setPointsModalOpen(false)}
                    customerPoints={customerPoints}
                    onSave={handleAdjustPoints}
                    isLoading={isLoading}
                />
            </Page>
        </div >
    )
}

export default CustomerView

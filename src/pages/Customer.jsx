import { Card, Text, Page, IndexFilters, IndexTable, useSetIndexFiltersMode, ChoiceList, TextField, Tooltip, IndexFiltersMode, Layout, LegacyCard, BlockStack, Box, InlineStack, Pagination, Select, Button, SkeletonBodyText } from "@shopify/polaris";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchData } from "../action";
import { formatShortDate } from "../utils";

const Customer = () => {
    const [queryValue, setQueryValue] = useState('');

    const [nameFilter, setNameFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState(undefined); // Use `undefined` for ChoiceList
    const [customers, setCustomers] = useState([]);
    const [paginationData, setPaginationData] = useState({});
    const [customerType, setCustomerType] = useState('');
    const [limit, setLimit] = useState('15');
    const [loading, setLoading] = useState(false);

    const GetCustomersAPI = async (endCursor = '', startCursor = '', type) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("customer_type", customerType);
            formData.append("search", queryValue);
            formData.append("next", endCursor);
            formData.append("previous", startCursor);
            formData.append("limit", limit);
            formData.append("type", type);
            const response = await fetchData("/list-customer", formData);
            console.log('Get Customers Response', response);
            if (response?.status === true) {
                setCustomers(response.data);
                setPaginationData(response.pagination);
            } else {
                shopify.toast.show(response?.message, { duration: 2000, isError: true });
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        GetCustomersAPI();
    }, [customerType, limit]);

    const customerTypeOptions = [
        { label: 'All', value: '' },
        { label: 'Guest', value: 'guest' },
        { label: 'Member', value: 'member' },
    ]

    const options = [
        { label: '15', value: '15' },
        { label: '30', value: '30' },
        { label: '50', value: '50' },
    ];

    // --- Filter Handlers ---

    // `useCallback` is used for performance, preventing re-creation of these functions on every render
    const handleNameFilterRemove = useCallback(() => setNameFilter(''), []);
    const handleStatusFilterRemove = useCallback(() => setStatusFilter(), []);
    const handleFiltersClearAll = useCallback(() => {
        handleNameFilterRemove();
        handleStatusFilterRemove();
    }, [handleNameFilterRemove, handleStatusFilterRemove]);

    const navigate = useNavigate();
    // --- Filter UI Configuration ---

    const filters = [
        {
            key: 'nameFilter',
            label: 'Name',
            filter: (
                <TextField
                    label="Name"
                    value={nameFilter}
                    onChange={setNameFilter}
                    autoComplete="off"
                    labelHidden
                />
            ),
            shortcut: true,
        },
        {
            key: 'statusFilter',
            label: 'Status',
            filter: (
                <ChoiceList
                    title="Status"
                    titleHidden
                    choices={[
                        { label: 'Guest', value: 'guest' },
                        { label: 'Member', value: 'member' },
                    ]}
                    selected={statusFilter || []}
                    onChange={setStatusFilter}
                    allowMultiple
                />
            ),
            shortcut: true,
        },
    ];

    // --- Applied Filters "Pills" ---

    const appliedFilters = [];
    if (nameFilter && nameFilter.length > 0) {
        appliedFilters.push({
            key: 'nameFilter',
            label: `Name is "${nameFilter}"`,
            onRemove: handleNameFilterRemove,
        });
    }
    if (statusFilter && statusFilter.length > 0) {
        appliedFilters.push({
            key: 'statusFilter',
            label: `Status is ${statusFilter.join(', ')}`,
            onRemove: handleStatusFilterRemove,
        });
    }


    // --- Data Filtering Logic ---

    const filteredCustomers = useMemo(() => {
        let filtered = [...customers];

        // 1. Apply main search query (searches name and email)
        if (queryValue) {
            const lowercasedQuery = queryValue.toLowerCase();
            filtered = filtered.filter(customer =>
                (customer.name ?? '').toLowerCase().includes(lowercasedQuery) ||
                (customer.email ?? '').toLowerCase().includes(lowercasedQuery)
            );
        }

        // 2. Apply name filter
        if (nameFilter) {
            const lowercasedNameFilter = nameFilter.toLowerCase();
            filtered = filtered.filter(customer =>
                (customer.name ?? '').toLowerCase().includes(lowercasedNameFilter)
            );
        }

        // 3. Apply status filter
        if (statusFilter && statusFilter.length > 0) {
            filtered = filtered.filter(customer =>
                // This is safe, but adding a fallback is good practice
                statusFilter.includes(customer.source ?? '')
            );
        }

        return filtered;
    }, [customers, queryValue, nameFilter, statusFilter]);

    // --- Table Row Markup ---

    const rowMarkup = filteredCustomers.map((val, index) => (
        <IndexTable.Row
            id={val.shopify_cust_id}
            key={val.shopify_cust_id}
            position={index}
            onClick={() => navigate(`/customer/customerView`, { state: { id: val.shopify_cust_id } })}
        >
            <IndexTable.Cell>
                <Text variant='bodyMd' as="span">{val.email}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text variant='bodyMd' as="span">{val.name}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text variant='bodyMd' as="span">{val.source}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text variant='bodyMd' as="span">{val.referral_used}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text variant='bodyMd' as="span">{val.points_balance}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text variant='bodyMd' as="span">{val.total_spent}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text variant='bodyMd' as="span">{val.orders_count}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text variant='bodyMd' as="span"> {formatShortDate(val.registration_date)}</Text>
            </IndexTable.Cell>
        </IndexTable.Row >
    ));

    // --- Final Render ---

    return (
        <Page title="Customers"
            secondaryActions={
                <Select
                    label="Filter customers by type"
                    options={customerTypeOptions}
                    onChange={(value) => setCustomerType(value)}
                    value={customerType}
                />
            }
        >
            <Card padding="0">
                <div>
                    <IndexFilters
                        queryValue={queryValue}
                        queryPlaceholder="Search customers by name or email"
                        onQueryChange={setQueryValue}
                        onQueryClear={() => setQueryValue('')}
                        tabs={[]}
                        filters={filters}
                        appliedFilters={appliedFilters}
                        onClearAll={handleFiltersClearAll}
                        mode={IndexFiltersMode.Filtering}
                        setMode={() => { }}
                    />
                </div>
                <IndexTable
                    sortable={[false, false, false, false, true, true, true, true, true]}
                    resourceName={{ singular: 'customer', plural: 'customers' }}
                    itemCount={filteredCustomers.length}
                    selectable={false}
                    headings={[
                        { title: 'Email' },
                        { title: 'Name' },
                        { title: 'Status' },
                        { title: 'Referrals' },
                        { title: 'Points' },
                        { title: 'Orders' },
                        { title: 'Points Spent' },
                        { title: 'Date Joined' },
                    ]}
                >
                    {loading ? [...Array(10)].map((_, index) => (
                        <IndexTable.Row key={index} position={index}>
                            <IndexTable.Cell><SkeletonBodyText lines={1} /></IndexTable.Cell>
                            <IndexTable.Cell><SkeletonBodyText lines={1} /></IndexTable.Cell>
                            <IndexTable.Cell><SkeletonBodyText lines={1} /></IndexTable.Cell>
                            <IndexTable.Cell><SkeletonBodyText lines={1} /></IndexTable.Cell>
                            <IndexTable.Cell><SkeletonBodyText lines={1} /></IndexTable.Cell>
                            <IndexTable.Cell><SkeletonBodyText lines={1} /></IndexTable.Cell>
                            <IndexTable.Cell><SkeletonBodyText lines={1} /></IndexTable.Cell>
                            <IndexTable.Cell><SkeletonBodyText lines={1} /></IndexTable.Cell>
                        </IndexTable.Row>
                    )) : rowMarkup}
                </IndexTable>

                <BlockStack
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 20px",
                        backgroundColor: 'var(--p-color-bg-surface-secondary)',
                    }}
                >
                    <Box className='marginVertical'>
                        <InlineStack gap="300" blockAlign="center">
                            <Text>Show</Text>
                            <Select
                                options={options}
                                onChange={(selectedOption) => { setLimit(selectedOption), console.log(selectedOption) }}
                                value={limit}
                            />
                            <Text>Entries</Text>
                        </InlineStack>
                    </Box>
                    <InlineStack gap="300" blockAlign="center">
                        <Pagination
                            hasNext={paginationData?.hasNextPage}
                            hasPrevious={paginationData?.hasPreviousPage}
                            onNext={() => {
                                GetCustomersAPI(paginationData?.endCursor, '', 'first');
                            }}
                            onPrevious={() => {
                                GetCustomersAPI('', paginationData?.startCursor, 'last');
                            }}
                        />
                    </InlineStack>
                    <InlineStack gap="300">
                        <Button
                            variant="primary"
                            // onClick={exportToPDF}
                            style={{ marginRight: "10px" }}
                        >
                            PDF
                        </Button>
                    </InlineStack>
                </BlockStack>
            </Card>
        </Page>
    );
};

export default Customer;
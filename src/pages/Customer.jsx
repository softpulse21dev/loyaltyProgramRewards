import {
    Card,
    Text,
    Page,
    IndexFilters,
    IndexTable,
    useSetIndexFiltersMode,
    ChoiceList,
    TextField,
    Tooltip,
    IndexFiltersMode,
    Layout,
    LegacyCard,
    BlockStack,
    Box,
    InlineStack,
    Pagination,
    Select,
    Button
} from "@shopify/polaris";
import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const Customer = () => {
    // --- State Management for Filters ---

    // State for the main search query
    const [queryValue, setQueryValue] = useState('');

    // State for specific filters
    const [nameFilter, setNameFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState(undefined); // Use `undefined` for ChoiceList

    // Polaris hook to manage filter UI mode
    // const { mode, setMode } = useSetIndexFiltersMode();


    // --- Original Data ---
    const customers = [
        {
            id: "1",
            name: "Softpulse Dev1",
            email: "softplusedev010@gmail.com",
            points: "0 points",
            Storecredit: "0 Storecredit",
            vip: "No VIP tier",
            referrals: 0,
            dateJoined: "2025-01-01",
        },
        {
            id: "2",
            name: "mansi sp",
            email: "softplusedev002@gmail.com",
            points: "3,780 points",
            Storecredit: "0 Storecredit",
            vip: "No VIP tier",
            referrals: 1, // Added a different referrals for filtering example
            dateJoined: "2025-01-01",
        },
        {
            id: "3",
            name: "Softpulse Dev15",
            email: "softplusedev15@gmail.com",
            points: "0 points",
            Storecredit: "0 Storecredit",
            vip: "No VIP tier",
            referrals: 0,
            dateJoined: "2025-01-01",
        },
        {
            id: "4",
            name: "Karine Ruby",
            email: "karine.ruby@example.com",
            points: "0 points",
            Storecredit: "0 Storecredit",
            vip: "No VIP tier",
            referrals: 2, // Added a different status for filtering example
            dateJoined: "2025-01-01",
        },
    ];

    // --- Filter Handlers ---

    // `useCallback` is used for performance, preventing re-creation of these functions on every render
    const handleNameFilterRemove = useCallback(() => setNameFilter(''), []);
    const handleStatusFilterRemove = useCallback(() => setStatusFilter(undefined), []);
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
                        { label: 'Guest', value: 'Guest' },
                        { label: 'Member', value: 'Member' },
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

    // `useMemo` filters the data and only recalculates when dependencies change
    const filteredCustomers = useMemo(() => {
        let filtered = [...customers];

        // 1. Apply main search query (searches name and email)
        if (queryValue) {
            filtered = filtered.filter(customer =>
                customer.name.toLowerCase().includes(queryValue.toLowerCase()) ||
                customer.email.toLowerCase().includes(queryValue.toLowerCase())
            );
        }

        // 2. Apply name filter
        if (nameFilter) {
            filtered = filtered.filter(customer =>
                customer.name.toLowerCase().includes(nameFilter.toLowerCase())
            );
        }

        // 3. Apply status filter
        if (statusFilter && statusFilter.length > 0) {
            filtered = filtered.filter(customer =>
                statusFilter.includes(customer.status)
            );
        }

        return filtered;
    }, [customers, queryValue, nameFilter, statusFilter]);

    // --- Table Row Markup ---

    const rowMarkup = filteredCustomers.map((val, index) => (
        <IndexTable.Row
            id={val.id}
            key={val.id}
            position={index}
            onClick={() => navigate(`/customerView/`)}
        >
            <IndexTable.Cell>
                <Text variant='bodyMd' as="span">{val.id}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text variant='bodyMd' as="span" fontWeight="bold">{val.name}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text variant='bodyMd' as="span">{val.email}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text variant='bodyMd' as="span">{val.status}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text variant='bodyMd' as="span">{val.referrals}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text variant='bodyMd' as="span">{val.points}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text variant='bodyMd' as="span">{val.Storecredit}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text variant='bodyMd' as="span">{val.dateJoined}</Text>
            </IndexTable.Cell>
        </IndexTable.Row>
    ));

    // --- Final Render ---

    return (
        <Page title="Customers">
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
                    sortable={[false, false, false, false, true, true, true]}
                    resourceName={{ singular: 'customer', plural: 'customers' }}
                    itemCount={filteredCustomers.length}
                    selectable={false} // Set to true if you want checkboxes
                    headings={[
                        { title: 'Customer ID' },
                        { title: 'Name' },
                        { title: 'Email' },
                        { title: 'Status' },
                        { title: 'Referrals' },
                        { title: 'Points' },
                        { title: 'Store credit' },
                        { title: 'Date Joined' },
                    ]}
                >
                    {rowMarkup}
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
                            // options={ITEMS_PER_PAGE_OPTIONS}
                            // onChange={handleItemsPerPageChange}
                            // value={String(itemsPerPage)}
                            />
                            <Text>Entries</Text>
                        </InlineStack>
                    </Box>
                    <InlineStack gap="300" blockAlign="center">
                        <Text>
                            {/* {labels?.default?.showing} {currentPage} of{" "}
                            {Math.ceil(activeReturnData.length / itemsPerPage)} {labels?.default?.entries} */} showing 1 to 10 of 100 entries
                        </Text>
                        <Pagination
                        // label={currentPage}
                        // hasPrevious={currentPage > 1}
                        // onPrevious={() => setCurrentPage((prev) => prev - 1)}
                        // hasNext={currentPage * itemsPerPage < activeReturnData.length}
                        // onNext={() => setCurrentPage((prev) => prev + 1)}
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
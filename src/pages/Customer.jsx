import { Card, Text, Page, IndexFilters, IndexTable, ChoiceList, TextField, BlockStack, Box, InlineStack, Pagination, Select, Button, SkeletonBodyText, useSetIndexFiltersMode, IndexFiltersMode, Popover, DatePicker, Icon } from "@shopify/polaris";
import { CalendarIcon } from "@shopify/polaris-icons";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchData } from "../action";
import { formatShortDate } from "../utils";

const Customer = () => {
    const navigate = useNavigate();

    // --- Core Data State ---
    const [queryValue, setQueryValue] = useState('');
    const [customers, setCustomers] = useState([]);
    const [paginationData, setPaginationData] = useState({});
    const [customerType, setCustomerType] = useState('');
    const [limit, setLimit] = useState('15');
    const [loading, setLoading] = useState(false);

    // --- Sorting State ---
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('ascending');
    
    // Ref to track sort state for toggle logic (updated when state changes)
    const sortStateRef = useRef({ column: null, direction: 'ascending' });
    
    // Keep ref in sync with state
    useEffect(() => {
        sortStateRef.current = { column: sortColumn, direction: sortDirection };
    }, [sortColumn, sortDirection]);

    // --- Index Filters Mode ---
    const { mode, setMode } = useSetIndexFiltersMode();

    // --- Standard Filter State ---
    const [nameFilter, setNameFilter] = useState('');

    // --- DATE FILTER STATE ---
    const [orderDateRange, setOrderDateRange] = useState(''); // Holds 'today', 'last7', 'custom', etc.
    const [orderStartDate, setOrderStartDate] = useState(null);
    const [orderEndDate, setOrderEndDate] = useState(null);
    const [activePopover, setActivePopover] = useState(null);

    // DatePicker Navigation State
    const [{ month: orderStartMonth, year: orderStartYear }, setOrderStartDateObj] = useState({
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
    });
    const [{ month: orderEndMonth, year: orderEndYear }, setOrderEndDateObj] = useState({
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
    });

    // --- Numerical Range Filter States ---
    const [referralsRange, setReferralsRange] = useState({ min: '', max: '' });
    const [pointsRange, setPointsRange] = useState({ min: '', max: '' });
    const [ordersRange, setOrdersRange] = useState({ min: '', max: '' });
    const [pointsSpentRange, setPointsSpentRange] = useState({ min: '', max: '' });

    // --- Date Helper Logic ---
    const today = new Date();
    const last7Days = new Date(new Date().setDate(today.getDate() - 7));
    const last30Days = new Date(new Date().setDate(today.getDate() - 30));
    const last60Days = new Date(new Date().setDate(today.getDate() - 60));

    // Reusable component for numerical filters within the IndexFilter popover with Apply button
    const NumberRangeFilter = ({ rangeState, setRangeState, label, onClose }) => {
        const [localMin, setLocalMin] = useState(rangeState.min);
        const [localMax, setLocalMax] = useState(rangeState.max);

        // Sync local state with prop state when it changes externally (e.g., clear filters)
        useEffect(() => {
            setLocalMin(rangeState.min);
            setLocalMax(rangeState.max);
        }, [rangeState.min, rangeState.max]);

        const handleApply = () => {
            // Validate that maximum is not less than minimum
            const minNum = localMin ? parseFloat(localMin) : null;
            const maxNum = localMax ? parseFloat(localMax) : null;
            
            if (minNum !== null && maxNum !== null && maxNum < minNum) {
                // Don't apply if max is less than min
                return;
            }
            
            // Ensure only numeric values are applied
            let minValue = '';
            let maxValue = '';
            
            if (localMin && /^\d+$/.test(localMin)) {
                minValue = localMin;
            }
            
            if (localMax && /^\d+$/.test(localMax)) {
                maxValue = localMax;
            }
            
            setRangeState({ min: minValue, max: maxValue });
            // Close the filter popover after applying
            if (onClose) {
                setTimeout(() => {
                    onClose();
                }, 100);
            }
        };

        const handleMinChange = (value) => {
            // Only allow numeric digits (0-9) or empty string
            if (value === '' || /^\d+$/.test(value)) {
                setLocalMin(value);
            }
        };

        const handleMaxChange = (value) => {
            // Only allow numeric digits (0-9) or empty string
            if (value === '' || /^\d+$/.test(value)) {
                setLocalMax(value);
            }
        };

        const handleMinBlur = () => {
            // Clear if non-numeric value somehow got through
            if (localMin && !/^\d+$/.test(localMin)) {
                setLocalMin('');
            }
        };

        const handleMaxBlur = () => {
            // Clear if non-numeric value somehow got through
            if (localMax && !/^\d+$/.test(localMax)) {
                setLocalMax('');
            }
        };

        // Check if both fields are empty OR if maximum is less than minimum
        const minNum = localMin ? parseFloat(localMin) : null;
        const maxNum = localMax ? parseFloat(localMax) : null;
        const isMaxLessThanMin = minNum !== null && maxNum !== null && maxNum <= minNum;
        const isApplyDisabled = (!localMin && !localMax) || isMaxLessThanMin;

        return (
            <BlockStack gap="200">
                <Text variant="headingSm" as="h6">{label} Range</Text>
                <InlineStack gap="200" blockAlign="center">
                    <TextField
                        label="Minimum (More than)"
                        type="number"
                        placeholder="Min"
                        value={localMin}
                        onChange={handleMinChange}
                        onBlur={handleMinBlur}
                        autoComplete="off"
                        min={0}
                    />
                    
                    <TextField
                        label="Maximum (Less than)"
                        type="number"
                        placeholder="Max"
                        value={localMax}
                        onChange={handleMaxChange}
                        onBlur={handleMaxBlur}
                        autoComplete="off"
                        min={0}
                    />
                </InlineStack>
                <Box paddingBlockStart="200">
                    <Button variant="primary" onClick={handleApply} size="medium" disabled={isApplyDisabled}>
                        Apply
                    </Button>
                </Box>
            </BlockStack>
        );
    };

    const handleDateRangeChange = (value) => {
        const range = value[0]; // ChoiceList returns array
        setOrderDateRange(range);

        if (range === "today") {
            setOrderStartDate(today);
            setOrderEndDate(today);
        } else if (range === "last7") {
            setOrderStartDate(last7Days);
            setOrderEndDate(today);
        } else if (range === "last30") {
            setOrderStartDate(last30Days);
            setOrderEndDate(today);
        } else if (range === "last60") {
            setOrderStartDate(last60Days);
            setOrderEndDate(today);
        } else if (range === "custom") {
            setOrderStartDate(null);
            setOrderEndDate(null);
        }
    };

    const handleMonthChange = (setDateObj) => (month, year) => setDateObj({ month, year });

    const handleDateSelection = (setDate) => ({ end: newSelectedDate }) => {
        if (newSelectedDate) {
            // Adjust timezone offset if necessary, usually setting hours handles basic issues
            const localDate = new Date(newSelectedDate);
            localDate.setHours(12);
            setDate(localDate);
        }
        setActivePopover(null);
    };

    const formatDateForInput = (date) => date ? date.toISOString().slice(0, 10) : "";

    // --- Sort Handler (Client-side only - does NOT trigger API calls) ---
    const handleSort = useCallback((headingIndex, direction, id) => {
        // Map headingIndex to column name if id is not provided
        const columnMap = {
            1: 'name',
            3: 'referral_used',
            4: 'points_balance',
            5: 'orders_count',
            6: 'points_spent',
            7: 'registration_date'
        };
        
        // Use id if provided, otherwise use headingIndex mapping
        const columnId = id || columnMap[headingIndex];
        
        if (columnId) {
            // Check if clicking the same column - if so, toggle direction
            let newDirection = 'ascending';
            
            if (sortStateRef.current.column === columnId) {
                // Same column - toggle direction
                newDirection = sortStateRef.current.direction === 'ascending' ? 'descending' : 'ascending';
            } else {
                // New column - start with ascending
                newDirection = 'ascending';
            }
            
            // Update ref
            sortStateRef.current = { column: columnId, direction: newDirection };
            
            // Update state - NOTE: sortColumn and sortDirection are NOT in useEffect dependencies
            // so changing these will NOT trigger API calls - sorting is purely client-side
            setSortColumn(columnId);
            setSortDirection(newDirection);
        }
    }, []);

    // --- Sorted Customers (Client-side sorting) ---
    const sortedCustomers = useMemo(() => {
        if (!sortColumn || !customers || customers.length === 0) {
            return customers || [];
        }

        try {
            const sorted = [...customers].sort((a, b) => {
                let aValue = a[sortColumn];
                let bValue = b[sortColumn];

                // Handle null/undefined values
                if (aValue === null || aValue === undefined) aValue = '';
                if (bValue === null || bValue === undefined) bValue = '';

                // Handle different data types
                if (sortColumn === 'name') {
                    // String comparison (A-Z / Z-A)
                    aValue = String(aValue || '').toLowerCase().trim();
                    bValue = String(bValue || '').toLowerCase().trim();
                    const comparison = aValue.localeCompare(bValue, undefined, { numeric: true, sensitivity: 'base' });
                    return sortDirection === 'ascending' ? comparison : -comparison;
                } else if (sortColumn === 'registration_date') {
                    // Date comparison - handle various date formats
                    let aDate = 0;
                    let bDate = 0;
                    
                    if (aValue) {
                        const dateA = new Date(aValue);
                        aDate = isNaN(dateA.getTime()) ? 0 : dateA.getTime();
                    }
                    
                    if (bValue) {
                        const dateB = new Date(bValue);
                        bDate = isNaN(dateB.getTime()) ? 0 : dateB.getTime();
                    }
                    
                    const comparison = aDate - bDate;
                    return sortDirection === 'ascending' ? comparison : -comparison;
                } else {
                    // Numeric comparison (referral_used, points_balance, orders_count, points_spent)
                    // Handles 0-9 / 9-0 sorting
                    aValue = parseFloat(aValue) || 0;
                    bValue = parseFloat(bValue) || 0;
                    const comparison = aValue - bValue;
                    return sortDirection === 'ascending' ? comparison : -comparison;
                }
            });

            return sorted;
        } catch (error) {
            console.error('Sorting error:', error);
            return customers;
        }
    }, [customers, sortColumn, sortDirection]);

    // --- API Call ---
    const GetCustomersAPI = async (endCursor = '', startCursor = '', type) => {
        setLoading(true);
        try {
            const formData = new FormData();

            formData.append("customer_type", customerType);
            formData.append("search", queryValue);
            formData.append("limit", limit);
            formData.append("next", endCursor);
            formData.append("previous", startCursor);
            formData.append("type", type);

            // --- Constructing the Filter Object ---
            const filterObject = {
                // Date Logic: Send specific dates if they exist, otherwise send the range key
                date_range: Array.isArray(orderDateRange) ? orderDateRange[0] : (orderDateRange || ""),
                start_date: formatDateForInput(orderStartDate),
                end_date: formatDateForInput(orderEndDate),
                orders_min: ordersRange.min || "",
                orders_max: ordersRange.max || "",
            };

            // Only include other filters based on customerType
            if (customerType === 'member') {
                // Members: show everything
                filterObject.referrals_min = referralsRange.min || "";
                filterObject.referrals_max = referralsRange.max || "";
                filterObject.points_min = pointsRange.min || "";
                filterObject.points_max = pointsRange.max || "";
                filterObject.points_spent_min = pointsSpentRange.min || "";
                filterObject.points_spent_max = pointsSpentRange.max || "";
            } else if (customerType === 'guest') {
                // Guests: hide points_min, points_max, points_spent_min, points_spent_max
                filterObject.referrals_min = referralsRange.min || "";
                filterObject.referrals_max = referralsRange.max || "";
            }
            // If customerType is blank/undefined: only date and orders (already added above)

            formData.append("filters", JSON.stringify(filterObject));

            const response = await fetchData("/list-customer", formData);

            if (response?.status === true) {
                setCustomers(response.data);
                setPaginationData(response.pagination);
            } else {
                if (typeof shopify !== 'undefined' && shopify.toast) {
                    shopify.toast.show(response?.message, { duration: 2000, isError: true });
                }
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    }

    // Ref to store the debounce timeout
    const debounceTimerRef = useRef(null);

    // --- Effect to Trigger API ---
    useEffect(() => {
        // Clear any existing timeout
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Set a new timeout
        debounceTimerRef.current = setTimeout(() => {
            // Only trigger if not "Custom" OR if "Custom" and both dates are selected
            if (orderDateRange !== 'custom' || (orderDateRange === 'custom' && orderStartDate && orderEndDate)) {
                GetCustomersAPI();
            } else if (!orderDateRange) {
                GetCustomersAPI(); // Trigger if date filter is cleared
            }
        }, 500);

        // Cleanup function
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [
        customerType, limit, queryValue, nameFilter,
        orderDateRange, orderStartDate, orderEndDate, // Added specific date dependencies
        referralsRange.min, referralsRange.max, // Serialize range objects
        pointsRange.min, pointsRange.max,
        ordersRange.min, ordersRange.max,
        pointsSpentRange.min, pointsSpentRange.max
    ]);

    const customerTypeOptions = [
        { label: 'All', value: '' },
        { label: 'Guest', value: 'guest' },
        { label: 'Member', value: 'member' },
    ];
    const options = [
        { label: '15', value: '15' },
        { label: '30', value: '30' },
        { label: '50', value: '50' },
    ];

    // --- Filter Handlers ---

    const handleNameFilterRemove = useCallback(() => setNameFilter(''), []);
    const handleStatusFilterRemove = useCallback(() => setCustomerType(''), []);

    const handleDateRangeFilterRemove = useCallback(() => {
        setOrderDateRange('');
        setOrderStartDate(null);
        setOrderEndDate(null);
    }, []);

    const handleReferralsRangeRemove = useCallback(() => setReferralsRange({ min: '', max: '' }), []);
    const handlePointsRangeRemove = useCallback(() => setPointsRange({ min: '', max: '' }), []);
    const handleOrdersRangeRemove = useCallback(() => setOrdersRange({ min: '', max: '' }), []);
    const handlePointsSpentRangeRemove = useCallback(() => setPointsSpentRange({ min: '', max: '' }), []);

    const handleFiltersClearAll = useCallback(() => {
        handleNameFilterRemove();
        handleStatusFilterRemove();
        handleReferralsRangeRemove();
        handlePointsRangeRemove();
        handleOrdersRangeRemove();
        handlePointsSpentRangeRemove();
        handleDateRangeFilterRemove();
    }, [handleNameFilterRemove, handleStatusFilterRemove, handleDateRangeFilterRemove, handleReferralsRangeRemove, handlePointsRangeRemove, handleOrdersRangeRemove, handlePointsSpentRangeRemove]);

    // --- Helper to render Date Popover ---
    const renderDateFilter = (label, date, setDate, popoverKey, month, year, setDateObj, minDate) => (
        <Popover
            active={activePopover === popoverKey}
            autofocusTarget="none"
            preferredAlignment="left"
            preferredPosition="below"
            preventCloseOnChildOverlayClick
            onClose={() => setActivePopover(null)}
            activator={
                <TextField
                    placeholder="YYYY-MM-DD"
                    role="combobox"
                    label={label}
                    prefix={<Icon source={CalendarIcon} />}
                    value={date ? date.toISOString().slice(0, 10) : ""}
                    onFocus={() => setActivePopover(popoverKey)}
                    autoComplete="off"
                />
            }
        >
            <Card>
                <DatePicker
                    month={month}
                    year={year}
                    selected={date}
                    onMonthChange={handleMonthChange(setDateObj)}
                    onChange={handleDateSelection(setDate)}
                    disableDatesBefore={minDate}
                />
            </Card>
        </Popover>
    );

    // --- Filter UI Configuration ---

    const allFilters = [
        {
            key: "orderDate",
            label: 'Date Range',
            filter: (
                <>
                    <ChoiceList
                        title='Date Range'
                        titleHidden
                        choices={[
                            { label: 'Today', value: "today" },
                            { label: 'Last 7 Days', value: "last7" },
                            { label: 'Last 30 Days', value: "last30" },
                            { label: 'Last 60 Days', value: "last60" },
                            { label: 'Custom Range', value: "custom" },
                        ]}
                        selected={orderDateRange ? [orderDateRange] : []}
                        onChange={handleDateRangeChange}
                        allowMultiple={false}
                    />
                    {orderDateRange === "custom" && (
                        <Box paddingBlockStart="200">
                            <BlockStack gap="200">
                                {renderDateFilter("Start Date", orderStartDate, setOrderStartDate, "orderStart", orderStartMonth, orderStartYear, setOrderStartDateObj)}
                                {renderDateFilter("End Date", orderEndDate, setOrderEndDate, "orderEnd", orderEndMonth, orderEndYear, setOrderEndDateObj, orderStartDate)}
                            </BlockStack>
                        </Box>
                    )}
                </>
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
                    selected={customerType ? [customerType] : []}
                    onChange={(value) => setCustomerType(value[0] || '')}
                    allowMultiple={false}
                />
            ),
            shortcut: true,
        },
        {
            key: 'referralsRange',
            label: 'Referrals',
            filter: (
                <NumberRangeFilter
                    label="Referrals"
                    rangeState={referralsRange}
                    setRangeState={setReferralsRange}
                    onClose={() => setMode(IndexFiltersMode.Filtering)}
                />
            ),
            shortcut: true,
        },
        {
            key: 'pointsRange',
            label: 'Points',
            filter: (
                <NumberRangeFilter
                    label="Points"
                    rangeState={pointsRange}
                    setRangeState={setPointsRange}
                    onClose={() => setMode(IndexFiltersMode.Filtering)}
                />
            ),
            shortcut: true,
        },
        {
            key: 'ordersRange',
            label: 'Orders',
            filter: (
                <NumberRangeFilter
                    label="Orders"
                    rangeState={ordersRange}
                    setRangeState={setOrdersRange}
                    onClose={() => setMode(IndexFiltersMode.Filtering)}
                />
            ),
            shortcut: true,
        },
        {
            key: 'pointsSpentRange',
            label: 'Points Spent',
            filter: (
                <NumberRangeFilter
                    label="Points Spent"
                    rangeState={pointsSpentRange}
                    setRangeState={setPointsSpentRange}
                    onClose={() => setMode(IndexFiltersMode.Filtering)}
                />
            ),
            shortcut: true,
        },
    ];

    // Conditionally filter based on customerType
    const filters = allFilters.filter(filter => {
        // Always show status filter
        if (filter.key === 'statusFilter') {
            return true;
        }
        // If status is blank/undefined: only show date filter and ordersRange
        if (!customerType || customerType === '') {
            return filter.key === 'orderDate' || filter.key === 'ordersRange';
        }
        // If status is guest: hide pointsRange and pointsSpentRange
        if (customerType === 'guest') {
            return filter.key !== 'pointsRange' && filter.key !== 'pointsSpentRange';
        }
        // If status is member: show everything
        return true;
    });

    // --- Applied Filters "Pills" ---
    const getRangeLabel = (range) => {
        if (range.min !== '' && range.max !== '') return `Between ${range.min} and ${range.max}`;
        if (range.min !== '') return `Min: ${range.min}`;
        if (range.max !== '') return `Max: ${range.max}`;
        return '';
    };

    const appliedFilters = [];

    if (orderDateRange) {
        let label = '';
        if (orderDateRange === 'today') label = 'Today';
        else if (orderDateRange === 'last7') label = 'Last 7 Days';
        else if (orderDateRange === 'last30') label = 'Last 30 Days';
        else if (orderDateRange === 'last60') label = 'Last 60 Days';
        else if (orderDateRange === 'custom' && orderStartDate && orderEndDate) {
            label = `${formatDateForInput(orderStartDate)} - ${formatDateForInput(orderEndDate)}`;
        }

        if (label) {
            appliedFilters.push({
                key: 'orderDate',
                label: `Date: ${label}`,
                onRemove: handleDateRangeFilterRemove,
            });
        }
    }

    if (nameFilter) appliedFilters.push({ key: 'nameFilter', label: `Name is "${nameFilter}"`, onRemove: handleNameFilterRemove });
    if (customerType) appliedFilters.push({ key: 'statusFilter', label: `Status is ${customerType}`, onRemove: handleStatusFilterRemove });
    
    // Conditionally show filters based on customerType
    if (customerType === 'member') {
        // Members: show all filters
        if (referralsRange.min || referralsRange.max) appliedFilters.push({ key: 'referralsRange', label: `Referrals ${getRangeLabel(referralsRange)}`, onRemove: handleReferralsRangeRemove });
        if (pointsRange.min || pointsRange.max) appliedFilters.push({ key: 'pointsRange', label: `Points ${getRangeLabel(pointsRange)}`, onRemove: handlePointsRangeRemove });
        if (ordersRange.min || ordersRange.max) appliedFilters.push({ key: 'ordersRange', label: `Orders ${getRangeLabel(ordersRange)}`, onRemove: handleOrdersRangeRemove });
        if (pointsSpentRange.min || pointsSpentRange.max) appliedFilters.push({ key: 'pointsSpentRange', label: `Points Spent ${getRangeLabel(pointsSpentRange)}`, onRemove: handlePointsSpentRangeRemove });
    } else if (customerType === 'guest') {
        // Guests: hide points and pointsSpent
        if (referralsRange.min || referralsRange.max) appliedFilters.push({ key: 'referralsRange', label: `Referrals ${getRangeLabel(referralsRange)}`, onRemove: handleReferralsRangeRemove });
        if (ordersRange.min || ordersRange.max) appliedFilters.push({ key: 'ordersRange', label: `Orders ${getRangeLabel(ordersRange)}`, onRemove: handleOrdersRangeRemove });
    } else {
        // Blank/undefined: only show orders
        if (ordersRange.min || ordersRange.max) appliedFilters.push({ key: 'ordersRange', label: `Orders ${getRangeLabel(ordersRange)}`, onRemove: handleOrdersRangeRemove });
    }

    // --- Table Row Markup ---
    const rowMarkup = sortedCustomers.map((val, index) => (
        <IndexTable.Row
            id={val.shopify_cust_id}
            key={val.shopify_cust_id}
            position={index}
            onClick={() => navigate(`/customer/customerView`, { state: { id: val.shopify_cust_id } })}
        >
            <IndexTable.Cell><Text variant='bodyMd' as="span">{val.email}</Text></IndexTable.Cell>
            <IndexTable.Cell><Text variant='bodyMd' as="span">{val.name}</Text></IndexTable.Cell>
            <IndexTable.Cell><Text variant='bodyMd' as="span">{val.source}</Text></IndexTable.Cell>
            <IndexTable.Cell><Text variant='bodyMd' as="span">{val.referral_used}</Text></IndexTable.Cell>
            <IndexTable.Cell><Text variant='bodyMd' as="span">{val.points_balance}</Text></IndexTable.Cell>
            <IndexTable.Cell><Text variant='bodyMd' as="span">{val.orders_count}</Text></IndexTable.Cell>
            <IndexTable.Cell><Text variant='bodyMd' as="span">{val.points_spent}</Text></IndexTable.Cell>
            <IndexTable.Cell><Text variant='bodyMd' as="span"> {formatShortDate(val.registration_date)}</Text></IndexTable.Cell>
        </IndexTable.Row >
    ));

    return (
        <Page title="Customers"
            // secondaryActions={<Select label="Filter customers by type" options={customerTypeOptions} onChange={setCustomerType} value={customerType} />}
        >
            <Card padding="0">
                <div>
                    <IndexFilters
                        queryValue={queryValue}
                        queryPlaceholder="Search customers by name or email"
                        onQueryChange={setQueryValue}
                        onQueryClear={() => setQueryValue('')}
                        tabs={[]}
                        selected={0}
                        onSelect={() => { }}
                        canCreateNewView={false}
                        filters={filters}
                        appliedFilters={appliedFilters}
                        onClearAll={handleFiltersClearAll}
                        mode={IndexFiltersMode.Filtering}
                        setMode={setMode}
                    />
                </div>
                <IndexTable
                    sortable={[false, true, false, true, true, true, true, true]}
                    resourceName={{ singular: 'customer', plural: 'customers' }}
                    itemCount={sortedCustomers.length}
                    selectable={false}
                    headings={[
                        { title: 'Email' },
                        { title: 'Name', id: 'name' },
                        { title: 'Status' },
                        { title: 'Referrals', id: 'referral_used' },
                        { title: 'Points', id: 'points_balance' },
                        { title: 'Orders', id: 'orders_count' },
                        { title: 'Points Spent', id: 'points_spent' },
                        { title: 'Date Joined', id: 'registration_date' },
                    ]}
                    onSort={handleSort}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                >
                    {loading ? [...Array(8)].map((_, index) => (
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

                <BlockStack style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px", backgroundColor: 'var(--p-color-bg-surface-secondary)' }}>
                    <Box className='marginVertical'>
                        <InlineStack gap="300" blockAlign="center">
                            <Text>Show</Text>
                            <Select options={options} onChange={setLimit} value={limit} />
                            <Text>Entries</Text>
                        </InlineStack>
                    </Box>
                    <InlineStack gap="300" blockAlign="center">
                        <Pagination
                            hasNext={paginationData?.hasNextPage}
                            hasPrevious={paginationData?.hasPreviousPage}
                            onNext={() => GetCustomersAPI(paginationData?.endCursor, '', 'first')}
                            onPrevious={() => GetCustomersAPI('', paginationData?.startCursor, 'last')}
                        />
                    </InlineStack>
                    <InlineStack gap="300">
                        <Button variant="primary" style={{ marginRight: "10px" }}>PDF</Button>
                    </InlineStack>
                </BlockStack>
            </Card>
        </Page>
    );
};

export default Customer;
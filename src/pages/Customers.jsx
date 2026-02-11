import { Card, Text, Page, IndexFilters, IndexTable, ChoiceList, TextField, BlockStack, Box, InlineStack, Pagination, Select, Button, SkeletonBodyText, useSetIndexFiltersMode, IndexFiltersMode, Popover, DatePicker, Icon, Badge, useIndexResourceState } from "@shopify/polaris";
import { CalendarIcon } from "@shopify/polaris-icons";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchData } from "../action";
import { capitalizeFirst, formatShortDate } from "../utils";

const Customers = () => {
    const navigate = useNavigate();

    // --- Core Data State ---
    const [queryValue, setQueryValue] = useState('');
    const [customers, setCustomers] = useState([]);
    const [paginationData, setPaginationData] = useState({});
    const [customerType, setCustomerType] = useState('');
    const [limit, setLimit] = useState('15');
    const [loading, setLoading] = useState(true);
    const [vipTierList, setVipTierList] = useState([]); // State to hold the list R1, R2, etc.
    const [selectedVipTier, setSelectedVipTier] = useState(null);

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
    const [orderDateRange, setOrderDateRange] = useState('');
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

    const getRangeLabel = (range) => {
        if (range.min && range.max) {
            return `is between ${range.min} and ${range.max}`;
        } else if (range.min) {
            return `is more than ${range.min}`;
        } else if (range.max) {
            return `is less than ${range.max}`;
        }
        return "";
    };

    useEffect(() => {
        localStorage.removeItem("current_customer_view_id");
    }, []);

    // Reusable component for numerical filters within the IndexFilter popover with Apply button
    const NumberRangeFilter = ({ rangeState, setRangeState, label, onClose }) => {
        const [localMin, setLocalMin] = useState(rangeState.min);
        const [localMax, setLocalMax] = useState(rangeState.max);

        useEffect(() => {
            setLocalMin(rangeState.min);
            setLocalMax(rangeState.max);
        }, [rangeState.min, rangeState.max]);

        const handleApply = () => {
            const minNum = localMin ? parseFloat(localMin) : null;
            const maxNum = localMax ? parseFloat(localMax) : null;

            if (minNum !== null && maxNum !== null && maxNum < minNum) return;

            let minValue = '';
            let maxValue = '';

            if (localMin && /^\d+$/.test(localMin)) minValue = localMin;
            if (localMax && /^\d+$/.test(localMax)) maxValue = localMax;

            setRangeState({ min: minValue, max: maxValue });
            if (onClose) {
                setTimeout(() => { onClose(); }, 100);
            }
        };

        const handleMinChange = (value) => {
            if (value === '' || /^\d+$/.test(value)) setLocalMin(value);
        };

        const handleMaxChange = (value) => {
            if (value === '' || /^\d+$/.test(value)) setLocalMax(value);
        };

        const handleMinBlur = () => {
            if (localMin && !/^\d+$/.test(localMin)) setLocalMin('');
        };

        const handleMaxBlur = () => {
            if (localMax && !/^\d+$/.test(localMax)) setLocalMax('');
        };

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
        const range = value[0];
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
            const localDate = new Date(newSelectedDate);
            localDate.setHours(12);
            setDate(localDate);
        }
        setActivePopover(null);
    };

    const formatDateForInput = (date) => date ? date.toISOString().slice(0, 10) : "";

    // --- Sort Handler ---
    const handleSort = useCallback((headingIndex, direction, id) => {
        const columnMap = {
            1: 'name',
            3: 'referral_used',
            4: 'points_balance',
            5: 'orders_count',
            6: 'total_spent',
            7: 'vip_tier_name',
            8: 'registration_date',
        };

        const columnId = id || columnMap[headingIndex];

        if (columnId) {
            let newDirection = 'ascending';
            if (sortStateRef.current.column === columnId) {
                newDirection = sortStateRef.current.direction === 'ascending' ? 'descending' : 'ascending';
            }
            sortStateRef.current = { column: columnId, direction: newDirection };
            setSortColumn(columnId);
            setSortDirection(newDirection);
        }
    }, []);

    // --- Sorted Customers ---
    const sortedCustomers = useMemo(() => {
        if (!sortColumn || !customers || customers.length === 0) {
            return customers || [];
        }

        try {
            const sorted = [...customers].sort((a, b) => {
                let aValue = a[sortColumn];
                let bValue = b[sortColumn];

                if (aValue === null || aValue === undefined) aValue = '';
                if (bValue === null || bValue === undefined) bValue = '';

                if (sortColumn === 'name') {
                    aValue = String(aValue || '').toLowerCase().trim();
                    bValue = String(bValue || '').toLowerCase().trim();
                    const comparison = aValue.localeCompare(bValue, undefined, { numeric: true, sensitivity: 'base' });
                    return sortDirection === 'ascending' ? comparison : -comparison;
                } // --- FIX: Updated Reward Tier Sorting Logic ---
                else if (sortColumn === 'vip_tier_name') {
                    const tierList = Array.isArray(vipTierList) ? vipTierList : [];
                    const aStr = String(aValue || '').trim();
                    const bStr = String(bValue || '').trim();

                    if (tierList.length > 0) {
                        let indexA = -1;
                        let indexB = -1;

                        for (let i = 0; i < tierList.length; i++) {
                            // OLD: const tierValue = String(tierList[i] || '').trim();
                            // NEW: Extract title from the object
                            const item = tierList[i];
                            const tierValue = (item?.title ? String(item.title) : String(item || '')).trim();

                            if (tierValue.toLowerCase() === aStr.toLowerCase()) indexA = i;
                            if (tierValue.toLowerCase() === bStr.toLowerCase()) indexB = i;
                        }

                        // If tier not found in list, push to end
                        if (indexA === -1) indexA = Number.MAX_SAFE_INTEGER;
                        if (indexB === -1) indexB = Number.MAX_SAFE_INTEGER;

                        const comparison = indexA - indexB;
                        return sortDirection === 'ascending' ? comparison : -comparison;
                    } else {
                        // Fallback to alphabetical if list is empty
                        const comparison = aStr.localeCompare(bStr, undefined, { numeric: true, sensitivity: 'base' });
                        return sortDirection === 'ascending' ? comparison : -comparison;
                    }
                } else if (sortColumn === 'registration_date') {
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
                } else if (sortColumn === 'total_spent' || sortColumn === 'points_spent') {
                    aValue = parseFloat(aValue) || 0;
                    bValue = parseFloat(bValue) || 0;
                    const comparison = aValue - bValue;
                    return sortDirection === 'ascending' ? comparison : -comparison;
                } else {
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
    }, [customers, sortColumn, sortDirection, vipTierList]);

    // --- Selection Logic ---
    const selectableCustomers = useMemo(() => {
        return sortedCustomers.filter(c => {
            const source = c.source ? c.source.toLowerCase() : '';
            return source !== 'guest';
        });
    }, [sortedCustomers]);

    const {
        selectedResources,
        allResourcesSelected,
        handleSelectionChange,
        clearSelection,
    } = useIndexResourceState(selectableCustomers, {
        resourceIDResolver: (data) => String(data.id),
    });

    const handleSelectionChangeWrapper = useCallback((selectionType, isSelected, selectionId) => {
        if (selectionType === 'page') {
            if (allResourcesSelected) {
                clearSelection();
            } else {
                handleSelectionChange(selectionType, true);
            }
        } else {
            handleSelectionChange(selectionType, isSelected, selectionId);
        }
    }, [allResourcesSelected, handleSelectionChange, clearSelection]);

    const promotedBulkActions = useMemo(() => [
        {
            content: <Text>Clear Selection</Text>,
            onAction: () => { clearSelection(); },
        },
        {
            content: <Text>Exclude Selected</Text>,
            onAction: () => { HandleExcludeProgramApi(1); },
        },
        {
            content: <Text>Include Selected</Text>,
            onAction: () => { HandleExcludeProgramApi(0); },
        },
    ], [selectedResources]);

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
            // formData.append("vip_tier_name", selectedVipTier || "");

            const filterObject = {
                date_range: Array.isArray(orderDateRange) ? orderDateRange[0] : (orderDateRange || ""),
                start_date: formatDateForInput(orderStartDate),
                end_date: formatDateForInput(orderEndDate),
                orders_min: ordersRange.min || "",
                orders_max: ordersRange.max || "",
                vip_tier_id: selectedVipTier || "",
            };

            if (customerType === 'member') {
                filterObject.referrals_min = referralsRange.min || "";
                filterObject.referrals_max = referralsRange.max || "";
                filterObject.points_min = pointsRange.min || "";
                filterObject.points_max = pointsRange.max || "";
                filterObject.points_spent_min = pointsSpentRange.min || "";
                filterObject.points_spent_max = pointsSpentRange.max || "";
            }

            formData.append("filters", JSON.stringify(filterObject));
            const response = await fetchData("/list-customer", formData);
            console.log('response_debug', response);

            if (response?.status === true) {
                setCustomers(response.data);

                // --- FIX: Check where the list actually resides ---
                // If response.data is an Array, it cannot contain vip_tier_list.
                // It is likely response.vip_tier_list
                const fetchedTierList = response.vip_tier_list || response.data?.vip_tier_list || [];
                setVipTierList(fetchedTierList);

                setPaginationData(response.pagination);
                clearSelection();
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

    const HandleExcludeProgramApi = async (status) => {
        try {
            const formData = new FormData();
            formData.append("customer_ids", JSON.stringify(selectedResources));
            formData.append("is_excluded", status);
            const response = await fetchData("/toggle-customer-exclusion", formData);
            if (response?.status === true) {
                GetCustomersAPI();
                shopify.toast.show(response?.message, { duration: 2000 });
            } else {
                shopify.toast.show(response?.message, { duration: 2000, isError: true });
            }
        } catch (error) {
            console.error('Error excluding program:', error);
        }
        finally {
            setLoading(false);
        }
    }

    // Debounce API Trigger
    const debounceTimerRef = useRef(null);
    useEffect(() => {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

        debounceTimerRef.current = setTimeout(() => {
            if (orderDateRange !== 'custom' || (orderDateRange === 'custom' && orderStartDate && orderEndDate)) {
                GetCustomersAPI();
            } else if (!orderDateRange) {
                GetCustomersAPI();
            }
        }, 500);

        return () => { if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); };
    }, [
        customerType, limit, queryValue, nameFilter,
        orderDateRange, orderStartDate, orderEndDate,
        referralsRange.min, referralsRange.max,
        pointsRange.min, pointsRange.max,
        ordersRange.min, ordersRange.max,
        pointsSpentRange.min, pointsSpentRange.max,
        selectedVipTier
    ]);

    const customerTypeOptions = [
        { label: 'All', value: '' },
        { label: 'Guest', value: 'guest' },
        { label: 'Member', value: 'member' },
    ];

    // --- Constant for Pagination ---
    const paginationOptions = [
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
    const handleVipTierFilterRemove = useCallback(() => setSelectedVipTier(null), []);

    const handleFiltersClearAll = useCallback(() => {
        handleNameFilterRemove();
        handleStatusFilterRemove();
        handleReferralsRangeRemove();
        handlePointsRangeRemove();
        handleOrdersRangeRemove();
        handlePointsSpentRangeRemove();
        handleVipTierFilterRemove();
        handleDateRangeFilterRemove();
    }, [handleNameFilterRemove, handleStatusFilterRemove, handleDateRangeFilterRemove, handleReferralsRangeRemove, handlePointsRangeRemove, handleOrdersRangeRemove, handlePointsSpentRangeRemove, handleVipTierFilterRemove]);

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
                    disableDatesAfter={today}
                />
            </Card>
        </Popover>
    );

    // --- FIX: Create a NEW array for VIP options, do not mutate global options ---
    // --- FIX: Add a default option so the first real tier isn't auto-selected ---
    const vipTierOptions = useMemo(() => {
        // Initialize with a default "All" option with an empty value
        const generatedOptions = [{ label: 'All', value: '' }];

        if (Array.isArray(vipTierList) && vipTierList.length > 0) {
            vipTierList.forEach(tier => {
                // Extract 'title' for label and 'uid' for value
                const tierName = tier?.title ? String(tier.title).trim() : '';
                const tierId = tier?.uid ? String(tier.uid).trim() : '';

                if (tierName && tierId) {
                    generatedOptions.push({ label: tierName, value: tierId });
                }
            });
        }
        return generatedOptions;
    }, [vipTierList]);

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
                        { label: 'Excluded', value: 'excluded' },
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
        {
            key: 'vipTierFilter',
            label: 'Reward Tier',
            filter: (
                <Select
                    label="Reward Tier"
                    options={vipTierOptions}
                    value={selectedVipTier || ''}
                    onChange={(value) => setSelectedVipTier(value || null)}
                />
            ),
            shortcut: true,
        },
    ];

    const filters = allFilters.filter(filter => {
        if (filter.key === 'statusFilter') return true;
        if (!customerType || customerType === '') return filter.key === 'orderDate' || filter.key === 'ordersRange';
        if (customerType === 'guest') {
            return filter.key !== 'pointsRange' && filter.key !== 'pointsSpentRange' && filter.key !== 'referralsRange' && filter.key !== 'vipTierFilter';
        }
        return true;
    });

    // --- Applied Filters "Pills" ---
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
        if (label) appliedFilters.push({ key: 'orderDate', label: `Date: ${label}`, onRemove: handleDateRangeFilterRemove });
    }

    if (nameFilter) appliedFilters.push({ key: 'nameFilter', label: `Name is "${nameFilter}"`, onRemove: handleNameFilterRemove });
    if (customerType) appliedFilters.push({ key: 'statusFilter', label: `Status is ${customerType}`, onRemove: handleStatusFilterRemove });

    if (customerType === 'member') {
        if (referralsRange.min || referralsRange.max) appliedFilters.push({ key: 'referralsRange', label: `Referrals ${getRangeLabel(referralsRange)}`, onRemove: handleReferralsRangeRemove });
        if (pointsRange.min || pointsRange.max) appliedFilters.push({ key: 'pointsRange', label: `Points ${getRangeLabel(pointsRange)}`, onRemove: handlePointsRangeRemove });
        if (ordersRange.min || ordersRange.max) appliedFilters.push({ key: 'ordersRange', label: `Orders ${getRangeLabel(ordersRange)}`, onRemove: handleOrdersRangeRemove });
        if (pointsSpentRange.min || pointsSpentRange.max) appliedFilters.push({ key: 'pointsSpentRange', label: `Points Spent ${getRangeLabel(pointsSpentRange)}`, onRemove: handlePointsSpentRangeRemove });
        if (selectedVipTier) appliedFilters.push({ key: 'vipTierFilter', label: `Reward Tier is ${vipTierList.find(t => t.uid === selectedVipTier)?.title || ''}`, onRemove: handleVipTierFilterRemove });
    } else if (customerType === 'guest') {
        if (ordersRange.min || ordersRange.max) appliedFilters.push({ key: 'ordersRange', label: `Orders ${getRangeLabel(ordersRange)}`, onRemove: handleOrdersRangeRemove });
    } else {
        if (ordersRange.min || ordersRange.max) appliedFilters.push({ key: 'ordersRange', label: `Orders ${getRangeLabel(ordersRange)}`, onRemove: handleOrdersRangeRemove });
    }

    const isFilterDisabled = selectedResources.length > 0 || allResourcesSelected;

    // --- Table Row Markup ---
    const rowMarkup = sortedCustomers.map((val, index) => {
        const isGuest = val.source && val.source.toLowerCase() === 'guest';
        const isSelected = selectedResources.includes(String(val.id));

        return (
            <IndexTable.Row
                id={val.id}
                key={val.shopify_cust_id}
                position={index}
                selected={isSelected}
                disabled={isGuest}
                onClick={isGuest ? undefined : () => {
                    localStorage.setItem("current_customer_view_id", val.shopify_cust_id);
                    navigate(`/customer/customerView`, { state: { id: val.shopify_cust_id } });
                }}
            >
                <IndexTable.Cell><Text variant='bodyMd' as="span">{val.email}</Text></IndexTable.Cell>
                <IndexTable.Cell><Text variant='bodyMd' as="span">{val.name}</Text></IndexTable.Cell>
                <IndexTable.Cell>
                    <Badge tone={val?.source === 'guest' ? 'enabled' : val?.source === 'member' ? 'success' : 'critical'}>
                        {capitalizeFirst(val?.source)}
                    </Badge>
                </IndexTable.Cell>
                <IndexTable.Cell><Text variant='bodyMd' as="span">{val.referral_used}</Text></IndexTable.Cell>
                <IndexTable.Cell><Text variant='bodyMd' as="span">{val.points_balance}</Text></IndexTable.Cell>
                <IndexTable.Cell><Text variant='bodyMd' as="span">{val.orders_count}</Text></IndexTable.Cell>
                <IndexTable.Cell><Text variant='bodyMd' as="span">{val.total_spent}</Text></IndexTable.Cell>
                <IndexTable.Cell><Text variant='bodyMd' as="span">{val.vip_tier_name}</Text></IndexTable.Cell>
                <IndexTable.Cell><Text variant='bodyMd' as="span"> {formatShortDate(val.registration_date)}</Text></IndexTable.Cell>
            </IndexTable.Row >
        );
    });

    return (
        <Page title="Customers" fullWidth>
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
                        disabled={isFilterDisabled}
                    />
                </div>
                <IndexTable
                    sortable={[false, true, false, true, true, true, true, true, true]}
                    resourceName={{ singular: 'customer', plural: 'customers' }}
                    itemCount={loading ? 8 : sortedCustomers.length}
                    selectable={true}
                    selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
                    onSelectionChange={handleSelectionChangeWrapper}
                    promotedBulkActions={promotedBulkActions}
                    headings={[
                        { title: 'Email' },
                        { title: 'Name', id: 'name' },
                        { title: 'Status' },
                        { title: 'Referrals', id: 'referral_used' },
                        { title: 'Points', id: 'points_balance' },
                        { title: 'Orders', id: 'orders_count' },
                        { title: 'Points Spent', id: 'total_spent' },
                        { title: 'Reward Tier', id: 'vip_tier_name' },
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
                            <IndexTable.Cell><SkeletonBodyText lines={1} /></IndexTable.Cell>
                        </IndexTable.Row>
                    )) : rowMarkup}
                </IndexTable>

                <BlockStack style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px", backgroundColor: 'var(--p-color-bg-surface-secondary)' }}>
                    <Box className='marginVertical'>
                        <InlineStack gap="300" blockAlign="center">
                            <Text>Show</Text>
                            {/* FIX: Use the specific pagination options constant */}
                            <Select options={paginationOptions} onChange={setLimit} value={limit} disabled={isFilterDisabled} />
                            <Text>Entries</Text>
                        </InlineStack>
                    </Box>
                    <InlineStack gap="300" blockAlign="center">
                        <Pagination
                            hasNext={!isFilterDisabled && paginationData?.hasNextPage}
                            hasPrevious={!isFilterDisabled && paginationData?.hasPreviousPage}
                            onNext={() => GetCustomersAPI(paginationData?.endCursor, '', 'first')}
                            onPrevious={() => GetCustomersAPI('', paginationData?.startCursor, 'last')}
                        />
                    </InlineStack>
                </BlockStack>
            </Card>
        </Page>
    );
};

export default Customers;
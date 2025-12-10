import { BlockStack, Box, Button, DatePicker, Icon, InlineStack, OptionList, Popover, Scrollable, Select, TextField, useBreakpoints } from "@shopify/polaris";
import { CalendarIcon } from "@shopify/polaris-icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function DateRangePicker({ inputValues, setInputValues, getDashboardData }) {
    const { mdDown, lgUp } = useBreakpoints();
    const shouldShowMultiMonth = lgUp;
    const datePickerRef = useRef(null);

    const today = useMemo(() => new Date(new Date().setHours(0, 0, 0, 0)), []);
    const yesterday = useMemo(() => {
        const y = new Date(today);
        y.setDate(y.getDate() - 1);
        return y;
    }, [today]);
    const startOfLastMonth = useMemo(() => new Date(today.getFullYear(), today.getMonth() - 1, 1), [today]);
    const endOfLastMonth = useMemo(() => new Date(today.getFullYear(), today.getMonth(), 0), [today]);

    const formatDateToYearMonthDayDateString = (date) => {
        if (!(date instanceof Date) || isNaN(date)) return '';
        const year = String(date.getFullYear());
        let month = String(date.getMonth() + 1).padStart(2, "0");
        let day = String(date.getDate()).padStart(2, "0");
        return [year, month, day].join("-");
    };

    // FIX: Return an invalid date on bad parse for more reliable validation
    const parseYearMonthDayDateString = (input) => {
        const [year, month, day] = input.split("-").map(Number);
        if (!year || !month || !day) return new Date(NaN);
        return new Date(year, month - 1, day);
    };

    const isValidDate = (dateString) => {
        const date = parseYearMonthDayDateString(dateString);
        return date instanceof Date && !isNaN(date);
    };

    const ranges = useCallback(() => [
        { title: 'today', alias: "today", period: { since: today, until: today } },
        { title: 'yesterday', alias: "yesterday", period: { since: yesterday, until: yesterday } },
        { title: 'last7days', alias: "last7days", period: { since: new Date(new Date().setDate(today.getDate() - 7)), until: today } },
        { title: 'last30days', alias: "last30days", period: { since: new Date(new Date().setDate(today.getDate() - 29)), until: today } },
        { title: 'last90days', alias: "last90days", period: { since: new Date(new Date().setDate(today.getDate() - 90)), until: today } },
        { title: 'lastmonth', alias: "lastmonth", period: { since: startOfLastMonth, until: endOfLastMonth } },
        { title: 'custom', alias: "custom", period: { since: today, until: today } }
    ], [today, yesterday, startOfLastMonth, endOfLastMonth]);

    const [popoverActive, setPopoverActive] = useState(false);
    const [draftDateRange, setDraftDateRange] = useState(null);
    const [draftInputValues, setDraftInputValues] = useState({ since: '', until: '' });
    // NEW: State to hold validation errors
    const [validationErrors, setValidationErrors] = useState({ since: '', until: '' });
    const [{ month, year }, setDate] = useState({ month: today.getMonth(), year: today.getFullYear() });

    useEffect(() => {
        if (popoverActive) {
            setValidationErrors({ since: '', until: '' }); // Clear errors on open
            const sinceDate = parseYearMonthDayDateString(inputValues.since);
            const untilDate = parseYearMonthDayDateString(inputValues.until);
            const initialRange = ranges().find(range =>
                formatDateToYearMonthDayDateString(range.period.since) === inputValues.since &&
                formatDateToYearMonthDayDateString(range.period.until) === inputValues.until
            ) || {
                alias: "custom",
                title: 'custom',
                period: { since: sinceDate, until: untilDate },
            };
            setDraftDateRange(initialRange);
            setDraftInputValues({ since: inputValues.since, until: inputValues.until });
            setDate({ month: untilDate.getMonth(), year: untilDate.getFullYear() });
        }
    }, [popoverActive, inputValues.since, inputValues.until, ranges]);

    const handleMonthChange = useCallback((month, year) => setDate({ month, year }), []);

    const handleStartInputValueChange = useCallback((value) => {
        // Clear error on type
        if (validationErrors.since) {
            setValidationErrors(prev => ({ ...prev, since: '' }));
        }
        setDraftInputValues((prevState) => ({ ...prevState, since: value }));
        if (isValidDate(value)) {
            const newSince = parseYearMonthDayDateString(value);
            setDraftDateRange((prevState) => {
                const newPeriod = prevState.period && newSince <= prevState.period.until
                    ? { since: newSince, until: prevState.period.until }
                    : { since: newSince, until: newSince };
                return { ...prevState, alias: 'custom', period: newPeriod };
            });
        }
    }, [validationErrors.since]);

    const handleEndInputValueChange = useCallback((value) => {
        // Clear error on type
        if (validationErrors.until) {
            setValidationErrors(prev => ({ ...prev, until: '' }));
        }
        setDraftInputValues((prevState) => ({ ...prevState, until: value }));
        if (isValidDate(value)) {
            const newUntil = parseYearMonthDayDateString(value);
            setDraftDateRange((prevState) => {
                const newPeriod = prevState.period && newUntil >= prevState.period.since
                    ? { since: prevState.period.since, until: newUntil }
                    : { since: newUntil, until: newUntil };
                return { ...prevState, alias: 'custom', period: newPeriod };
            });
        }
    }, [validationErrors.until]);

    // NEW: Validation on blur
    const handleInputBlur = useCallback((field) => {
        const value = draftInputValues[field];
        if (value && !isValidDate(value)) {
            setValidationErrors(prev => ({ ...prev, [field]: 'Invalid format. Use YYYY-MM-DD.' }));
        } else {
            setValidationErrors(prev => ({ ...prev, [field]: '' }));
        }
    }, [draftInputValues]);

    const handleCalendarChange = useCallback(({ start, end }) => {
        const newDateRange = ranges().find((range) =>
            range.period.since.valueOf() === start.valueOf() && range.period.until.valueOf() === end.valueOf()
        ) || {
            alias: "custom",
            title: 'custom',
            period: { since: start, until: end },
        };
        setDraftDateRange(newDateRange);
        setDraftInputValues({
            since: formatDateToYearMonthDayDateString(start),
            until: formatDateToYearMonthDayDateString(end),
        });
        setValidationErrors({ since: '', until: '' }); // Clear errors
    }, [ranges]);

    const handleRangeChange = (value) => {
        const newRange = ranges().find((range) => range.alias === (Array.isArray(value) ? value[0] : value));
        if (newRange) {
            setDraftDateRange(newRange);
            setDraftInputValues({
                since: formatDateToYearMonthDayDateString(newRange.period.since),
                until: formatDateToYearMonthDayDateString(newRange.period.until),
            });
            setValidationErrors({ since: '', until: '' }); // Clear errors
        }
    };

    const apply = useCallback(() => {
        // Add guard against invalid dates
        if (!draftDateRange || !isValidDate(draftInputValues.since) || !isValidDate(draftInputValues.until)) return;
        setPopoverActive(false);
        const newSince = formatDateToYearMonthDayDateString(draftDateRange.period.since);
        const newUntil = formatDateToYearMonthDayDateString(draftDateRange.period.until);

        setInputValues({ since: newSince, until: newUntil });
        if (getDashboardData) {
            getDashboardData(newSince, newUntil);
        }
    }, [draftDateRange, draftInputValues, setInputValues, getDashboardData]);

    const cancel = useCallback(() => {
        setPopoverActive(false);
    }, []);

    const getButtonValue = () => {
        const committedRange = ranges().find(range =>
            formatDateToYearMonthDayDateString(range.period.since) === inputValues.since &&
            formatDateToYearMonthDayDateString(range.period.until) === inputValues.until
        );
        return committedRange ? committedRange.title : `${inputValues.since} - ${inputValues.until}`;
    };

    const activator = (
        <Button size="slim" icon={CalendarIcon} onClick={() => setPopoverActive(!popoverActive)} >
            {getButtonValue()}
        </Button>
    );

    const rangeOptions = ranges().map((range) => ({ value: range.alias, label: range.title }));

    if (!draftDateRange) {
        return activator;
    }

    const DatePickerContent = (
        <BlockStack gap="400">
            <InlineStack gap="200" align="center">
                <div style={{ flex: 1 }}>
                    <TextField
                        label={'since'}
                        labelHidden
                        prefix={<Icon source={CalendarIcon} />}
                        placeholder="YYYY-MM-DD"
                        value={draftInputValues.since}
                        onChange={handleStartInputValueChange}
                        onBlur={() => handleInputBlur('since')}
                        error={validationErrors.since}
                        autoComplete="off"
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <TextField
                        label={'until'}
                        labelHidden
                        prefix={<Icon source={CalendarIcon} />}
                        placeholder="YYYY-MM-DD"
                        value={draftInputValues.until}
                        onChange={handleEndInputValueChange}
                        onBlur={() => handleInputBlur('until')}
                        error={validationErrors.until}
                        autoComplete="off"
                    />
                </div>
            </InlineStack>
            <DatePicker
                month={month}
                year={year}
                selected={{ start: draftDateRange.period.since, end: draftDateRange.period.until }}
                onMonthChange={handleMonthChange}
                onChange={handleCalendarChange}
                multiMonth={shouldShowMultiMonth}
                allowRange
            />
        </BlockStack>
    );

    const ActionFooter = (
        <Box paddingBlockStart="200" borderBlockStart="divider">
            <InlineStack align="end" gap="200">
                <Button onClick={cancel}>{'cancel'}</Button>
                <Button variant="primary" onClick={apply} disabled={!!validationErrors.since || !!validationErrors.until}>
                    {'apply'}
                </Button>
            </InlineStack>
        </Box>
    );

    return (
        <Popover
            active={popoverActive}
            autofocusTarget="none"
            preferredAlignment="left"
            preferredPosition="below"
            fluidContent
            sectioned={false}
            fullHeight
            activator={activator}
            onClose={() => setPopoverActive(false)}
        >
            <Popover.Pane captureOverscroll fixed>
                {mdDown ? (
                    <Scrollable style={{ maxHeight: 'calc(100vh - 10rem)' }}>
                        <Box padding="400">
                            <BlockStack gap="400">
                                <Select
                                    label="Date range"
                                    labelHidden
                                    options={rangeOptions}
                                    value={draftDateRange.alias}
                                    onChange={handleRangeChange}
                                />
                                {DatePickerContent}
                                {ActionFooter}
                            </BlockStack>
                        </Box>
                    </Scrollable>
                ) : (
                    <div style={{ width: '760px' }} ref={datePickerRef}>
                        <InlineStack wrap={false} gap={0}>
                            <Box minWidth="212px" padding="200" borderInlineEnd="divider" background="bg-surface-secondary" >
                                <OptionList
                                    options={rangeOptions}
                                    selected={[draftDateRange.alias]}
                                    onChange={handleRangeChange}
                                />
                            </Box>
                            <Box padding="400">
                                <BlockStack gap="400">
                                    {DatePickerContent}
                                    {ActionFooter}
                                </BlockStack>
                            </Box>
                        </InlineStack>
                    </div>
                )}
            </Popover.Pane>
        </Popover>
    );
}

export default DateRangePicker;
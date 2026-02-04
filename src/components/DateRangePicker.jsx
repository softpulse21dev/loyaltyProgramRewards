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

    const minDate = useMemo(() => {
        const d = new Date(today);
        d.setFullYear(today.getFullYear() - 100);
        return d;
    }, [today]);

    const isValidDate = useCallback((dateString) => {
        const parts = dateString.split("-");
        if (parts.length !== 3) return false;
        const [year, month, day] = parts;
        if (year.length !== 4 || month.length !== 2 || day.length !== 2) return false;

        const date = parseYearMonthDayDateString(dateString);
        if (!(date instanceof Date && !isNaN(date))) return false;

        // Ensure it's a real date (e.g. no Feb 31)
        if (date.getFullYear() !== parseInt(year, 10) ||
            (date.getMonth() + 1) !== parseInt(month, 10) ||
            date.getDate() !== parseInt(day, 10)) {
            return false;
        }

        return true;
    }, []);

    const ranges = useCallback(() => [
        { title: 'Today', alias: "today", period: { since: today, until: today } },
        { title: 'Yesterday', alias: "yesterday", period: { since: yesterday, until: yesterday } },
        { title: 'Last 7 Days', alias: "last7days", period: { since: new Date(new Date().setDate(today.getDate() - 6)), until: today } },
        { title: 'Last 30 Days', alias: "last30days", period: { since: new Date(new Date().setDate(today.getDate() - 29)), until: today } },
        { title: 'Last 90 Days', alias: "last90days", period: { since: new Date(new Date().setDate(today.getDate() - 90)), until: today } },
        { title: 'Last Month', alias: "lastmonth", period: { since: startOfLastMonth, until: endOfLastMonth } },
        { title: 'Custom', alias: "custom", period: { since: today, until: today } }
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
        let sanitizedValue = value.replace(/[^0-9-]/g, '');
        const parts = sanitizedValue.split('-');
        if (parts[0] && parts[0].length > 4) return;
        if (parts[1] && parseInt(parts[1], 10) > 12) return;
        if (parts[2] && parseInt(parts[2], 10) > 31) return;
        if (sanitizedValue.length > 10) return;

        if (validationErrors.since) {
            setValidationErrors(prev => ({ ...prev, since: '' }));
        }
        setDraftInputValues((prevState) => ({ ...prevState, since: sanitizedValue }));
        if (isValidDate(sanitizedValue)) {
            const newSince = parseYearMonthDayDateString(sanitizedValue);
            if (newSince >= minDate && newSince <= today) {
                setDraftDateRange((prevState) => {
                    const newPeriod = prevState.period && newSince <= prevState.period.until
                        ? { since: newSince, until: prevState.period.until }
                        : { since: newSince, until: newSince };
                    return { ...prevState, alias: 'custom', period: newPeriod };
                });
            }
        }
    }, [validationErrors.since, isValidDate, minDate, today]);

    const handleEndInputValueChange = useCallback((value) => {
        let sanitizedValue = value.replace(/[^0-9-]/g, '');
        const parts = sanitizedValue.split('-');
        if (parts[0] && parts[0].length > 4) return;
        if (parts[1] && parseInt(parts[1], 10) > 12) return;
        if (parts[2] && parseInt(parts[2], 10) > 31) return;
        if (sanitizedValue.length > 10) return;

        if (validationErrors.until) {
            setValidationErrors(prev => ({ ...prev, until: '' }));
        }
        setDraftInputValues((prevState) => ({ ...prevState, until: sanitizedValue }));
        if (isValidDate(sanitizedValue)) {
            const newUntil = parseYearMonthDayDateString(sanitizedValue);
            if (newUntil <= today) {
                setDraftDateRange((prevState) => {
                    const newPeriod = prevState.period && newUntil >= prevState.period.since
                        ? { since: prevState.period.since, until: newUntil }
                        : { since: newUntil, until: newUntil };
                    return { ...prevState, alias: 'custom', period: newPeriod };
                });
            }
        }
    }, [validationErrors.until, isValidDate, today]);

    // NEW: Validation on blur
    const handleInputBlur = useCallback((field) => {
        const value = draftInputValues[field];
        if (!value) return;

        let error = '';
        const parts = value.split("-");
        const year = parts[0] || '';
        const month = parts[1] || '';

        if (year.length > 4) {
            if (field === 'since') {
                error = 'search in the 100 years from current date';
            } else {
                error = 'Year cannot exceed 4 digits';
            }
        } else if (month && parseInt(month, 10) > 12) {
            error = 'Month cannot be more than 12';
        } else if (isValidDate(value)) {
            const date = parseYearMonthDayDateString(value);
            if (field === 'since' && date < minDate) {
                error = 'search in the 100 years from current date';
            } else if (date > today) {
                error = 'Date cannot exceed current date';
            } else if (field === 'until' && draftDateRange?.period?.since && date < draftDateRange.period.since) {
                error = 'End date cannot be before start date';
            }
        } else if (parts.length !== 3 || year.length !== 4 || month.length !== 2 || (parts[2] || '').length !== 2) {
            error = 'Invalid format. Use YYYY-MM-DD.';
        }

        setValidationErrors(prev => ({ ...prev, [field]: error }));
    }, [draftInputValues, minDate, today, draftDateRange, isValidDate]);

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
                disableDatesAfter={today}
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
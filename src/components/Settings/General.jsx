import { Box, Button, Card, Layout, TextField, BlockStack, InlineStack, Tag, Select, Text, Badge, Icon, Tooltip } from "@shopify/polaris";
import { ClipboardIcon, InfoIcon } from "@shopify/polaris-icons";
import { useState, useCallback, useEffect } from "react";
import ResetPointsModal from "../ResetPointsModal";
import { fetchData } from "../../action";

const General = ({ settingsData, setSettingsData, errors, clearError }) => {
    console.log('settingsData general page', settingsData);

    // Safe access to the first item in settingsData
    const settings = settingsData?.[0] || {};

    // Extract values directly from settings
    const accountEmail = settings.account_email || "";
    const contactNumber = settings.contact_number || "";
    const contactCountryCode = settings.contact_country_code;
    const country_code_list = settings.country_code_list;
    const installDate = settings.created_at || "";
    const storeUrl = settings.store_url || "";
    const subDomain = settings.sub_domain || "";
    const verifiedStatus = settings.verified_status || "";
    const verifiedEmail = settings.verify_email || "";
    // const currentCurrency = settings.store_currency || "USD";
    // const currencyListRaw = settings.store_currency_list || {};
    // const currencyOptions = Object.entries(currencyListRaw).map(([code, label]) => ({
    //     label: label,
    //     value: code
    // }));
    const dateFormat = settings.date_format;
    const [selectedDateFormat, setSelectedDateFormat] = useState(dateFormat);

    // Country code options
    const countryCodeOptions = Array.isArray(country_code_list)
        ? country_code_list.map((item) => ({
            label: item.label,
            value: String(item.code)
        }))
        : [];

    // Initialize excluded_tags from settingsData
    // Handle different formats: null, array, or comma-separated string
    const getInitialTags = () => {
        const excludedTags = settings.excluded_tags;
        if (!excludedTags) return [];
        if (Array.isArray(excludedTags)) return excludedTags;
        if (typeof excludedTags === 'string') {
            // Handle comma-separated string
            return excludedTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        }
        return [];
    };

    // Local state for tags
    const [excludeTags, setExcludeTags] = useState(getInitialTags());
    const [currTagInput, setCurrTagInput] = useState("");
    const [tagInputError, setTagInputError] = useState("");
    const [resetPointsModalActive, setResetPointsModalActive] = useState(false);
    const [dateOptions, setDateOptions] = useState([]);
    const [emailSender, setEmailSender] = useState(verifiedEmail);
    // Update excludeTags when settingsData.excluded_tags changes externally

    const verifyEmailAPI = async () => {
        const formData = new FormData();
        formData.append("email", emailSender);
        const response = await fetchData("/email-verify", formData);
        console.log('verify email response', response);
        if (response.status) {
            getSettingsAPI();
            shopify.toast.show(response.message, { duration: 2000 });
        } else {
            console.log('verify email error', response);
            shopify.toast.show(response.message, { duration: 2000, isError: true });
        }
    }

    const getSettingsAPI = async () => {
        // setLoading(true);
        try {
            const formData = new FormData();
            const response = await fetchData("/get-settings", formData);
            console.log('Settings Response', response);
            if (response.status) {
                setSettingsData(response.data);
            } else {
                shopify.toast.show(response?.message, { duration: 2000, isError: true });
            }
        } catch (error) {
            console.error('Error getting settings:', error);
        } finally {
            // setLoading(false);
        }
    }

    useEffect(() => {
        const newTags = getInitialTags();
        // Only update if the new tags are different from current state
        const currentTagsStr = JSON.stringify([...excludeTags].sort());
        const newTagsStr = JSON.stringify([...newTags].sort());
        if (currentTagsStr !== newTagsStr) {
            setExcludeTags(newTags);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [settingsData?.[0]?.excluded_tags]);

    useEffect(() => {
        formatDate(new Date());
    }, []);

    const handleCopy = () => {
        if (subDomain) {
            navigator.clipboard.writeText(subDomain);
        }
    };

    const handleTagInputChange = useCallback((newValue) => {
        setCurrTagInput(newValue);
        if (tagInputError) {
            setTagInputError("");
        }
    }, [tagInputError]);

    const handleAddExcludeTag = useCallback(() => {
        const trimmedTag = currTagInput.trim();

        if (!trimmedTag) {
            setTagInputError("Tag cannot be empty");
            return;
        }

        if (excludeTags.includes(trimmedTag)) {
            setTagInputError("Tag already exists");
            return;
        }

        const newTags = [...excludeTags, trimmedTag];
        setExcludeTags(newTags);
        // Update settingsData with new tags
        setSettingsData([{ ...settingsData[0], excluded_tags: newTags }]);
        setCurrTagInput("");
        setTagInputError("");
    }, [currTagInput, excludeTags, settingsData, setSettingsData]);

    const handleRemoveTag = useCallback((tagToRemove) => {
        const newTags = excludeTags.filter((tag) => tag !== tagToRemove);
        setExcludeTags(newTags);
        // Update settingsData with updated tags
        setSettingsData([{ ...settingsData[0], excluded_tags: newTags }]);
    }, [excludeTags, settingsData, setSettingsData]);

    const getOrdinalSuffix = (day) => {
        if (day >= 11 && day <= 13) {
            return "th";
        }
        switch (day % 10) {
            case 1:
                return "st";
            case 2:
                return "nd";
            case 3:
                return "rd";
            default:
                return "th";
        }
    };

    const formatDate = (date) => {
        const day = date.getDate();
        const ordinalSuffix = getOrdinalSuffix(day);
        const options = [
            {
                value: "F dS Y",
                format: `${date.toLocaleDateString("en-US", { month: "long" })} ${day}${ordinalSuffix}, ${date.getFullYear()}`,
            },
            {
                value: "M dS Y",
                format: `${date.toLocaleDateString("en-US", { month: "short" })} ${day}${ordinalSuffix}, ${date.getFullYear()}`,
            },
            {
                value: "d M Y",
                format: date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(",", ""),
            },
            // {
            //     value: "d M",
            //     format: date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).replace(",", ""),
            // },
            {
                value: "d/m/Y",
                format: date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }),
            },
            {
                value: "m/d/Y",
                format: date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }),
            },
        ];
        setDateOptions(options);
    };

    const handleDateSelectChange = (selectedValue) => {
        setSelectedDateFormat(selectedValue);
        setSettingsData([{ ...settingsData[0], date_format: selectedValue }]);
    };

    return (
        <Box>
            <Layout.AnnotatedSection
                title="Store details"
                description="Activate/Deactivate your points program"
            >
                <Card>
                    <BlockStack gap="200">
                        <TextField
                            label="Account email"
                            value={accountEmail}
                            onChange={(value) => {
                                setSettingsData([{ ...settingsData[0], account_email: value }]);
                                // Clear error when user starts typing
                                if (errors?.['general.account_email'] && clearError) {
                                    clearError('general.account_email');
                                }
                            }}
                            autoComplete="email"
                            requiredIndicator
                            error={errors?.['general.account_email'] ? true : undefined}
                        />
                        <Box style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <Box style={{ flex: '0 0 180px', maxWidth: '180px' }}>
                                <Select
                                    label="Country code"
                                    options={countryCodeOptions}
                                    value={contactCountryCode}
                                    onChange={(value) => setSettingsData([{ ...settingsData[0], contact_country_code: value }])}
                                />
                            </Box>
                            <Box style={{ flex: '1', minWidth: 0 }}>
                                <TextField
                                    label="Contact number"
                                    value={contactNumber}
                                    onChange={(value) => {
                                        setSettingsData([{ ...settingsData[0], contact_number: value }]);
                                        // Clear error when user starts typing
                                        if (errors?.['general.contact_number'] && clearError) {
                                            clearError('general.contact_number');
                                        }
                                    }}
                                    autoComplete="tel"
                                    error={errors?.['general.contact_number'] ? true : undefined}
                                />
                            </Box>
                        </Box>
                        {/* <Select
                            label="Store Currency"
                            options={currencyOptions}
                            value={currentCurrency}
                            onChange={(value) => setSettingsData([{ ...settingsData[0], store_currency: value }])}
                            disabled={currencyOptions.length === 0} // Disable if list failed to load
                        /> */}
                        <TextField
                            label="Installation date"
                            value={installDate}
                            disabled
                            autoComplete="off"
                        />
                        <TextField
                            label="Store URL"
                            value={storeUrl}
                            disabled
                            autoComplete="off"
                        />
                        <TextField
                            label="Sub domain"
                            value={subDomain}
                            disabled
                            autoComplete="off"
                            connectedRight={
                                <Button icon={ClipboardIcon} onClick={handleCopy} variant="secondary">
                                    Copy
                                </Button>
                            }
                        />
                    </BlockStack>
                </Card>
            </Layout.AnnotatedSection>

            {/* <Layout.AnnotatedSection
                title="Excluded Customers"
                description="Choose tags to prevent selected customers from participating in loyalty Program"
            >
                <Card>
                    <BlockStack gap="400">
                        <TextField
                            label='Define Tags to Exclude'
                            type="text"
                            autoComplete="off"
                            value={currTagInput}
                            onChange={handleTagInputChange}
                            error={tagInputError}
                            connectedRight={
                                <Button onClick={handleAddExcludeTag} variant="primary">
                                    Add
                                </Button>
                            }
                        />

                        {excludeTags.length > 0 && (
                            <InlineStack gap="200" wrap>
                                {excludeTags.map((tag) => (
                                    <Tag key={tag} onRemove={() => handleRemoveTag(tag)}>
                                        {tag}
                                    </Tag>
                                ))}
                            </InlineStack>
                        )}
                    </BlockStack>
                </Card>
            </Layout.AnnotatedSection> */}

            <Layout.AnnotatedSection
                title="Date and Time Format"
                description="Date and time format to display for order tracking"
            >
                <Card>
                    <InlineStack gap="200">
                        <Select
                            label="Date and Time Format"
                            options={dateOptions?.map((obj) => {
                                return {
                                    label: obj.format,
                                    value: obj.value,
                                }
                            })}
                            value={selectedDateFormat}
                            onChange={(value) => handleDateSelectChange(value)}
                        />
                    </InlineStack>
                </Card>
            </Layout.AnnotatedSection>

            <Layout.AnnotatedSection
                title="Email Sender"
                description="Set and verify the email address used to send emails to users."
            >
                <Card>
                    <Box style={{ display: 'flex', gap: '10px', flexDirection: 'column', marginBottom: '10px' }}>
                        <Badge tone="info">
                            <Box style={{ display: 'flex', gap: '5px', padding: '5px 0px' }}>
                                <Box><Icon source={InfoIcon} /></Box>
                                <Text>Enter the email address that will be used to send emails to all users.
                                    Once verified, this address will appear as the sender, and users can reply directly to it.
                                </Text>
                            </Box>
                        </Badge>
                        {verifiedStatus === '1' && (
                            <Badge tone="success">
                                <Box style={{ display: 'flex', gap: '5px', padding: '5px 0px', alignItems: 'center' }}>
                                    <Box><Icon source={InfoIcon} /></Box>
                                    <Text>This email address has been successfully confirmed and is ready for use.</Text>
                                </Box>
                            </Badge>
                        )}
                        {verifiedStatus === '3' && (
                            <Badge tone="warning">
                                <Box style={{ display: 'flex', gap: '5px', padding: '5px 0px', }}>
                                    <Box><Icon source={InfoIcon} /></Box>
                                    <Text> A verification email has been sent to {settings?.verify_email}. Please check your inbox and follow the link to complete verification.</Text>
                                </Box>
                            </Badge>
                        )}
                    </Box>

                    <TextField
                        label={<Text>Sender Email Address</Text>}
                        value={emailSender}
                        onChange={(value) => setEmailSender(value)}
                        connectedRight={
                            !(settings?.verified_status === '1' && emailSender === settings?.verify_email) ? (
                                <Button onClick={() => verifyEmailAPI()} variant="secondary">
                                    Verify now
                                </Button>
                            ) : null
                        }
                        helpText="Note: This will verify the email sender by sending a test email to the email sender."
                    />
                </Card>
            </Layout.AnnotatedSection>

            <Layout.AnnotatedSection
                title="Reset Customer Points"
                description="This will remove all customer points and activity history, allowing you to start fresh with your loyalty program."
            >
                <Card>
                    <BlockStack gap={200}>
                        <Text fontWeight="bold">Reset Customer Points</Text>
                        <Text>This action will reset all customer points and activity history. This is useful when you want to start fresh with your loyalty program.</Text>
                        <Text tone="caution">This action cannot be undone. All customer data will be permanently reset.</Text>
                        <Box>
                            <Button tone="critical" variant="primary" onClick={() => setResetPointsModalActive(true)}>Reset All Customer Points</Button>
                        </Box>
                    </BlockStack>
                </Card>
            </Layout.AnnotatedSection>

            <ResetPointsModal
                active={resetPointsModalActive}
                setActive={setResetPointsModalActive}
            />
        </Box >
    );
};

export default General;
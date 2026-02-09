import { Badge, BlockStack, Box, Button, Card, Grid, Layout, Page, Text, TextField, SkeletonBodyText, SkeletonDisplayText, SkeletonPage, InlineGrid } from '@shopify/polaris'
import { DeleteIcon } from '@shopify/polaris-icons';
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchData } from '../../action';
import ConfirmationModal from '../../components/ConfirmationModal';
import { NoLeadingZero } from '../../utils';

const PREFIXES = {
    social_share_facebook: "https://www.facebook.com/sharer/sharer.php?u=",
    social_share_twitter: "https://twitter.com/intent/tweet?url=",
    social_share_tiktok: "",
    social_follow_instagram: "https://www.instagram.com/",
    social_follow_twitter: "https://twitter.com/",
    social_follow_tiktok: "https://www.tiktok.com/@",
};

const LoyaltySocialView = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { rule: locationRule, edit: locationEdit } = location.state || {};


    // Safely parse localStorage data
    const storedEditData = localStorage.getItem('loyaltyEditData');
    const parsedStoredData = storedEditData ? JSON.parse(storedEditData) : null;
    const { rule_id: storedRuleId, edit: storedEdit, rule_type: storedRuleType, display_use_type: storedDisplayUseType } = parsedStoredData || {};

    // Create rule state
    const [rule, setRule] = useState(() => {
        if (locationRule) return locationRule;
        if (storedDisplayUseType || storedRuleType) {
            return {
                rule_id: storedRuleId || null,
                type: storedRuleType,
                display_use_type: storedDisplayUseType
            };
        }
        return null;
    });

    const edit = locationEdit !== undefined ? locationEdit : storedEdit;
    const ruleId = rule?.rule_id || storedRuleId;

    // Update rule when locationRule becomes available
    useEffect(() => {
        if (locationRule) {
            setRule(locationRule);
            localStorage.setItem('loyaltyEditData', JSON.stringify({
                rule_id: locationRule.rule_id || null,
                rule_type: locationRule.type,
                display_use_type: locationRule.display_use_type,
                edit: locationEdit || false
            }));
        }
    }, [locationRule, locationEdit]);

    const [earningpoints, setEarningpoints] = useState('');
    const [status, setStatus] = useState('inactive');
    const [pageTitle, setPageTitle] = useState('');
    const [conditionalJson, setConditionalJson] = useState({
        follow_twitter_username: '',
        follow_instagram_username: '',
        follow_tiktok_username: '',
        share_facebook_url: '',
        share_twitter_url: '',
        url_visit: '',
    });
    const [getdatabyID, setGetdatabyID] = useState();
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [hasCalledAPI, setHasCalledAPI] = useState(false);

    // Helper: Get platform-specific title
    const getPlatformTitle = useCallback((displayUseType) => {
        switch (displayUseType) {
            case 'social_follow_twitter': return 'Follow on Twitter';
            case 'social_follow_instagram': return 'Follow on Instagram';
            case 'social_follow_tiktok': return 'Follow on TikTok';
            case 'social_share_facebook': return 'Share on Facebook';
            case 'social_share_twitter': return 'Share on Twitter';
            case 'social_share_tiktok': return 'Share on TikTok';
            case 'url_visit': return 'Visit URL';
            default: return 'Social Rule';
        }
    }, []);

    // Determine the field name dynamically based on platform
    const getFieldNameForPlatformFromType = useCallback((displayUseType) => {
        switch (displayUseType) {
            case 'social_follow_twitter': return 'follow_twitter_url';
            case 'social_follow_instagram': return 'follow_instagram_username';
            case 'social_follow_tiktok': return 'follow_tiktok_url';
            case 'social_share_facebook': return 'share_facebook_url';
            case 'social_share_twitter': return 'share_twitter_url';
            case 'url_visit': return 'url_visit';
            default: return '';
        }
    }, []);

    // Helper: Derive the correct type from API response
    const deriveDisplayType = (data) => {
        if (!data) return null;
        if (data.display_use_type) return data.display_use_type;
        if (data.type && data.platform && !data.type.includes(data.platform)) {
            return `${data.type}_${data.platform}`;
        }
        return data.type;
    };

    const activeDisplayUseType = deriveDisplayType(getdatabyID) || rule?.display_use_type || storedDisplayUseType || rule?.type;

    const fieldName = useMemo(() => {
        return getFieldNameForPlatformFromType(activeDisplayUseType);
    }, [activeDisplayUseType, getFieldNameForPlatformFromType]);

    const cleanUrlForDisplay = (fullUrl, type) => {
        if (!fullUrl) return '';
        const prefix = PREFIXES[type];
        if (prefix && fullUrl.startsWith(prefix)) {
            return fullUrl.replace(prefix, '');
        }
        return fullUrl;
    };

    const formatUrlForSaving = (cleanUrl, type) => {
        if (!cleanUrl) return '';
        const prefix = PREFIXES[type];
        const trimmed = cleanUrl.trim();
        if (prefix) {
            // If it's already a full URL or looks like one, don't prepend the prefix
            if (/^https?:\/\//i.test(trimmed) || trimmed.includes('www.') || (trimmed.includes('.com') && trimmed.includes('/'))) {
                return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
            }
            return prefix + trimmed;
        }
        return cleanUrl;
    };

    useEffect(() => {
        if (getdatabyID) {
            const pointsValue = getdatabyID?.points ?? getdatabyID?.default_points ?? '0';
            setEarningpoints(pointsValue);

            setRule(prev => {
                const derivedType = deriveDisplayType(getdatabyID);
                const hasNewData = getdatabyID.type || derivedType;

                if (hasNewData) {
                    const newRule = {
                        ...(prev || {}),
                        type: getdatabyID.type || prev?.type,
                        display_use_type: derivedType || prev?.display_use_type,
                        rule_id: getdatabyID.rule_id,
                        master_rule_id: getdatabyID.master_rule_id || prev?.master_rule_id,
                        platform: getdatabyID.platform || prev?.platform
                    };
                    if (JSON.stringify(newRule) !== JSON.stringify(prev)) {
                        return newRule;
                    }
                }
                return prev;
            });

            const displayUseType = deriveDisplayType(getdatabyID);
            const titleFromAPI = getdatabyID?.title || getdatabyID?.master_rule?.title || getPlatformTitle(displayUseType);
            setPageTitle(titleFromAPI);

            const platformField = getFieldNameForPlatformFromType(displayUseType);

            if (platformField) {
                const rawUrl = getdatabyID?.condition_json?.[platformField] || '';
                const displayUrl = cleanUrlForDisplay(rawUrl, displayUseType).trim();

                setConditionalJson(prev => ({
                    ...prev,
                    [platformField]: displayUrl,
                }));
            }

            setStatus(getdatabyID?.status ?? false);
            setLoading(false);
        }
    }, [getdatabyID, getFieldNameForPlatformFromType, getPlatformTitle]);

    const deleteEarningRuleAPI = async (ruleId) => {
        setDeleteLoading(true);
        const formData = new FormData();
        formData.append("setting_id", "ztEfTSMcDejdHNDnDiM5xBPdJdEuyCEkwhxdaL==");
        formData.append("rule_id", ruleId);
        const response = await fetchData("/delete-merchant-earning-rules", formData);
        setDeleteLoading(false);
        setIsDeleteModalOpen(false);
        if (response.status) {
            localStorage.removeItem('loyaltyEditData');
            navigate('/loyaltyProgram');
        } else {
            console.error('Delete Url Error', response);
        }
    }

    // FIX: Updated to accept an optional 'urlOverride' so the API uses the auto-fixed URL immediately
    const prepareDataForSave = (urlOverride) => {
        const platformField = getFieldNameForPlatformFromType(activeDisplayUseType);

        // Use override if provided, otherwise state, and trim it
        const rawValue = urlOverride !== undefined ? urlOverride : (conditionalJson[platformField] || '');
        const cleanValue = rawValue.trim();

        const formattedValue = formatUrlForSaving(cleanValue, activeDisplayUseType);

        return {
            ...conditionalJson,
            [platformField]: formattedValue
        };
    };

    // FIX: Accepted 'fixedUrl' parameter
    const AddRuleAPI = async (fixedUrl) => {
        if (!rule || !rule.master_rule_id || !rule.type) {
            shopify.toast.show('Rule data is missing. Please refresh the page.', { duration: 2000, isError: true });
            return;
        }

        setSaveLoading(true);
        try {
            // Pass fixedUrl to preparation function
            const formattedJson = prepareDataForSave(fixedUrl);

            const formData = new FormData();
            formData.append("master_rule_id", rule.master_rule_id);
            formData.append("type", rule.type);
            formData.append("platform", rule.platform);
            formData.append("points", earningpoints);
            formData.append("status", status);
            formData.append("condition_json", JSON.stringify(formattedJson));
            const response = await fetchData("/add-merchant-earning-rules", formData);
            if (response.status) {
                localStorage.removeItem('loyaltyEditData');
                navigate('/loyaltyProgram');
            } else {
                console.error('Add Url Error', response);
            }
        } catch (error) {
            console.error('Add Rule Error', error);
        } finally {
            setSaveLoading(false);
        }
    }

    const getRuleByIdAPI = useCallback(async (ruleId) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("rule_id", ruleId);
            const response = await fetchData("/get-merchant-earning-rules-by-id", formData);
            if (response?.data) {
                setGetdatabyID(response.data);
                const derivedType = response.data.display_use_type || response.data.type;

                localStorage.setItem('loyaltyEditData', JSON.stringify({
                    rule_id: ruleId,
                    rule_type: response.data.type,
                    display_use_type: derivedType,
                    edit: true
                }));
            }
        } catch (error) {
            console.error('Get Rule By Id Error', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // FIX: Accepted 'fixedUrl' parameter
    const updateRuleAPI = async (ruleId, fixedUrl) => {
        setSaveLoading(true);
        try {
            // Pass fixedUrl to preparation function
            const formattedJson = prepareDataForSave(fixedUrl);

            const formData = new FormData();
            formData.append("rule_id", ruleId);
            formData.append("points", earningpoints);
            formData.append("status", status);
            formData.append("condition_json", JSON.stringify(formattedJson));
            const response = await fetchData("/update-merchant-earning-rules", formData);
            if (response.status) {
                localStorage.removeItem('loyaltyEditData');
                navigate('/loyaltyProgram');
            } else {
                console.error('Update Url Error', response);
            }
        } catch (error) {
            console.error('Update Rule Error', error);
        } finally {
            setSaveLoading(false);
        }
    }

    useEffect(() => {
        if (edit) {
            if (ruleId && !getdatabyID && !hasCalledAPI) {
                setHasCalledAPI(true);
                getRuleByIdAPI(ruleId);
            } else if (!ruleId) {
                setLoading(false);
            } else if (getdatabyID) {
                setLoading(false);
            }
        } else {
            setLoading(false);
            if (rule) {
                const fallbackTitle = rule.title || getPlatformTitle(activeDisplayUseType);
                setPageTitle(fallbackTitle);
                setStatus(rule.status ?? false);
            }
        }
    }, [edit, ruleId, getdatabyID, hasCalledAPI, getRuleByIdAPI, rule]);

    // FIX: Added parameter to validate a specific value instead of just state
    const validateFields = (valueToCheck) => {
        const newErrors = {};

        // Use provided value if available, otherwise fallback to state
        const urlValue = valueToCheck !== undefined ? valueToCheck : conditionalJson[fieldName];

        if (!earningpoints || !/^\d+$/.test(earningpoints) || parseInt(earningpoints, 10) < 1) {
            newErrors.points = 'Please enter a whole number (1 or more).';
        }

        const urlRegex = /^(https?:\/\/)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^ \s]*)?$/;

        if (fieldName) {
            const cleanValue = urlValue ? urlValue.trim() : '';

            if (!cleanValue) {
                newErrors.url = 'Please enter a value.';
            }
            else {
                const isFollowRule = activeDisplayUseType && activeDisplayUseType.includes('follow');
                const isUsernameField = fieldName.includes('username') || isFollowRule;
                if (!isUsernameField && !urlRegex.test(cleanValue)) {
                    newErrors.url = 'Please enter a valid URL.';
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        // 1. Get current input value
        let currentValue = conditionalJson[fieldName] || '';
        const isFollowRule = activeDisplayUseType && activeDisplayUseType.includes('follow');
        const isUsernameField = (fieldName && fieldName.includes('username')) || isFollowRule;

        // 2. AUTO-FIX: If it's a URL field and missing protocol, add https://
        // e.g., "asd.com" -> "https://asd.com"
        if (fieldName && !isUsernameField && currentValue.trim() !== '') {
            if (!/^https?:\/\//i.test(currentValue.trim())) {
                currentValue = `https://${currentValue.trim()}`;

                // Update state so the UI reflects the change
                setConditionalJson(prev => ({
                    ...prev,
                    [fieldName]: currentValue
                }));
            }
        }

        // 3. Validate using the potentially FIXED value
        if (!validateFields(currentValue)) {
            return;
        }

        // 4. Proceed to save, passing the FIXED value to ensure API gets it immediately
        if (edit) {
            const idToUse = rule?.rule_id || getdatabyID?.rule_id || ruleId;
            if (idToUse) {
                updateRuleAPI(idToUse, currentValue);
            } else {
                shopify.toast.show('Rule ID is missing. Please refresh the page.', { duration: 2000, isError: true });
            }
        } else {
            AddRuleAPI(currentValue);
        }
    }

    const handleStatusChange = () => {
        setStatus(prevStatus => prevStatus === true ? false : true);
    };

    return (
        <>
            {loading ?
                <SkeletonPage
                    primaryAction={{ content: <SkeletonDisplayText size="small" /> }}
                >

                    <InlineGrid columns={['twoThirds', 'oneThird']} gap={400} >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <Card>
                                <SkeletonBodyText lines={4} />
                            </Card>
                            <Card>
                                <SkeletonBodyText lines={3} />
                            </Card>
                        </div>

                        <div>
                            <Card>
                                <SkeletonBodyText lines={4} />
                            </Card>
                        </div>
                    </InlineGrid>

                </SkeletonPage>
                : (
                    <Page
                        backAction={{
                            content: 'Back',
                            onAction: () => {
                                localStorage.removeItem('loyaltyEditData');
                                navigate('/loyaltyProgram');
                            }
                        }}
                        title={
                            <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                                <Text as='h1' variant='headingLg'>{pageTitle}</Text>
                                <Badge tone={status === true ? "success" : "critical"}>
                                    {status ? "Active" : "Inactive"}
                                </Badge>
                            </Box>
                        }
                        secondaryActions={edit ?
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={status === true}
                                        onChange={handleStatusChange}
                                    />
                                    <span className="slider"></span>
                                </label>
                                <Button variant='secondary' tone='critical' icon={DeleteIcon} onClick={() => { setIsDeleteModalOpen(true) }}>Delete</Button>
                            </div>
                            :
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={status === true}
                                    onChange={handleStatusChange}
                                />
                                <span className="slider"></span>
                            </label>
                        }
                        primaryAction={{ content: 'Save', onAction: handleSave, loading: saveLoading }}
                    >
                        <Layout>
                            <Layout.Section>
                                <Grid>
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 4, md: 4, lg: 8, xl: 8 }}>
                                        <BlockStack gap={400}>
                                            <Card>
                                                <BlockStack gap={400}>
                                                    <Text variant='headingMd' as="h2">Social Settings</Text>
                                                    {loading && edit ? (
                                                        <SkeletonBodyText lines={1} />
                                                    ) : (
                                                        fieldName && <TextField
                                                            label="Social Media Profile URL"
                                                            value={conditionalJson[fieldName] || ''}
                                                            onChange={(value) => {
                                                                setConditionalJson({
                                                                    ...conditionalJson,
                                                                    [fieldName]: value
                                                                });
                                                                if (errors.url) setErrors(prev => ({ ...prev, url: undefined }));
                                                            }}
                                                            autoComplete="off"
                                                            error={errors.url}
                                                        />
                                                    )}
                                                </BlockStack>
                                            </Card>

                                            <Card>
                                                <BlockStack gap={200}>
                                                    {loading && edit ? (
                                                        <SkeletonDisplayText size="small" />
                                                    ) : (
                                                        <TextField
                                                            label="Earning points"
                                                            value={earningpoints}
                                                            type="text"
                                                            inputMode="numeric"
                                                            onChange={(value) => {
                                                                if (/^\d*$/.test(value)) {
                                                                    setEarningpoints(NoLeadingZero(value));
                                                                }
                                                                if (errors.points) setErrors(prev => ({ ...prev, points: undefined }));
                                                            }}
                                                            autoComplete="off"
                                                            error={errors.points}
                                                        />
                                                    )}
                                                </BlockStack>
                                            </Card>
                                        </BlockStack>
                                    </Grid.Cell>

                                    <Grid.Cell columnSpan={{ xs: 6, sm: 2, md: 2, lg: 4, xl: 4 }}>
                                        <BlockStack gap={400}>
                                            <Card>
                                                <BlockStack gap={200}>
                                                    {/* <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                        <Text variant='headingMd' as="h2">Status</Text>
                                                        <Badge tone={status === true ? "success" : "critical"}>
                                                            {status ? "Active" : "Inactive"}
                                                        </Badge>
                                                    </Box>
                                                    {loading && edit ? (
                                                        <SkeletonBodyText lines={1} />
                                                    ) : (
                                                        <div className="toggle-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <label className="switch">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={status === true}
                                                                    onChange={handleStatusChange}
                                                                />
                                                                <span className="slider"></span>
                                                            </label>
                                                        </div>
                                                    )} */}

                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                        <Text variant="headingMd" as="span">
                                                            Summary
                                                        </Text>
                                                        {rule?.type === 'url_visit' && (
                                                            <Text>Customers will automatically earn points once they visit a specific URL.</Text>
                                                        )}
                                                        {activeDisplayUseType === 'social_follow_instagram' && (
                                                            <Text>Customers earn points for following your Instagram account.</Text>
                                                        )}
                                                        {activeDisplayUseType === 'social_follow_twitter' && (
                                                            <Text>Customers earn points for following your Twitter account.</Text>
                                                        )}
                                                        {activeDisplayUseType === 'social_follow_tiktok' && (
                                                            <Text>Customers earn points for following your TikTok account.</Text>
                                                        )}
                                                        {activeDisplayUseType === 'social_share_facebook' && (
                                                            <Text>Customers earn points for sharing your link on Facebook.</Text>
                                                        )}
                                                        {activeDisplayUseType === 'social_share_twitter' && (
                                                            <Text>Customers earn points for sharing your link on Twitter.</Text>
                                                        )}
                                                        {activeDisplayUseType === 'social_share_tiktok' && (
                                                            <Text>Customers earn points for sharing your link on TikTok.</Text>
                                                        )}
                                                    </div>
                                                </BlockStack>
                                            </Card>
                                        </BlockStack>
                                    </Grid.Cell>
                                </Grid>
                            </Layout.Section>
                        </Layout>
                        <ConfirmationModal
                            isOpen={isDeleteModalOpen}
                            setIsOpen={setIsDeleteModalOpen}
                            text={'Are you sure you want to delete this rule?'}
                            title={'Delete Rule'}
                            buttonText={'Delete'}
                            buttonAction={() => {
                                const idToUse = rule?.rule_id || getdatabyID?.rule_id || ruleId;
                                if (idToUse) {
                                    deleteEarningRuleAPI(idToUse);
                                }
                            }}
                            destructive={true}
                            buttonLoader={deleteLoading}
                        />
                    </Page>
                )}
        </>
    );
}

export default LoyaltySocialView;
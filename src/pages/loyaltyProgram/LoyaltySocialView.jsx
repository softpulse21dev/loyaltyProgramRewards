import { Badge, BlockStack, Box, Button, Card, Grid, Layout, Page, Text, TextField, SkeletonBodyText, SkeletonDisplayText } from '@shopify/polaris'
import { DeleteIcon } from '@shopify/polaris-icons';
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchData } from '../../action';
import ConfirmationModal from '../../components/ConfirmationModal';

const PREFIXES = {
    social_share_facebook: "https://www.facebook.com/sharer/sharer.php?u=",
    social_share_twitter: "https://twitter.com/intent/tweet?url=",
    // TikTok does not support a web "Share Link". We leave it empty so it saves the raw profile URL.
    social_share_tiktok: "",
};

const LoyaltySocialView = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { rule, edit } = location.state || {};
    console.log('rule', rule)

    const [earningpoints, setEarningpoints] = useState('');
    const [status, setStatus] = useState('inactive');
    const [pageTitle, setPageTitle] = useState('Social Rule');
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
    const [errors, setErrors] = useState({});
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Determine the field name dynamically based on platform
    const getFieldNameForPlatform = () => {
        switch (rule?.display_use_type) {
            case 'social_follow_twitter':
                return 'follow_twitter_url';
            case 'social_follow_instagram':
                return 'follow_instagram_username';
            case 'social_follow_tiktok':
                return 'follow_tiktok_url';
            case 'social_share_facebook':
                return 'share_facebook_url';
            case 'social_share_twitter':
                return 'share_twitter_url';
            case 'url_visit':
                return 'url_visit';
            default:
                return ''; // Default case if platform is not found
        }
    };

    const fieldName = getFieldNameForPlatform();

    // --- HELPER 1: REMOVE PREFIX (For Displaying in Input) ---
    const cleanUrlForDisplay = (fullUrl, type) => {
        if (!fullUrl) return '';
        const prefix = PREFIXES[type];

        // If this type has a prefix and the URL starts with it, strip it off
        if (prefix && fullUrl.startsWith(prefix)) {
            return fullUrl.replace(prefix, '');
        }
        return fullUrl;
    };

    // --- HELPER 2: ADD PREFIX (For Saving to DB) ---
    const formatUrlForSaving = (cleanUrl, type) => {
        if (!cleanUrl) return '';
        const prefix = PREFIXES[type];

        // If this type has a prefix, add it. Otherwise return raw URL.
        if (prefix) {
            // We encode the URL so special characters don't break the share link
            // e.g. "https://myshop.com" -> "https%3A%2F%2Fmyshop.com"
            // Note: If you want to support manual params, be careful with encoding, 
            // but for simple URLs, this is safer.
            return prefix + cleanUrl;
        }
        return cleanUrl;
    };

    useEffect(() => {
        if (edit) {
            getRuleByIdAPI(rule.rule_id);
        } else {
            setLoading(false); // If not editing, no need for skeleton
        }
        if (rule) {
            setPageTitle(rule.title || 'Social Rule');
            setStatus(rule.status ?? false);
        }
    }, [edit, rule]);

    useEffect(() => {
        if (getdatabyID) {
            const pointsValue = getdatabyID?.points ?? getdatabyID?.default_points ?? '0';
            setEarningpoints(pointsValue);

            const platformField = getFieldNameForPlatform();
            if (platformField) {
                const rawUrl = getdatabyID?.condition_json?.[platformField] || '';
                const displayUrl = cleanUrlForDisplay(rawUrl, rule?.display_use_type);

                setConditionalJson({
                    [platformField]: displayUrl,
                });
            }

            setStatus(getdatabyID?.status ?? false);
            setLoading(false);
        }
    }, [getdatabyID]);

    const deleteEarningRuleAPI = async (ruleId) => {
        setDeleteLoading(true);
        const formData = new FormData();
        formData.append("setting_id", "ztEfTSMcDejdHNDnDiM5xBPdJdEuyCEkwhxdaL==");
        formData.append("rule_id", ruleId);
        const response = await fetchData("/delete-merchant-earning-rules", formData);
        setDeleteLoading(false);
        setIsDeleteModalOpen(false);
        console.log('result delete earning rule', response);
        if (response.status) {
            navigate('/loyaltyProgram');
        } else {
            console.error('Delete Url Error', response);
        }
    }

    // --- PREPARE DATA FOR API ---
    // This creates a copy of the json with the URL transformed
    const prepareDataForSave = () => {
        const platformField = getFieldNameForPlatform();
        const cleanValue = conditionalJson[platformField];

        // Format the URL (Add Facebook/Twitter logic)
        const formattedValue = formatUrlForSaving(cleanValue, rule?.display_use_type);

        return {
            ...conditionalJson,
            [platformField]: formattedValue
        };
    };

    const AddRuleAPI = async () => {
        const formattedJson = prepareDataForSave(); // Get formatted JSON
        const formData = new FormData();
        formData.append("master_rule_id", rule.master_rule_id);
        formData.append("type", rule.type);
        formData.append("platform", rule.platform);
        formData.append("points", earningpoints);
        formData.append("status", status);
        formData.append("condition_json", JSON.stringify(formattedJson));
        const response = await fetchData("/add-merchant-earning-rules", formData);
        console.log('Add Url Response', response);
        if (response.status) {
            navigate('/loyaltyProgram');
        } else {
            console.error('Add Url Error', response);
        }
    }

    const getRuleByIdAPI = async (ruleId) => {
        const formData = new FormData();
        console.log('ruleId', ruleId);
        formData.append("rule_id", ruleId);
        const response = await fetchData("/get-merchant-earning-rules-by-id", formData);
        if (response?.data) {
            setGetdatabyID(response.data);
            console.log('Get Rule By Id Response', response);
        }
    }

    const updateRuleAPI = async (ruleId) => {
        const formattedJson = prepareDataForSave();
        const formData = new FormData();
        formData.append("rule_id", ruleId);
        formData.append("points", earningpoints);
        formData.append("status", status);
        formData.append("condition_json", JSON.stringify(formattedJson));
        const response = await fetchData("/update-merchant-earning-rules", formData);
        console.log('Update Rule By Id Response', response);
        if (response.status) {
            navigate('/loyaltyProgram');
        } else {
            console.error('Update Url Error', response);
        }
    }

    const validateFields = () => {
        const newErrors = {};
        const urlValue = conditionalJson[getFieldNameForPlatform()];

        if (!earningpoints || !/^\d+$/.test(earningpoints) || parseInt(earningpoints, 10) < 1) {
            newErrors.points = 'Please enter a whole number (1 or more).';
        }

        const urlRegex = /^(https?:\/\/)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^ \s]*)?$/;
        if (!urlValue || urlValue.trim() === '') {
            newErrors.url = 'Please enter Valid URL.';
        }

        else if (!urlRegex.test(urlValue)) {
            newErrors.url = 'Please enter a valid URL.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        // Run validation before saving
        if (!validateFields()) {
            return; // Stop execution if validation fails
        }

        if (edit) {
            updateRuleAPI(rule.rule_id);
        } else {
            AddRuleAPI();
        }
    }

    const handleStatusChange = () => {
        setStatus(prevStatus => prevStatus === true ? false : true);
    };

    return (
        <Page
            backAction={{ content: 'Back', onAction: () => navigate('/loyaltyProgram') }}
            title={
                <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                    <Text as='h1' variant='headingLg'>{pageTitle}</Text>
                    <Badge tone={status === true ? "success" : "critical"}>
                        {status ? "Active" : "Inactive"}
                    </Badge>
                </Box>
            }
            secondaryActions={edit ? <Button variant='secondary' tone='critical' icon={DeleteIcon} onClick={() => { setIsDeleteModalOpen(true) }}>Delete</Button> : undefined}
            primaryAction={{ content: 'Save', onAction: handleSave }}
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
                                                value={conditionalJson[fieldName]}
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
                                        {/* <Text variant='headingMd' as="h2">Earning points</Text> */}
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
                                                        setEarningpoints(value);
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
                                        <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
                                        )}
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
                buttonAction={() => { deleteEarningRuleAPI(rule.rule_id) }}
                destructive={true}
                buttonLoader={deleteLoading}
            />
        </Page>
    );
}

export default LoyaltySocialView;
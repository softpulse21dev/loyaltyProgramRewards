import { Badge, BlockStack, Box, Button, Card, Grid, Layout, Page, Text, TextField, SkeletonBodyText, SkeletonDisplayText } from '@shopify/polaris'
import { DeleteIcon } from '@shopify/polaris-icons';
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchData } from '../../action';


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

    // Determine the field name dynamically based on platform
    const getFieldNameForPlatform = () => {
        switch (rule?.display_use_type) {
            case 'social_follow_twitter':
                return 'follow_twitter_username';
            case 'social_follow_instagram':
                return 'follow_instagram_username';
            case 'social_follow_tiktok':
                return 'follow_tiktok_username';
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

    useEffect(() => {
        if (edit) {
            getRuleByIdAPI(rule.rule_id);
        } else {
            setLoading(false); // If not editing, no need for skeleton
        }
        if (rule) {
            setPageTitle(rule.title || 'Social Rule');
            setStatus(rule.status ?? 'inactive');
        }
    }, [edit, rule]);

    useEffect(() => {
        if (getdatabyID) {
            const pointsValue = getdatabyID?.points ?? getdatabyID?.default_points ?? '0';
            setEarningpoints(pointsValue);

            const platformField = getFieldNameForPlatform();
            if (platformField) {
                setConditionalJson({
                    [platformField]: getdatabyID?.condition_json?.[platformField] || '',
                });
            }

            setStatus(getdatabyID?.status ?? 'inactive');
            setLoading(false);
        }
    }, [getdatabyID]);

    const deleteEarningRuleAPI = async (ruleId) => {
        const formData = new FormData();
        formData.append("setting_id", "ztEfTSMcDejdHNDnDiM5xBPdJdEuyCEkwhxdaL==");
        formData.append("rule_id", ruleId);
        const response = await fetchData("/delete-merchant-earning-rules", formData);
        console.log('result delete earning rule', response);
        if (response.status) {
            navigate('/loyaltyProgram');
        } else {
            console.error('Delete Url Error', response);
        }
    }

    const AddRuleAPI = async () => {
        const formData = new FormData();
        formData.append("master_rule_id", rule.master_rule_id);
        formData.append("type", rule.type);
        formData.append("platform", rule.platform);
        formData.append("points", earningpoints);
        formData.append("status", status);
        formData.append("condition_json", JSON.stringify(conditionalJson));
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
        const formData = new FormData();
        formData.append("rule_id", ruleId);
        formData.append("points", earningpoints);
        formData.append("status", status);
        formData.append("condition_json", JSON.stringify(conditionalJson));
        const response = await fetchData("/update-merchant-earning-rules", formData);
        console.log('Update Rule By Id Response', response);
        if (response.status) {
            navigate('/loyaltyProgram');
        } else {
            console.error('Update Url Error', response);
        }
    }

    // ✅ **New validation function**
    const validateFields = () => {
        const newErrors = {};
        const urlValue = conditionalJson[getFieldNameForPlatform()];

        if (!earningpoints || !/^\d+$/.test(earningpoints) || parseInt(earningpoints, 10) < 0) {
            newErrors.points = 'Please enter a whole number (0 or more).';
        }

        // ✅ **UPDATED REGEX to be more flexible and accept hashes (#) and other special characters**
        const urlRegex = /^(https?:\/\/)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^ \s]*)?$/;
        if (urlValue && !urlRegex.test(urlValue)) {
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
        setStatus(prevStatus => prevStatus === 'active' ? 'inactive' : 'active');
    };

    const fieldName = getFieldNameForPlatform();

    return (
        <Page
            backAction={{ content: 'Back', onAction: () => navigate('/loyaltyProgram') }}
            title={
                <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                    <Text as='h1' variant='headingLg'>{pageTitle}</Text>
                    <Badge tone={status === "active" ? "success" : "critical"}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                </Box>
            }
            secondaryActions={edit ? <Button variant='secondary' tone='critical' icon={DeleteIcon} onClick={() => { deleteEarningRuleAPI(rule.rule_id) }}>Delete</Button> : undefined}
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
                                                // ✅ **Handle change and clear errors**
                                                onChange={(value) => {
                                                    setConditionalJson({
                                                        ...conditionalJson,
                                                        [fieldName]: value
                                                    });
                                                    if (errors.url) setErrors(prev => ({ ...prev, url: undefined }));
                                                }}
                                                maxLength={255}
                                                autoComplete="off"
                                                // ✅ **Display error message**
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
                                                type='number'
                                                // ✅ **Handle change and clear errors**
                                                onChange={(value) => {
                                                    setEarningpoints(value);
                                                    if (errors.points) setErrors(prev => ({ ...prev, points: undefined }));
                                                }}
                                                autoComplete="off"
                                                // ✅ **Display error message**
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
                                            <Badge tone={status === "active" ? "success" : "critical"}>
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </Badge>
                                        </Box>
                                        {loading && edit ? (
                                            <SkeletonBodyText lines={1} />
                                        ) : (
                                            <div className="toggle-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <label className="switch">
                                                    <input
                                                        type="checkbox"
                                                        checked={status === "active"}
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
        </Page>
    );
}

export default LoyaltySocialView;
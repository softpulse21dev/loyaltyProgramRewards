import { Badge, BlockStack, Box, Button, Card, Grid, Layout, Page, Text, TextField, SkeletonBodyText, SkeletonDisplayText } from '@shopify/polaris'
import { DeleteIcon } from '@shopify/polaris-icons';
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchData } from '../../utils';

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

            // Dynamically set the conditionalJson field based on the platform
            const platformField = getFieldNameForPlatform();
            setConditionalJson({
                [platformField]: getdatabyID?.condition_json?.[platformField] || '',
            });

            setStatus(getdatabyID?.status ?? 'inactive');
            setLoading(false); // Set loading to false when data is fetched
        }
    }, [getdatabyID]);

    const deleteEarningRuleAPI = async (ruleId) => {
        const formData = new FormData();
        formData.append("setting_id", "ztEfTSMcDejdHNDnDiM5xBPdJdEuyCEkwhxdaL==");
        formData.append("rule_id", ruleId);
        const response = await fetchData("/delete-merchant-earning-rules?Y6vg3RZzOZz7a9W", formData);
        console.log('result delete earning rule', response);
    }

    const AddRuleAPI = async () => {
        const formData = new FormData();
        formData.append("master_rule_id", rule.master_rule_id);
        formData.append("type", rule.type);
        formData.append("platform", rule.platform);
        formData.append("points", earningpoints);
        formData.append("status", status);
        formData.append("condition_json", JSON.stringify(conditionalJson));
        const response = await fetchData("/add-merchant-earning-rules?Y6vg3RZzOZz7a9W", formData);
        console.log('Add Url Response', response);
    }

    const getRuleByIdAPI = async (ruleId) => {
        const formData = new FormData();
        console.log('ruleId', ruleId);
        formData.append("rule_id", ruleId);
        const response = await fetchData("/get-merchant-earning-rules-by-id?Y6vg3RZzOZz7a9W", formData);
        if (response?.data) {
            setGetdatabyID(response.data); // Update state with fetched data
            console.log('Get Rule By Id Response', response);
        }
    }

    const handleSave = () => {
        if (edit) {
            // AddRuleAPI(); // Uncomment if you want to handle edit saving
        } else {
            AddRuleAPI();
        }
    }

    // Handle status toggle change
    const handleStatusChange = () => {
        setStatus(prevStatus => prevStatus === 'active' ? 'inactive' : 'active');
    };

    return (
        <Page
            backAction={{ content: 'Back', onAction: () => navigate('/loyaltyProgram') }}
            title={
                <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                    <Text>{pageTitle}</Text>
                    <Badge tone={status === "active" ? "success" : "critical"}>
                        {status}
                    </Badge>
                </Box>
            }
            secondaryActions={<Button tone='critical' icon={DeleteIcon} onClick={() => { deleteEarningRuleAPI(rule.rule_id) }}>Delete</Button>}
            primaryAction={{ content: 'Save', onAction: () => { handleSave() } }}
        >
            <Layout>
                <Layout.Section>
                    <Grid>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 4, md: 4, lg: 8, xl: 8 }}>
                            <BlockStack gap={400}>
                                <Card>
                                    <BlockStack gap={400}>
                                        <Text variant='headingMd' as="span">Social Settings</Text>

                                        {/* Skeleton loader for the social media profile URL, show only when edit is true */}
                                        {loading && edit ? (
                                            <SkeletonBodyText lines={1} />
                                        ) : (
                                            <TextField
                                                label="Social Media Profile URL"
                                                value={conditionalJson[getFieldNameForPlatform()]}
                                                onChange={(value) => setConditionalJson({
                                                    ...conditionalJson,
                                                    [getFieldNameForPlatform()]: value
                                                })}
                                                maxLength={255}
                                            />
                                        )}
                                    </BlockStack>
                                </Card>

                                <Card>
                                    <Box style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        <Text variant='headingMd' as="span">Earning points</Text>
                                        <Box>
                                            {/* Skeleton loader for the points input, show only when edit is true */}
                                            {loading && edit ? (
                                                <SkeletonDisplayText size="small" />
                                            ) : (
                                                <TextField
                                                    value={earningpoints}
                                                    type='number'
                                                    onChange={(value) => setEarningpoints(value)}
                                                />
                                            )}
                                        </Box>
                                    </Box>
                                </Card>
                            </BlockStack>
                        </Grid.Cell>

                        <Grid.Cell columnSpan={{ xs: 6, sm: 2, md: 2, lg: 4, xl: 4 }}>
                            <BlockStack gap={400}>
                                <Card>
                                    <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <Text variant='headingMd' as="span">Status</Text>
                                        <Badge tone={status === "active" ? "success" : "critical"}>
                                            {status}
                                        </Badge>
                                    </Box>
                                    <Box>
                                        {/* Status toggle */}
                                        {loading && edit ? (
                                            <SkeletonBodyText lines={1} />
                                        ) : (
                                            <div className="toggle-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <label className="switch">
                                                    <input
                                                        type="checkbox"
                                                        checked={status === "active"}
                                                        onChange={handleStatusChange}  // Toggle status
                                                    />
                                                    <span className="slider"></span>
                                                </label>
                                            </div>
                                        )}
                                    </Box>
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

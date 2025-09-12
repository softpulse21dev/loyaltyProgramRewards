import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Badge, BlockStack, Box, Card, Grid, Layout, Page, Text, TextField, SkeletonBodyText, SkeletonDisplayText } from "@shopify/polaris";
import { fetchData } from "../../action";

const LoyaltySignupView = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { rule, edit } = location.state || {};
    console.log('rulesignup', rule)

    const [earningpoints, setEarningpoints] = useState('');
    const [pageTitle, setPageTitle] = useState("Sign Up");
    const [status, setStatus] = useState("inactive");
    const [loading, setLoading] = useState(true);
    const [getdatabyID, setGetdatabyID] = useState();
    const [conditionalJson, setConditionalJson] = useState({
        birthday_updated_waiting_threshold_days: ''
    });

    const getRuleByIdAPI = async (ruleId) => {
        const formData = new FormData();
        formData.append("rule_id", ruleId);
        const response = await fetchData("/get-merchant-earning-rules-by-id?Y6vg3RZzOZz7a9W", formData);
        if (response?.data) {
            setGetdatabyID(response.data);

            console.log('Get Rule By Id Response', response);
        }
    };

    const AddRuleAPI = async () => {
        const formData = new FormData();
        formData.append("master_rule_id", rule.master_rule_id);
        formData.append("type", rule.type);
        formData.append("points", earningpoints);
        formData.append("status", status);
        formData.append("condition_json", JSON.stringify(conditionalJson));
        const response = await fetchData("/add-merchant-earning-rules?Y6vg3RZzOZz7a9W", formData);
        console.log('Add Rule Response', response);
        if (response.status) {
            navigate('/loyaltyProgram');
        } else {
            console.error('Add Url Error', response);
        }
    }

    const updateRuleAPI = async (ruleId) => {
        const formData = new FormData();
        formData.append("rule_id", ruleId);
        formData.append("points", earningpoints);
        formData.append("status", status);
        formData.append("condition_json", JSON.stringify(conditionalJson));
        const response = await fetchData("/update-merchant-earning-rules?Y6vg3RZzOZz7a9W", formData);
        console.log('Update Rule By Id Response', response);
        if (response.status) {
            navigate('/loyaltyProgram');
        } else {
            console.error('Update Url Error', response);
        }
    };

    useEffect(() => {
        if (edit) {
            getRuleByIdAPI(rule.rule_id);
        } else {
            setLoading(false);
            if (rule) {
                const pointsValue = rule.points ?? rule.default_points ?? "0";
                setEarningpoints(pointsValue);
                setStatus(rule.status ?? "inactive");
            }
        }
        if (rule) {
            setPageTitle(rule.title || "Sign Up");
        }
    }, [edit, rule]);

    useEffect(() => {
        if (getdatabyID) {
            const pointsValue = getdatabyID?.points ?? getdatabyID?.default_points ?? "0";
            setEarningpoints(pointsValue);
            setStatus(getdatabyID?.status ?? "inactive");
            setConditionalJson(getdatabyID?.condition_json);
            setLoading(false);
        }
    }, [getdatabyID]);

    const handleStatusChange = () => {
        setStatus(prevStatus => prevStatus === 'active' ? 'inactive' : 'active');
    };

    const handleSave = () => {
        if (edit) {
            updateRuleAPI(rule.rule_id);
        } else {
            AddRuleAPI();
        }
    };

    return (
        <Page
            backAction={{ content: "Back", onAction: () => navigate("/loyaltyProgram") }}
            title={
                <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                    <Text as='h1' variant='headingLg'>{pageTitle}</Text>
                    <Badge tone={status === "active" ? "success" : "critical"}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                </Box>
            }
            primaryAction={{ content: edit ? "Update" : "Save", onAction: handleSave }}
        >
            <Layout>
                <Layout.Section>
                    <Grid>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 4, md: 4, lg: 8, xl: 8 }}>
                            <BlockStack gap={400}>
                                <Card>
                                    <BlockStack gap={400}>
                                        {loading && edit ? (
                                            <SkeletonDisplayText size="small" />
                                        ) : (
                                            <TextField
                                                label="Earning points"
                                                value={earningpoints}
                                                type="number"
                                                onChange={(value) => setEarningpoints(value)}
                                            />
                                        )}
                                    </BlockStack>
                                </Card>

                                {rule.type === 'birthday' && (
                                    <Card>
                                        <TextField
                                            label="Birthday Waiting Period"
                                            helpText="The number of days after a customer's birthday that they can earn points."
                                            suffix="Days"
                                            type="number"
                                            value={conditionalJson?.birthday_updated_waiting_threshold_days}
                                            onChange={(value) => {
                                                if (/^\d*$/.test(value)) {
                                                    const num = Number(value);
                                                    if (num < 1 && value !== "") {
                                                        setConditionalJson({ ...conditionalJson, birthday_updated_waiting_threshold_days: "1" });
                                                    } else if (num > 365) {
                                                        setConditionalJson({ ...conditionalJson, birthday_updated_waiting_threshold_days: "365" });
                                                    } else {
                                                        setConditionalJson({ ...conditionalJson, birthday_updated_waiting_threshold_days: value });
                                                    }
                                                }
                                            }}
                                        />
                                    </Card>
                                )}
                            </BlockStack>
                        </Grid.Cell>

                        <Grid.Cell columnSpan={{ xs: 6, sm: 2, md: 2, lg: 4, xl: 4 }}>
                            <BlockStack gap={400}>
                                <Card>
                                    <Text variant="headingMd" as="span">
                                        Summary
                                    </Text>
                                    <ul style={{ listStyle: "inherit", paddingInline: 20 }}>
                                        <li>
                                            <p>Customers earn points by {rule?.display_use_type}</p>
                                        </li>
                                    </ul>
                                </Card>
                                <Card>
                                    <BlockStack gap={200}>
                                        <Box
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                            }}
                                        >
                                            <Text variant="headingMd" as="span">
                                                Status
                                            </Text>
                                            <Badge tone={status === "active" ? "success" : "critical"}>
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </Badge>
                                        </Box>
                                        {loading && edit ? (
                                            <SkeletonBodyText lines={1} />
                                        ) : (
                                            <Box>
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
                                            </Box>
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
};

export default LoyaltySignupView;
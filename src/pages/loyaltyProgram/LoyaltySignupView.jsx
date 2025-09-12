import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Badge, BlockStack, Box, Card, Grid, Layout, Page, Text, TextField } from "@shopify/polaris";
import { fetchData } from "../../action";


const LoyaltySignupView = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { rule, edit } = location.state || {};

    const [earningpoints, setEarningpoints] = useState(rule.points);
    const [pageTitle, setPageTitle] = useState("Sign Up");
    const [status, setStatus] = useState("inactive");

    useEffect(() => {
        if (rule) {
            setPageTitle(rule.title || "Sign Up");
            const pointsValue = rule.points ?? rule.default_points ?? "0";
            setEarningpoints(pointsValue);
            setStatus(rule.status ?? "inactive");
        }
    }, [rule]);
    console.log('first', rule.rule_id)

    const handleStatusChange = () => {
        setStatus(prevStatus => prevStatus === 'active' ? 'inactive' : 'active');
    };

    const EditEarningPointsAPI = async () => {
        const formData = new FormData();
        formData.append("shop", "kg-store-demo.myshopify.com");
        formData.append("rule_id", rule?.rule_id);
        formData.append("setting_id", "ztEfTSMcDejdHNDnDiM5xBPdJdEuyCEkwhxdaL==");
        formData.append("points", earningpoints);
        formData.append("status", status);
        formData.append("condition_json", null);
        const response = await fetchData("/update-merchant-earning-rules?Y6vg3RZzOZz7a9W", formData);
        const result = await response.json();
        console.log('result', result);
        if (result.status) {
            shopify.toast.show(response?.message, { duration: 2000 });
        } else {
            shopify.toast.show(response?.errors?.points, { isError: true, duration: 2000 });
        }
    }

    const handleSave = () => {
        if (edit) {
            EditEarningPointsAPI()
        } else {
            // AddEarningPoints()
        }
    }


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
            primaryAction={{ content: edit ? "Update" : "Save", onAction: () => { handleSave() } }}
        >
            <Layout>
                <Layout.Section>
                    <Grid>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 4, md: 4, lg: 8, xl: 8 }}>
                            <BlockStack gap={400}>
                                <Card>
                                    <BlockStack gap={400}>
                                        <Text variant="headingMd" as="span">
                                            Earning points
                                        </Text>
                                        <TextField
                                            value={earningpoints}
                                            type="number"
                                            onChange={(value) => setEarningpoints(value)}
                                        />
                                    </BlockStack>
                                </Card>
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

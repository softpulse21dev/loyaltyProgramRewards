import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Badge, BlockStack, Box, Card, Grid, Layout, Page, Text, TextField } from "@shopify/polaris";
import { fetchData } from "../../utils";

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

    const EditEarningPoints = async () => {
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
    }


    return (
        <Page
            backAction={{ content: "Back", onAction: () => navigate("/loyaltyProgram") }}
            title={pageTitle}
            primaryAction={{ content: edit ? "Update" : "Save", onAction: () => { EditEarningPoints() } }}
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
                                            {status}
                                        </Badge>
                                    </Box>

                                    <Box>
                                        <div className="toggle-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                // checked={item.active}
                                                // id={`switch-${rule_id}`}
                                                // onChange={(e) =>
                                                //     handleRuleStatusChange(item.rule_id, e.target.checked)
                                                // }
                                                />
                                                <span className="slider"></span>
                                            </label>
                                        </div>





                                        {/* <div className="onoffswitch">
                                            <input
                                                type="checkbox"
                                                className="onoffswitch-checkbox test_mode"
                                                id={`testMode-${rule?.rule_id}`}
                                                checked={status === "active"}
                                                onChange={() =>
                                                    setStatus((prev) =>
                                                        prev === "active" ? "inactive" : "active"
                                                    )
                                                }
                                            />
                                            <label
                                                className="onoffswitch-label"
                                                htmlFor={`testMode-${rule?.rule_id}`}
                                            >
                                                <span className="onoffswitch-inner onoffswitch-inner-testmode"></span>
                                                <span className="onoffswitch-switch"></span>
                                            </label>
                                        </div> */}
                                    </Box>
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

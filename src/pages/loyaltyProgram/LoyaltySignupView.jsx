import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { Badge, BlockStack, Box, Card, Grid, Layout, Page, Text, TextField, SkeletonBodyText, SkeletonDisplayText, Button, SkeletonPage, InlineGrid, InlineStack } from "@shopify/polaris";
import { fetchData } from "../../action";
import { DeleteIcon } from "@shopify/polaris-icons";
import ConfirmationModal from "../../components/ConfirmationModal";

const LoyaltySignupView = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { rule: locationRule, edit: locationEdit } = location.state || {};
    // Safely parse localStorage data
    const storedEditData = localStorage.getItem('loyaltyEditData');
    const parsedStoredData = storedEditData ? JSON.parse(storedEditData) : null;
    const { rule_id: storedRuleId, edit: storedEdit, rule_type: storedRuleType } = parsedStoredData || {};

    // Create rule state: use locationRule if available, otherwise construct from stored data
    const [rule, setRule] = useState(() => {
        if (locationRule) return locationRule;
        // On page reload, construct minimal rule object from stored data
        if (storedRuleId && storedRuleType) {
            return {
                rule_id: storedRuleId,
                type: storedRuleType
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
            // Store rule_type for page reload persistence
            localStorage.setItem('loyaltyEditData', JSON.stringify({
                rule_id: locationRule.rule_id,
                rule_type: locationRule.type,
                edit: false
            }));
        }
    }, [locationRule]);

    console.log('rulesignup', rule);

    const [earningpoints, setEarningpoints] = useState(1);
    const [earningPointsError, setEarningPointsError] = useState("");

    const [pageTitle, setPageTitle] = useState("Sign Up");
    const [status, setStatus] = useState("false");
    const [loading, setLoading] = useState(true);
    const [getdatabyID, setGetdatabyID] = useState();
    const [conditionalJson, setConditionalJson] = useState({
        birthday_updated_waiting_threshold_days: 1
    });
    const [birthdayError, setBirthdayError] = useState("");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const getRuleByIdAPI = useCallback(async (ruleId) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("rule_id", ruleId);
            const response = await fetchData("/get-merchant-earning-rules-by-id", formData);
            if (response?.data) {
                setGetdatabyID(response.data);
                // Save rule_id and rule_type to localStorage for persistence
                localStorage.setItem('loyaltyEditData', JSON.stringify({
                    rule_id: ruleId,
                    rule_type: response.data.type,
                    edit: true
                }));
                console.log('Get Rule By Id Response', response);
            }
        } catch (error) {
            console.error('Get Rule By Id Error', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const AddRuleAPI = async () => {
        if (!rule || !rule.master_rule_id || !rule.type) {
            shopify.toast.show('Rule data is missing. Please refresh the page.', { duration: 2000, isError: true });
            return;
        }
        const formData = new FormData();
        formData.append("master_rule_id", rule.master_rule_id);
        formData.append("type", rule.type);
        formData.append("points", earningpoints);
        formData.append("status", status);
        // formData.append("condition_json", JSON.stringify(conditionalJson));
        const response = await fetchData("/add-merchant-earning-rules", formData);
        console.log('Add Rule Response', response);
        if (response.status) {
            // Clear localStorage on successful save
            localStorage.removeItem('loyaltyEditData');
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
        const response = await fetchData("/update-merchant-earning-rules", formData);
        console.log('Update Rule By Id Response', response);
        if (response.status) {
            // Clear localStorage on successful update
            localStorage.removeItem('loyaltyEditData');
            navigate('/loyaltyProgram');
        } else {
            console.error('Update Url Error', response);
        }
    };

    const deleteEarningRuleAPI = async (ruleId) => {
        try {
            setDeleteLoading(true);
            const formData = new FormData();
            formData.append("rule_id", ruleId);
            const response = await fetchData("/delete-merchant-earning-rules", formData);
            setDeleteLoading(false);
            setIsDeleteModalOpen(false);
            console.log('Delete Earning Rule Response', response);
            if (response.status) {
                // Clear localStorage on successful delete - CRITICAL to prevent fetching deleted rule on reload
                localStorage.removeItem('loyaltyEditData');
                navigate('/loyaltyProgram');
                shopify.toast.show(response?.message, { duration: 2000 });
            }
            else {
                shopify.toast.show(response?.message, { duration: 2000, isError: true });
            }
        } catch (error) {
            console.error('Delete Earning Rule Error', error);
        }
    }

    // Track if API has been called to prevent multiple calls
    const [hasCalledAPI, setHasCalledAPI] = useState(false);

    useEffect(() => {
        if (edit) {
            if (ruleId && !getdatabyID && !hasCalledAPI) {
                // Only call API once if we don't already have the data
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
                const pointsValue = rule.points ?? rule.default_points;
                setEarningpoints(pointsValue);
                setStatus(rule.status ?? "false");
                // Only set title from rule if not in edit mode (edit mode will get title from API)
                setPageTitle(rule.title);
            }
        }
    }, [edit, ruleId, getdatabyID, hasCalledAPI, getRuleByIdAPI, rule]);

    useEffect(() => {
        if (getdatabyID) {
            const pointsValue = getdatabyID?.points ?? getdatabyID?.default_points ?? 1;
            setEarningpoints(pointsValue);
            setStatus(getdatabyID?.status ?? "false");
            setConditionalJson(getdatabyID?.condition_json);
            // Set title from API response - check multiple possible locations
            const titleFromAPI = getdatabyID?.title ||
                getdatabyID?.master_rule?.title ||
                (getdatabyID?.type === 'loyalty_anniversary' ? 'Loyalty Anniversary' :
                    getdatabyID?.type === 'birthday' ? 'Birthday' :
                        getdatabyID?.type === 'signup' ? 'Sign Up' :
                            getdatabyID?.type === 'add_wallet' ? 'Add Wallet' : 'Sign Up');
            setPageTitle(titleFromAPI);

            // Update rule with type from fetched data if rule is not from locationRule
            // This ensures rule.type is available for birthday field check on page reload
            if (getdatabyID.type && (!rule || !rule.type || rule.type !== getdatabyID.type)) {
                setRule(prev => ({
                    ...(prev || {}),
                    type: getdatabyID.type,
                    rule_id: getdatabyID.rule_id,
                    master_rule_id: getdatabyID.master_rule_id || prev?.master_rule_id
                }));
            }

            setLoading(false);
        }
    }, [getdatabyID, rule]);

    const handleStatusChange = () => {
        setStatus(prevStatus => prevStatus === true ? false : true);
    };

    // Validate inputs for errors
    const validateInputs = () => {
        let hasError = false;

        // Validate Earning Points
        if (earningpoints === "-") {
            setEarningPointsError("Enter a valid number");
            hasError = true;
        } else if (Number(earningpoints) < 1) {
            setEarningPointsError("Points cannot be less than 1");
            hasError = true;
        } else {
            setEarningPointsError("");
        }

        // Validate Birthday field only if it's the birthday rule
        if (rule?.type === 'birthday') {
            const value = conditionalJson.birthday_updated_waiting_threshold_days;
            if (value === "") {
                setBirthdayError("This field is required");
                hasError = true;
            } else {
                const num = Number(value);
                if (num < 1) {
                    setBirthdayError("Must be at least 1 day");
                    hasError = true;
                } else if (num > 365) {
                    setBirthdayError("Cannot exceed 365 days");
                    hasError = true;
                } else {
                    setBirthdayError("");
                }
            }
        }
        return hasError;
    };

    const handleSave = () => {
        const hasValidationErrors = validateInputs();
        if (hasValidationErrors) {
            return; // Stop execution if there are errors
        }

        // If validation passes, proceed with API calls
        if (edit) {
            const idToUse = rule?.rule_id || getdatabyID?.rule_id || ruleId;
            if (idToUse) {
                updateRuleAPI(idToUse);
            } else {
                shopify.toast.show('Rule ID is missing. Please refresh the page.', { duration: 2000, isError: true });
            }
        } else {
            AddRuleAPI();
        }
    };

    // ✨ CHANGED: Simplified onChange handlers
    const handleEarningPointsChange = (value) => {
        // Allow only numbers for typing 
        if (/^\d*$/.test(value)) {
            setEarningpoints(value);
        }
        if (earningPointsError) {
            setEarningPointsError("");
        }
    };
    const handleBirthdayChange = (value) => {
        // Allow only numbers
        if (/^\d*$/.test(value)) {
            setConditionalJson({
                ...conditionalJson,
                birthday_updated_waiting_threshold_days: value,
            });
        }
        if (birthdayError) {
            setBirthdayError("");
        }
    };
    // ✨ NEW: onBlur handlers to parse and clean the input
    const handleEarningPointsBlur = () => {
        // Check if the value is a valid integer string before parsing
        if (earningpoints && /^-?\d+$/.test(earningpoints)) {
            const numericValue = parseInt(earningpoints, 10); // "002" becomes 2
            setEarningpoints(String(numericValue)); // Update state with "2"
        }
    };

    const handleBirthdayBlur = () => {
        const currentValue = conditionalJson.birthday_updated_waiting_threshold_days;
        // Check if the value is a valid integer string
        if (currentValue && /^\d+$/.test(currentValue)) {
            const numericValue = parseInt(currentValue, 10); // "007" becomes 7
            setConditionalJson({
                ...conditionalJson,
                birthday_updated_waiting_threshold_days: String(numericValue),
            });
        }
    };

    return (
        <>
            {loading ?
                <SkeletonPage
                    primaryAction={{ content: <SkeletonDisplayText size="small" /> }}
                >

                    <InlineGrid columns={['twoThirds', 'oneThird']} gap={400} >
                        <Card>
                            <SkeletonBodyText lines={7} />
                        </Card>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <Card>
                                <SkeletonBodyText lines={4} />
                            </Card>
                            <Card>
                                <SkeletonBodyText lines={3} />
                            </Card>
                        </div>
                    </InlineGrid>

                </SkeletonPage>
                :
                (
                    <Page
                        backAction={{
                            content: "Back", onAction: () => {
                                // Clear localStorage when navigating back
                                localStorage.removeItem('loyaltyEditData');
                                navigate("/loyaltyProgram");
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
                        primaryAction={{ content: edit ? "Update" : "Save", onAction: handleSave }}
                        secondaryActions={(getdatabyID?.default_rules === '0' && edit) ? <Button variant='secondary' tone='critical' icon={DeleteIcon} onClick={() => { setIsDeleteModalOpen(true) }}>Delete</Button> : undefined}
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
                                                            type="text"
                                                            error={earningPointsError} // This will now only show an error after Save is clicked
                                                            onChange={handleEarningPointsChange}
                                                            onBlur={handleEarningPointsBlur}
                                                        />
                                                    )}
                                                </BlockStack>
                                            </Card>

                                            {rule?.type === 'birthday' && (
                                                <Card>
                                                    <TextField
                                                        label="Birthday eligibility cutoff"
                                                        helpText="Set how far in advance customers must provide their birthdate to be eligible for birthday rewards"
                                                        suffix="Days"
                                                        type="text"
                                                        value={conditionalJson?.birthday_updated_waiting_threshold_days}
                                                        error={birthdayError} // This will now only show an error after Save is clicked
                                                        onChange={handleBirthdayChange}
                                                        onBlur={handleBirthdayBlur}
                                                    />
                                                </Card>
                                            )}
                                        </BlockStack>
                                    </Grid.Cell>
                                    {/* --- No changes to the right-hand side Summary/Status column --- */}
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 2, md: 2, lg: 4, xl: 4 }}>
                                        <BlockStack gap={400}>
                                            <Card>
                                                <Text variant="headingMd" as="span">
                                                    Summary
                                                </Text>
                                                <ul style={{ listStyle: "inherit", paddingInline: 20 }}>
                                                    {rule?.type === 'loyalty_anniversary' && (
                                                        <li>
                                                            <p>Customers will automatically earn points each year on the anniversary of the date they joined the loyalty program.</p>
                                                        </li>
                                                    )}
                                                    {rule?.type === 'birthday' && (
                                                        <>
                                                            <li>Customers earn bonus points on their birthday each year.</li>
                                                            <li> Rewards are granted automatically if the birthday is provided before the eligibility cutoff. </li>
                                                            <li>Points are added once per year to celebrate the customer’s birthday.</li>
                                                        </>
                                                    )}
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
                                                        <Badge tone={status === true ? "success" : "critical"}>
                                                            {status ? "Active" : "Inactive"}
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
                                                                        checked={status === true}
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
};

export default LoyaltySignupView;
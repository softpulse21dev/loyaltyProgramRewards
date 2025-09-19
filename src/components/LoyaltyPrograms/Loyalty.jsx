import {
    Card,
    Layout,
    Button,
    ResourceList,
    ResourceItem,
    Text,
    Box,
    Modal,
    InlineStack,
    Icon,
    TextField,
} from "@shopify/polaris";
import { RewardIcon } from "@shopify/polaris-icons";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { iconsMap, NavigateMap } from "../../utils";
import { fetchData } from "../../action";

const Loyalty = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loyaltyData, setLoyaltyData] = useState([]);
    const [modalActive, setModalActive] = useState(false);
    const [redeemModalActive, setRedeemModalActive] = useState(false);
    const navigate = useNavigate();
    const toggleRedeemModal = useCallback(() => setRedeemModalActive((active) => !active), []);
    const toggleModal = useCallback(() => setModalActive((active) => !active), []);

    const fetchSettingsAPI = async () => {
        const response = await fetchData("/get-merchant-settings?Y6vg3RZzOZz7a9W", new FormData());
        if (response.status && response.data) {
            setStatus(response.data.status);
            setLoyaltyData(response.data);
        } else {
            shopify.toast.show(response?.message, { duration: 2000, isError: true });
        }
    };

    const handleToggleStatus = async () => {
        setLoading(true);
        const formData = new FormData();
        formData.append("status", !status ? "true" : "false");

        const response = await fetchData("/update-merchant-settings?Y6vg3RZzOZz7a9W", formData);
        setLoading(false);
        if (response.status) {
            setStatus((prev) => !prev);
        }
    };

    useEffect(() => {
        fetchSettingsAPI();
    }, []);

    const handleRuleStatusChangeAPI = async (ruleId, isActive, isEarningRule = true) => {
        const formData = new FormData();
        formData.append("status", isActive ? "active" : "inactive");
        formData.append("rule_id", ruleId);

        const url = isEarningRule ? "/update-merchant-earning-rules-status?Y6vg3RZzOZz7a9W" : "/update-merchant-redeeming-rules-status?Y6vg3RZzOZz7a9W";
        const response = await fetchData(url, formData);

        if (response.status) {
            shopify.toast.show(response?.message, { duration: 2000 });
            fetchSettingsAPI(); // Re-fetch data to update the UI
        } else {
            shopify.toast.show(response?.message, { duration: 2000, isError: true });
        }
    };

    return (
        <div className="annotatedSection-border icon-size">
            <Layout.AnnotatedSection
                title={'Loyalty program status'}
                description={'Activate/Deactivate your points program'}
            >
                <Card>
                    <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Text variant="headingMd">
                            {status === null
                                ? "Loading..."
                                : status
                                    ? "This feature is Activated"
                                    : "This feature is Deactivated"}
                        </Text>
                        <Button
                            primary={status === false}
                            tone={status ? "critical" : "success"}
                            onClick={handleToggleStatus}
                            loading={loading}
                            disabled={status === null}
                        >
                            {status ? "Deactivate" : "Activate"}
                        </Button>
                    </Box>
                </Card>
            </Layout.AnnotatedSection>

            <Layout.AnnotatedSection
                title="Earning Points"
                description={
                    <>
                        <Box>
                            <p>Customize how your customers will earn points</p>
                        </Box>
                        <Box style={{ marginTop: 7, marginLeft: 0 }}>
                            <Button variant="primary" onClick={toggleModal}>Add Another Way to Earn</Button>
                        </Box>
                    </>
                }
            >
                <Card padding={0}>
                    <Box style={{ padding: '16px 16px 16px 16px', backgroundColor: "#F5F5F5" }}>
                        <Text variant="headingMd" as="h6">Customers will earn points through the actions below</Text>
                    </Box>
                    <ResourceList
                        resourceName={{ singular: "earning", plural: "earnings" }}
                        items={loyaltyData?.earning_rules?.active_rules?.other_rules || []}
                        renderItem={(item) => {
                            const { id, title, points, icon, rule_id, status: itemStatus } = item;
                            const IconSource = iconsMap[icon];
                            return (
                                <ResourceItem id={id}>
                                    <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <Box style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                            <Icon source={IconSource} />
                                            <Box>
                                                <Text variant="bodyMd">{title}</Text>
                                                <Text variant="bodyMd">{points}</Text>
                                            </Box>
                                        </Box>
                                        <Box style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                            <Button onClick={() =>
                                                navigate(NavigateMap[item.display_use_type], {
                                                    state: { rule: item, edit: true },
                                                })
                                            } variant="plain">Edit</Button>
                                            <div className="toggle-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <label className="switch">
                                                    <input
                                                        type="checkbox"
                                                        checked={itemStatus === 'active'}
                                                        id={`switch-${rule_id}`}
                                                        onChange={(e) =>
                                                            handleRuleStatusChangeAPI(item.rule_id, e.target.checked)
                                                        }
                                                    />
                                                    <span className="slider"></span>
                                                </label>
                                            </div>
                                        </Box>
                                    </Box>
                                </ResourceItem>
                            );
                        }}
                    />
                    <ResourceList
                        resourceName={{ singular: "earning", plural: "earnings" }}
                        items={loyaltyData?.earning_rules?.active_rules?.social_rules || []}
                        headerContent={<Text variant="headingMd" as="h6">Social Rules</Text>}
                        showHeader={true}
                        renderItem={(item) => {
                            const { id, title, points, icon, rule_id, status: itemStatus } = item;
                            const IconSource = iconsMap[icon];
                            return (
                                <ResourceItem id={id}>
                                    <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <Box style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                            <Icon source={IconSource} />
                                            <Box>
                                                <Text variant="bodyMd">{title}</Text>
                                                <Text variant="bodyMd">{points}</Text>
                                            </Box>
                                        </Box>
                                        <Box style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                            <Button onClick={() =>
                                                navigate(NavigateMap[item.display_use_type], {
                                                    state: { rule: item, edit: true },
                                                })
                                            } variant="plain">Edit</Button>
                                            <div className="toggle-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <label className="switch">
                                                    <input
                                                        type="checkbox"
                                                        checked={itemStatus === 'active'}
                                                        id={`switch-${rule_id}`}
                                                        onChange={(e) =>
                                                            handleRuleStatusChangeAPI(item.rule_id, e.target.checked)
                                                        }
                                                    />
                                                    <span className="slider"></span>
                                                </label>
                                            </div>
                                        </Box>
                                    </Box>
                                </ResourceItem>
                            );
                        }}
                    />
                </Card>
            </Layout.AnnotatedSection>
            <Layout.AnnotatedSection
                title={'Redeeming rule'}
                description={
                    <>
                        <Box>
                            <p>Let customer redeem their earned points</p>
                        </Box>
                        <Box style={{ marginTop: 7, marginLeft: 0 }}>
                            <Button variant="primary" onClick={toggleRedeemModal}>Add new rule</Button>
                        </Box>
                    </>
                }
            >
                <Card padding={0}>
                    <Box style={{ padding: '16px 16px 16px 16px' }}>
                        <Text variant="headingMd" as="h6">Customers can redeem these rewards using their points</Text>
                    </Box>
                    <ResourceList
                        resourceName={{ singular: "rule", plural: "rules" }}
                        items={loyaltyData?.redeeming_rules?.active_rules || []}
                        renderItem={(item) => {
                            const { id, title, points, icon, status: itemStatus } = item;
                            const IconSource = iconsMap[icon] || RewardIcon;
                            return (
                                <ResourceItem id={id}>
                                    <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <Box style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                            <Icon source={IconSource} />
                                            <Box>
                                                <Text variant="bodyMd">{title}</Text>
                                                <Text variant="bodyMd">{points}</Text>
                                            </Box>
                                        </Box>
                                        <Box style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                            <Button variant="plain" onClick={() => navigate(`/loyaltyProgram/CouponPage${window.location.search}`, { state: { rule: item, edit: true } })}>Edit</Button>
                                            <div className="toggle-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <label className="switch">
                                                    <input
                                                        type="checkbox"
                                                        checked={itemStatus === 'active'}
                                                        onChange={(e) =>
                                                            handleRuleStatusChangeAPI(item.id, e.target.checked, false)
                                                        }
                                                    />
                                                    <span className="slider"></span>
                                                </label>
                                            </div>
                                        </Box>
                                    </Box>
                                </ResourceItem>
                            );
                        }}
                    />
                </Card>
            </Layout.AnnotatedSection>

            <Layout.AnnotatedSection
                title={'Birthday Eligibility Period'}
                description={'Set how far in advance customers must provide their birthdate to be eligible for birthday rewards'}
            >
                <Card>
                    <TextField
                        type="number"
                        label="Date of Birth Updated Wait Period"
                        suffix="Days"
                        value={30}
                        onChange={() => { " " }}
                        min={1}
                        max={30}
                    />
                </Card>
            </Layout.AnnotatedSection>

            <Modal
                open={modalActive}
                onClose={toggleModal}
                title="Ways to Earn"
                large
            >
                <Modal.Section>
                    <ResourceList
                        items={loyaltyData?.earning_rules?.master_rules || []}
                        renderItem={(item) => {
                            const { id, title, type } = item;
                            const route = NavigateMap[type] || `/loyaltyProgram/loyaltysocialview${window.location.search}`;

                            return (
                                <ResourceItem id={id}>
                                    <InlineStack align="space-between" blockAlign="center">
                                        <Box style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <Box>
                                                <Icon source={RewardIcon} />
                                            </Box>
                                            <Text>{title}</Text>
                                        </Box>
                                        <Button onClick={() =>
                                            navigate(route, { state: { rule: item } })
                                        } >ADD</Button>
                                    </InlineStack>
                                </ResourceItem>
                            );
                        }}
                    />
                </Modal.Section>
            </Modal>

            <Modal
                open={redeemModalActive}
                onClose={toggleRedeemModal}
                title="Redeeming Rules"
                large
            >
                <Modal.Section>
                    <ResourceList
                        items={loyaltyData?.redeeming_rules?.master_rules || []}
                        renderItem={(item) => {
                            const IconSource = iconsMap[item.icon] || RewardIcon;
                            return (
                                <ResourceItem id={item.master_rule_id}>
                                    <InlineStack align="space-between" blockAlign="center">
                                        <Box style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <Box>
                                                <Icon source={IconSource} />
                                            </Box>
                                            <Text>{item.title}</Text>
                                        </Box>
                                        <Button
                                            onClick={() =>
                                                navigate(`/loyaltyProgram/CouponPage`, { state: { rule: item } })
                                            }
                                        >
                                            ADD
                                        </Button>
                                    </InlineStack>
                                </ResourceItem>
                            );
                        }}
                    />
                </Modal.Section>
            </Modal>
        </div>
    );
};

export default Loyalty;
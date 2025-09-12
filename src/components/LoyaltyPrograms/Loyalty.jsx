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
    const [waysToEarn, setWaysToEarn] = useState([]);
    const [earningOptions, setEarningOptions] = useState([]);
    const [socialOptions, setSocialOptions] = useState([]);
    const [modalActive, setModalActive] = useState(false);
    const [redeemAvailableRules, setRedeemAvailableRules] = useState([]);
    const [redeemPoints, setRedeemPoints] = useState([]);
    const [redeemModalActive, setRedeemModalActive] = useState(false);
    const navigate = useNavigate();
    const toggleRedeemModal = useCallback(() => setRedeemModalActive((active) => !active), []);
    const toggleModal = useCallback(() => setModalActive((active) => !active), []);


    const fetchSettings = async () => {
        const response = await fetchData("/get-merchant-settings?Y6vg3RZzOZz7a9W", new FormData());
        if (response.status && response.data) {
            setStatus(response.data.status);
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

    const waysToEarnAPI = async () => {
        const formData = new FormData();
        formData.append("setting_id", "ztEfTSMcDejdHNDnDiM5xBPdJdEuyCEkwhxdaL==");

        const result = await fetchData("/get-master-rules?Y6vg3RZzOZz7a9W", formData);
        console.log('result', result);
        if (result.status !== false) {
            const earning = result.active_rules?.other_rules?.map(rule => ({
                ...rule,
                active: rule.status === "active"
            })) || [];

            const social = result.active_rules?.social_rules?.map(rule => ({
                ...rule,
                active: rule.status === "active"
            })) || [];

            setWaysToEarn(result.available_rules);
            setEarningOptions(earning);
            setSocialOptions(social);
        }
    };

    const fetchRedeemPoints = async () => {
        const formData = new FormData();
        formData.append("setting_id", "ztEfTSMcDejdHNDnDiM5xBPdJdEuyCEkwhxdaL==");

        const response = await fetchData("/list-merchant-redeeming-rules?Y6vg3RZzOZz7a9W", formData);

        if (response.status && response.data) {
            const formatted = response.data.map(rule => ({
                id: rule.id,
                title: rule.title,
                points: rule.points,
                icon: "DiscountCodeIcon",
                active: rule.status === "active"
            }));
            setRedeemPoints(formatted);
        }
    };

    const fetchRedeemRules = async () => {
        const formData = new FormData();
        formData.append("setting_id", "ztEfTSMcDejdHNDnDiM5xBPdJdEuyCEkwhxdaL==");

        const response = await fetchData(
            "/get-master-redeeming-rules?Y6vg3RZzOZz7a9W",
            formData
        );

        if (response.status && response.online_store_rewards) {
            setRedeemAvailableRules(response.online_store_rewards);
        }
    };

    useEffect(() => {
        fetchSettings();
        waysToEarnAPI();
        fetchRedeemRules();
        fetchRedeemPoints();
    }, []);

    const handleRuleStatusChange = async (ruleId, isActive) => {
        const formData = new FormData();
        formData.append("status", isActive ? "active" : "inactive");
        formData.append("setting_id", "ztEfTSMcDejdHNDnDiM5xBPdJdEuyCEkwhxdaL==");
        formData.append("rule_id", ruleId);

        const response = await fetchData(
            "/update-merchant-earning-rules-status?Y6vg3RZzOZz7a9W",
            formData
        );

        if (response.status) {
            setEarningOptions((prev) =>
                prev.map((rule) =>
                    rule.rule_id === ruleId ? { ...rule, active: isActive } : rule
                )
            );
            setSocialOptions((prev) =>
                prev.map((rule) =>
                    rule.rule_id === ruleId ? { ...rule, active: isActive } : rule
                )
            );
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
                        items={earningOptions}
                        renderItem={(item) => {
                            const { id, title, points, icon, rule_id } = item;
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
                                                        checked={item.active}
                                                        id={`switch-${rule_id}`}
                                                        onChange={(e) =>
                                                            handleRuleStatusChange(item.rule_id, e.target.checked)
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
                        items={socialOptions}
                        headerContent={<Text variant="headingMd" as="h6">Social Rules</Text>}
                        showHeader={true}
                        renderItem={(item) => {
                            const { id, title, points, icon, rule_id } = item;
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
                                                        checked={item.active}
                                                        id={`switch-${rule_id}`}
                                                        onChange={(e) =>
                                                            handleRuleStatusChange(item.rule_id, e.target.checked)
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
                            <Button variant="primary" onClick={() => {
                                toggleRedeemModal();
                            }}>Add new rule</Button>
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
                        items={redeemPoints}
                        renderItem={(item) => {
                            const { id, title, points, icon, active } = item;
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
                                            <Button variant="plain" onClick={() => navigate(`/loyaltyProgram/CouponPage${window.location.search}`)}>Edit</Button>
                                            <div className="toggle-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <label className="switch">
                                                    <input
                                                        type="checkbox"
                                                        checked={active}
                                                        onChange={(e) =>
                                                            handleRuleStatusChange(item.id, e.target.checked)
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
                        items={waysToEarn}
                        renderItem={(item) => {
                            const { id, title, type } = item;
                            const route =
                                NavigateMap[type] || `/loyaltyProgram/loyaltysocialview${window.location.search}`;

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
                        items={redeemAvailableRules}
                        renderItem={(item) => {
                            const { master_rule_id, title, icon } = item;
                            const IconSource = iconsMap[icon] || RewardIcon;

                            return (
                                <ResourceItem id={master_rule_id}>
                                    <InlineStack align="space-between" blockAlign="center">
                                        <Box style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <Box>
                                                <Icon source={IconSource} />
                                            </Box>
                                            <Text>{title}</Text>
                                        </Box>
                                        <Button
                                            onClick={() =>
                                                navigate(`/loyaltyProgram/redeemRuleView`, { state: { rule: item } })
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
}

export default Loyalty;
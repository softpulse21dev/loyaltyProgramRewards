import { Card, Layout, Button, ResourceList, ResourceItem, Text, Box, Modal, InlineStack, Icon, TextField, SkeletonBodyText, } from "@shopify/polaris";
import { RewardIcon } from "@shopify/polaris-icons";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { iconsMap, NavigateMap } from "../../utils";
import { fetchData } from "../../action";
import RedeemModal from "../RedeemModal";

const Loyalty = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingMasterRules, setLoadingMasterRules] = useState(false);
    const [loyaltyData, setLoyaltyData] = useState([]);
    const [modalActive, setModalActive] = useState(false);
    const [redeemModalActive, setRedeemModalActive] = useState(false);
    const navigate = useNavigate();
    const toggleModal = useCallback(() => setModalActive((active) => !active), []);

    const fetchSettingsAPI = async () => {
        setLoadingMasterRules(true);
        const response = await fetchData("/get-merchant-settings", new FormData());
        console.log('response', response);
        if (response.status && response.data) {
            setStatus(response.data.status);
            setLoyaltyData(response.data);
            setLoadingMasterRules(false);
        } else {
            shopify.toast.show(response?.message, { duration: 2000, isError: true });
            setLoadingMasterRules(false);
        }
    };

    const handleToggleStatus = async () => {
        setLoading(true);
        const formData = new FormData();
        formData.append("status", !status ? "true" : "false");

        const response = await fetchData("/update-merchant-settings", formData);
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
        formData.append("status", isActive ? true : false);
        formData.append("rule_id", ruleId);
        const url = isEarningRule ? "/update-merchant-earning-rules-status" : "/update-merchant-redeeming-rules-status";
        const response = await fetchData(url, formData);

        if (response.status) {
            // ✅ Update local state only (no refetch / no page reload)
            setLoyaltyData((prev) => {
                if (!prev) return prev;

                // ---- EARNING RULES ----
                if (isEarningRule) {
                    const otherRules = prev?.earning_rules?.active_rules?.other_rules || [];
                    const socialRules = prev?.earning_rules?.active_rules?.social_rules || [];

                    const updatedOtherRules = Array.isArray(otherRules)
                        ? otherRules.map((r) =>
                            r.rule_id === ruleId ? { ...r, status: isActive } : r
                        )
                        : otherRules;

                    const updatedSocialRules = Array.isArray(socialRules)
                        ? socialRules.map((r) =>
                            r.rule_id === ruleId ? { ...r, status: isActive } : r
                        )
                        : socialRules;

                    return {
                        ...prev,
                        earning_rules: {
                            ...prev.earning_rules,
                            active_rules: {
                                ...prev.earning_rules?.active_rules,
                                other_rules: updatedOtherRules,
                                social_rules: updatedSocialRules,
                            },
                        },
                    };
                }

                // ---- REDEEMING RULES ----
                const redeemingRules = prev?.redeeming_rules?.active_rules || [];
                const updatedRedeemingRules = Array.isArray(redeemingRules)
                    ? redeemingRules.map((r) =>
                        r.id === ruleId ? { ...r, status: isActive } : r
                    )
                    : redeemingRules;

                return {
                    ...prev,
                    redeeming_rules: {
                        ...prev.redeeming_rules,
                        active_rules: updatedRedeemingRules,
                    },
                };
            });

            shopify.toast.show(response?.message, { duration: 2000 });
        } else {
            shopify.toast.show(response?.message, { duration: 2000, isError: true });
        }
    };

    return (
        <div className="annotatedSection-border">
            <Layout.AnnotatedSection
                title={'Loyalty program status'}
                description={'Activate/Deactivate your points program'}
            >
                <Card>
                    <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        {loadingMasterRules ? <SkeletonBodyText lines={2} /> : (
                            <>
                                <Text variant="headingMd">
                                    {status ? "This feature is Activated" : "This feature is Deactivated"}
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
                            </>
                        )}
                    </Box>
                </Card>
            </Layout.AnnotatedSection>

            <Layout.AnnotatedSection
                title="Earning Points"
                description={
                    <>
                        <Box>
                            <p>Customize how your customers will earn points</p>
                            <p>Customers will earn points through the actions below</p>
                        </Box>
                        {loyaltyData?.earning_rules?.master_rules?.length > 0 && (
                            <Box style={{ marginTop: 7, marginLeft: 0 }}>
                                <Button variant="primary" onClick={toggleModal}>Add Another Way to Earn</Button>
                            </Box>
                        )}
                    </>
                }
            >
                <div className="icon-size">
                    <Card padding={0}>
                        {/* <Box style={{ padding: '16px 16px 16px 16px', backgroundColor: "#F5F5F5" }}>
                            <Text variant="headingMd" as="h6">Customers will earn points through the actions below</Text>
                        </Box> */}
                        {loadingMasterRules ? <Box style={{ padding: '16px' }}>
                            <SkeletonBodyText lines={15} />
                        </Box> : (
                            <>
                                <ResourceList
                                    resourceName={{ singular: "earning", plural: "earnings" }}
                                    items={loyaltyData?.earning_rules?.active_rules?.other_rules || []}
                                    renderItem={(item) => {
                                        const { title, points, icon, rule_id, status: itemStatus } = item;
                                        const IconSource = iconsMap[icon];
                                        return (
                                            <ResourceItem key={rule_id}>
                                                <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <Box style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                                        {/* <Icon source={IconSource} /> */}
                                                        <Box>
                                                            <Text variant="bodyMd">{title}</Text>
                                                            <Text variant="bodyMd">{points} points</Text>
                                                        </Box>
                                                    </Box>
                                                    <Box style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                                        <div className="toggle-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <label className="switch">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={itemStatus === true}
                                                                    id={`switch-${rule_id}`}
                                                                    onChange={(e) =>
                                                                        handleRuleStatusChangeAPI(item.rule_id, e.target.checked)
                                                                    }
                                                                />
                                                                <span className="slider"></span>
                                                            </label>
                                                        </div>

                                                        <Button onClick={() => {
                                                            localStorage.setItem('loyaltyEditData', JSON.stringify({ rule_id: item.rule_id, edit: true }));
                                                            navigate(NavigateMap[item.display_use_type], {
                                                                state: { rule: item, edit: true },
                                                            });
                                                        }} >Edit</Button>
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
                                        const { title, points, icon, rule_id, status: itemStatus } = item;
                                        const IconSource = iconsMap[icon];
                                        return (
                                            <ResourceItem key={rule_id}>
                                                <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <Box style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                                        {/* <Icon source={IconSource} /> */}
                                                        <Box>
                                                            <Text variant="bodyMd">{title}</Text>
                                                            <Text variant="bodyMd">{points} points</Text>
                                                        </Box>
                                                    </Box>
                                                    <Box style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                                        <div className="toggle-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <label className="switch">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={itemStatus === true}
                                                                    id={`switch-${rule_id}`}
                                                                    onChange={(e) =>
                                                                        handleRuleStatusChangeAPI(item.rule_id, e.target.checked)
                                                                    }
                                                                />
                                                                <span className="slider"></span>
                                                            </label>
                                                        </div>
                                                        <Button onClick={() =>
                                                            navigate(NavigateMap[item.display_use_type], {
                                                                state: { rule: item, edit: true },
                                                            })
                                                        } >Edit</Button>
                                                    </Box>
                                                </Box>
                                            </ResourceItem>
                                        );
                                    }}
                                />
                            </>
                        )}
                    </Card>
                </div>
            </Layout.AnnotatedSection>

            <Layout.AnnotatedSection
                title={'Redeeming rule'}
                description={
                    <>
                        <Box>
                            <p>Let customer redeem their earned points</p>
                            <p>Customers can redeem these rewards using their points</p>
                        </Box>
                        <Box style={{ marginTop: 7, marginLeft: 0 }}>
                            <Button variant="primary" onClick={() => setRedeemModalActive(true)}>Add new rule</Button>
                        </Box>
                    </>
                }
            >
                <div className="icon-size">
                    <Card padding={0}>
                        {/* <Box style={{ padding: '16px 16px 16px 16px' }}>
                            <Text variant="headingMd" as="h6">Customers can redeem these rewards using their points</Text>
                        </Box> */}
                        {loadingMasterRules ? <Box style={{ padding: '16px' }}>
                            <SkeletonBodyText lines={15} />
                        </Box> : (
                            <ResourceList
                                resourceName={{ singular: "rule", plural: "rules" }}
                                items={loyaltyData?.redeeming_rules?.active_rules || []}
                                renderItem={(item) => {
                                    const { id, title, points, icon, status: itemStatus } = item;
                                    const IconSource = iconsMap[icon];
                                    return (
                                        <ResourceItem key={id}>
                                            <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <Box style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                                    {/* <Icon source={IconSource} /> */}
                                                    <Box>
                                                        <Text variant="bodyMd">{title}</Text>
                                                        <Text variant="bodyMd">{points} points</Text>
                                                    </Box>
                                                </Box>
                                                <Box style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                                    <div className="toggle-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <label className="switch">
                                                            <input
                                                                type="checkbox"
                                                                checked={itemStatus === true}
                                                                onChange={(e) =>
                                                                    handleRuleStatusChangeAPI(item.id, e.target.checked, false)
                                                                }
                                                            />
                                                            <span className="slider"></span>
                                                        </label>
                                                    </div>
                                                    <Button onClick={() => navigate(`/loyaltyProgram/CouponPage`, { state: { rule: item, edit: true } })}>Edit</Button>
                                                </Box>
                                            </Box>
                                        </ResourceItem>
                                    );
                                }}
                            />
                        )}
                    </Card>
                </div>
            </Layout.AnnotatedSection>

            {/* <Layout.AnnotatedSection
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
            </Layout.AnnotatedSection> */}

            <Modal
                open={modalActive}
                onClose={toggleModal}
                title="Ways to Earn"
                large
            >
                {loadingMasterRules ? (
                    <Box style={{ padding: '16px' }}>
                        <SkeletonBodyText lines={8} />
                    </Box>
                ) : (
                    <ResourceList
                        items={loyaltyData?.earning_rules?.master_rules || []}
                        renderItem={(item) => {
                            const { id, title, type } = item;
                            const route = NavigateMap[type] || `/loyaltyProgram/loyaltysocialview${window.location.search}`;

                            return (
                                <ResourceItem id={id}>
                                    <InlineStack align="space-between" blockAlign="center">
                                        <Box style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            {/* <Box>
                                                <Icon source={RewardIcon} />
                                            </Box> */}
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
                )}
            </Modal>

            <RedeemModal active={redeemModalActive} setActive={setRedeemModalActive} data={loyaltyData?.redeeming_rules?.master_rules} loading={loadingMasterRules} />

        </div>
    );
};

export default Loyalty;
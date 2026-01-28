import { Card, Layout, Button, Text, Box, Icon, BlockStack, TextField, ResourceList, ResourceItem, InlineStack, SkeletonBodyText, } from "@shopify/polaris";
import { EditIcon, GiftCardIcon } from "@shopify/polaris-icons";
import { fetchData } from "../../action";
import { useEffect, useState } from "react";
import RedeemModal from "../RedeemModal";
import { iconsMap } from "../../utils";
import { useNavigate } from "react-router-dom";

const Referral = () => {
    const [referralData, setReferralData] = useState({});
    const [referralModalActive, setReferralModalActive] = useState(false);
    const [isAdvocate, setIsAdvocate] = useState(false);
    const [isReferalStatus, setIsReferalStatus] = useState(false);
    const [isCustomerAccountStatus, setIsCustomerAccountStatus] = useState(false);
    const [isReferalRule, setIsReferalRule] = useState(false);
    const [activateLoading, setActivateLoading] = useState(false);
    const [loadingReferralRules, setLoadingReferralRules] = useState(false);
    const [requireAccountLoading, setRequireAccountLoading] = useState(false);
    const [navigateTo, setNavigateTo] = useState(0);
    const navigate = useNavigate();

    const GetReferralRulesAPI = async () => {
        setLoadingReferralRules(true);
        const formData = new FormData();
        const response = await fetchData("/get-referral-setting", formData);
        console.log('Get Redeem Rule By ID Response', response.data);
        if (response?.status === true) {
            setReferralData(response);
            setIsReferalStatus(response?.data?.status);
            setIsCustomerAccountStatus(response?.data?.require_account);
            console.log('referralData', referralData?.data?.referral_setting_id)
            setLoadingReferralRules(false);
        } else {
            shopify.toast.show(response?.message, { duration: 2000, isError: true });
            setLoadingReferralRules(false);
        }
    }

    const UpdateReferalStatusAPI = async (refralstatus, customerAccountStatus, status) => {
        if (status) {
            setActivateLoading(true);
        } else {
            setRequireAccountLoading(true);
        }
        try {
            const formData = new FormData();
            formData.append("referral_setting_id", referralData?.data?.referral_setting_id);
            formData.append("status", refralstatus);
            formData.append("require_account", customerAccountStatus);
            const response = await fetchData("/update-referral-rewards-status", formData);
            console.log('Update Refer Error', response);
            if (response?.status === true) {
                if (status) {
                    setIsReferalStatus(!isReferalStatus);
                } else {
                    GetReferralRulesAPI();
                }
                shopify.toast.show(response?.message, { duration: 2000 });
            }
        } catch (error) {
            console.error('Update Refer Error', error);
        } finally {
            if (status) {
                setActivateLoading(false);
            } else {
                setRequireAccountLoading(false);
            }
        }
    }

    // ✅ Modified function to handle "Single Active" logic locally
    const updateReferalRuleStatusAPI = async (id, status) => {
        try {
            const formData = new FormData();
            formData.append("referral_rule_id", id);
            formData.append("status", status ? false : true);
            const response = await fetchData("/update-referral-rule-status", formData);
            console.log('Update Refer Error', response);
            if (response?.status === true) {
                const newStatus = !status; // The status we want to apply

                setReferralData((prev) => {
                    if (!prev) return prev;

                    // Helper function to update a specific list (Referral or Advocate)
                    const updateList = (list) => {
                        if (!Array.isArray(list)) return [];

                        // Check if the item exists in this list so we only update the correct group
                        const existsInList = list.some((item) => item.referral_rule_id === id);
                        if (!existsInList) return list;

                        return list.map((item) => {
                            if (item.referral_rule_id === id) {
                                // This is the specific item toggled
                                return { ...item, status: newStatus };
                            } else {
                                // For all other items:
                                // If we just ENABLED the target (newStatus === true), we must DISABLE others.
                                // If we just DISABLED the target, we leave others as they are.
                                return newStatus ? { ...item, status: false } : item;
                            }
                        });
                    };

                    return {
                        ...prev,
                        referred_friend_reward: {
                            ...prev.referred_friend_reward,
                            added: updateList(prev?.referred_friend_reward?.added),
                        },
                        advocate_reward: {
                            ...prev.advocate_reward,
                            added: updateList(prev?.advocate_reward?.added),
                        },
                    };
                });

                shopify.toast.show(response?.message, { duration: 2000 });
            } else {
                shopify.toast.show(response?.message, { duration: 2000, isError: true });
            }
        } catch (error) {
            console.error('Update Refer Error', error);
        }
    }

    console.log('referralData', referralData)
    useEffect(() => {
        GetReferralRulesAPI();
    }, []);

    return (
        <div className="annotatedSection-border">
            <Layout.AnnotatedSection
                title={'Referral program status'}
                description={'Activate/Deactivate your Referral program'}
            >
                <Card>
                    {loadingReferralRules ? <SkeletonBodyText lines={2} /> : (
                        <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Text variant="headingMd">This feature is {isReferalStatus ? 'Activated' : 'Deactivated'}</Text>
                            <Button loading={activateLoading} onClick={() => { UpdateReferalStatusAPI(!isReferalStatus, isCustomerAccountStatus, true) }} primary tone={isReferalStatus ? 'critical' : 'success'}>{isReferalStatus ? 'Deactivate' : 'Activate'}</Button>
                        </Box>
                    )}
                </Card>
            </Layout.AnnotatedSection>

            <Layout.AnnotatedSection
                title={'Referral Rewards'}
                description={<>
                    <Box style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <Text>Set referrals/Advocate rewards</Text>
                        <Text>Only one reward can be enabled at a time for each type</Text>
                    </Box>
                </>}
            >
                <BlockStack gap="400">
                    {/* referral rewards */}
                    <Card padding="0">

                        <Box style={{ backgroundColor: "#F5F5F5", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Text variant="headingMd">Referral Rewards</Text>
                            {referralData?.referred_friend_reward?.available?.length > 0 && (
                                <Button variant="plain" onClick={() => { setIsAdvocate(false), setIsReferalRule(true); setReferralModalActive(true); setNavigateTo(1); }}>Add Reward</Button>
                            )}
                        </Box>

                        {loadingReferralRules ? <Box style={{ padding: '16px' }}><SkeletonBodyText lines={13} /></Box> : (
                            <>
                                {(referralData?.referred_friend_reward?.added?.length > 0) ?
                                    (<ResourceList
                                        items={referralData?.referred_friend_reward?.added || []}
                                        renderItem={(item) => {
                                            const { id, title, icon, redeemed_so_far, referral_rule_id, status, points } = item;
                                            const IconSource = iconsMap[icon] || GiftCardIcon;
                                            return (
                                                <ResourceItem key={id}>
                                                    <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                        <Box>
                                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                                <Icon source={IconSource} />
                                                                <Box>
                                                                    <Text variant="bodyMd">{title}</Text>
                                                                    <InlineStack gap="100" align="center">
                                                                        {/* <Text variant="bodyMd">{points} points</Text>
                                                                        <Text variant="bodyMd" fontWeight="bold">|</Text> */}
                                                                        <Text variant="bodyMd">{redeemed_so_far || 0} redeemed so far</Text>
                                                                    </InlineStack>
                                                                </Box>
                                                            </div>
                                                        </Box>
                                                        <Box style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                            <div className="toggle-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <label className="switch">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={status}
                                                                        onChange={() => updateReferalRuleStatusAPI(referral_rule_id, status)}
                                                                    />
                                                                    <span className="slider"></span>
                                                                </label>
                                                            </div>
                                                            <Button onClick={() => { navigate(`/loyaltyProgram/CouponPage`, { state: { rule: item, referralRule: true, edit: true, navigateTo: 1 } }) }} >Edit</Button>
                                                        </Box>
                                                    </Box>
                                                </ResourceItem>
                                            );
                                        }}
                                    />
                                    ) : (
                                        <Box style={{ padding: "10px 16px" }}>
                                            <Text variant="bodyMd">Referral Rewards</Text>
                                        </Box>
                                    )
                                }
                            </>
                        )}

                    </Card>

                    {/* advocate rewards */}
                    <Card padding="0">
                        <Box style={{ backgroundColor: "#F5F5F5", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Text variant="headingMd">Advocate Rewards</Text>
                            {referralData?.advocate_reward?.available?.length > 0 && (
                                <Button variant="plain" onClick={() => { setIsAdvocate(true), setIsReferalRule(true), setReferralModalActive(true); setNavigateTo(1); }}>Add Reward</Button>
                            )}
                        </Box>

                        {loadingReferralRules ? (
                            <Box style={{ padding: '16px' }}>
                                <SkeletonBodyText lines={15} />
                            </Box>
                        ) : (
                            <Box style={{ backgroundColor: "#FFF", }}>
                                <div >
                                    {(referralData?.advocate_reward?.added?.length > 0) ?
                                        (<ResourceList
                                            items={referralData?.advocate_reward?.added || []}
                                            renderItem={(item) => {
                                                const { id, title, icon, redeemed_so_far, referral_rule_id, status, points } = item;
                                                const IconSource = iconsMap[icon] || GiftCardIcon;
                                                return (
                                                    <ResourceItem key={id}>
                                                        <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                            <Box>
                                                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                                    <Icon source={IconSource} />
                                                                    <Box>
                                                                        <Text variant="bodyMd">{title}</Text>
                                                                        {/* <InlineStack gap="100" align="center"> */}
                                                                        {/* <Text variant="bodyMd">{points} points</Text>
                                                                            <Text variant="bodyMd" fontWeight="bold">|</Text> */}
                                                                        <Text variant="bodyMd">{redeemed_so_far || 0} redeemed so far</Text>
                                                                        {/* </InlineStack> */}
                                                                    </Box>
                                                                </div>
                                                            </Box>
                                                            <Box style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                                <div className="toggle-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <label className="switch">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={status}
                                                                            onChange={() => updateReferalRuleStatusAPI(referral_rule_id, status)}
                                                                        />
                                                                        <span className="slider"></span>
                                                                    </label>
                                                                </div>
                                                                <Button onClick={() => { navigate(`/loyaltyProgram/CouponPage`, { state: { rule: item, referralRule: true, edit: true, navigateTo: 1 } }) }}>Edit</Button>
                                                            </Box>
                                                        </Box>
                                                    </ResourceItem>
                                                );
                                            }}
                                        />
                                        ) :
                                        (
                                            <Box style={{ padding: "10px 16px" }}>
                                                <Text variant="bodyMd">Advocate Rewards</Text>
                                            </Box>
                                        )
                                    }
                                </div>
                            </Box>
                        )}
                    </Card>
                </BlockStack>
            </Layout.AnnotatedSection>

            {/* <Layout.AnnotatedSection
                title={'Referrals Customer Account'}
                description={'If "ON", it requires customer to create an account to claim referral coupon'}
            >
                <Card>
                    <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Text variant="headingMd">Current status is enabled.</Text>
                        <div className="toggle-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={isCustomerAccountStatus}
                                    onChange={() => UpdateReferalStatusAPI(isReferalStatus, !isCustomerAccountStatus, false)}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </Box>
                </Card>
            </Layout.AnnotatedSection>

            <Layout.AnnotatedSection
                title={'Referrals Redirection URL'}
                description={'Set the URL that customers will be redirected to when visiting a referral link'}
            >
                <Card>
                    <BlockStack gap={200}>
                        <TextField
                            label="Referrals Landing URL Domain"
                            placeholder="kg-demo-store.shopify.com"
                            value={''}
                            onChange={''}
                        />
                        <TextField
                            label="Referrals Landing URL Path"
                            helpText='Your homepage will be the default if you leave this blank'
                            value={''}
                            onChange={''}
                        />
                    </BlockStack>
                </Card>
            </Layout.AnnotatedSection> */}

            <RedeemModal navigateTo={navigateTo} active={referralModalActive} setActive={setReferralModalActive} data={isAdvocate ? referralData?.advocate_reward?.available : referralData?.referred_friend_reward?.available} referralRule={isReferalRule} loading={loadingReferralRules} />
        </div >
    );
}

export default Referral;
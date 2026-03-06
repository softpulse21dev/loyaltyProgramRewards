import { createContext, useContext, useState, useCallback } from "react";
import { fetchData } from "../action";

const LoyaltyDataContext = createContext(null);

export const useLoyaltyData = () => {
    const context = useContext(LoyaltyDataContext);
    if (!context) {
        throw new Error("useLoyaltyData must be used within a LoyaltyDataProvider");
    }
    return context;
};

export const LoyaltyDataProvider = ({ children }) => {
    const [loyaltyData, setLoyaltyData] = useState(null);
    const [loadingMasterRules, setLoadingMasterRules] = useState(false);
    const [status, setStatus] = useState(null);
    const [hasFetched, setHasFetched] = useState(false);

    // ---- REFERRAL DATA ----
    const [referralData, setReferralData] = useState(null);
    const [loadingReferralRules, setLoadingReferralRules] = useState(false);
    const [hasFetchedReferral, setHasFetchedReferral] = useState(false);

    // ---- VIP TIER ----
    const [hasFetchedVipTier, setHasFetchedVipTier] = useState(false);

    // Fetch loyalty data from API (called on initial load / page reload)
    const fetchLoyaltyData = useCallback(async () => {
        setLoadingMasterRules(true);
        try {
            const response = await fetchData("/get-merchant-settings", new FormData());
            console.log('response', response);
            if (response.status && response.data) {
                setStatus(response.data.status);
                setLoyaltyData(response.data);
                setHasFetched(true);
            } else {
                shopify.toast.show(response?.message, { duration: 2000, isError: true });
            }
        } catch (error) {
            console.error("Error fetching loyalty data:", error);
        } finally {
            setLoadingMasterRules(false);
        }
    }, []);

    // Update master loyalty status
    const setLoyaltyStatus = useCallback((newStatus) => {
        setStatus(newStatus);
        setLoyaltyData((prev) => prev ? { ...prev, status: newStatus } : prev);
    }, []);

    // ---- EARNING RULES helpers ----

    const addEarningRule = useCallback((newRule, isSocialRule = false) => {
        setLoyaltyData((prev) => {
            if (!prev) return prev;
            const key = isSocialRule ? "social_rules" : "other_rules";
            const currentRules = prev?.earning_rules?.active_rules?.[key] || [];

            // Also remove this rule from master_rules so the "Add" modal reflects the change
            const currentMasterRules = prev?.earning_rules?.master_rules || [];
            const updatedMasterRules = currentMasterRules.filter(
                (mr) => mr.id !== newRule.master_rule_id && mr.master_rule_id !== newRule.master_rule_id
            );

            return {
                ...prev,
                earning_rules: {
                    ...prev.earning_rules,
                    active_rules: {
                        ...prev.earning_rules?.active_rules,
                        [key]: [...currentRules, newRule],
                    },
                    master_rules: updatedMasterRules,
                },
            };
        });
    }, []);

    const updateEarningRule = useCallback((ruleId, updatedFields) => {
        setLoyaltyData((prev) => {
            if (!prev) return prev;
            const otherRules = prev?.earning_rules?.active_rules?.other_rules || [];
            const socialRules = prev?.earning_rules?.active_rules?.social_rules || [];

            const updatedOtherRules = Array.isArray(otherRules)
                ? otherRules.map((r) =>
                    r.rule_id === ruleId ? { ...r, ...updatedFields } : r
                )
                : otherRules;

            const updatedSocialRules = Array.isArray(socialRules)
                ? socialRules.map((r) =>
                    r.rule_id === ruleId ? { ...r, ...updatedFields } : r
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
        });
    }, []);

    const deleteEarningRule = useCallback((ruleId) => {
        setLoyaltyData((prev) => {
            if (!prev) return prev;
            const otherRules = prev?.earning_rules?.active_rules?.other_rules || [];
            const socialRules = prev?.earning_rules?.active_rules?.social_rules || [];

            return {
                ...prev,
                earning_rules: {
                    ...prev.earning_rules,
                    active_rules: {
                        ...prev.earning_rules?.active_rules,
                        other_rules: Array.isArray(otherRules)
                            ? otherRules.filter((r) => r.rule_id !== ruleId)
                            : otherRules,
                        social_rules: Array.isArray(socialRules)
                            ? socialRules.filter((r) => r.rule_id !== ruleId)
                            : socialRules,
                    },
                },
            };
        });
    }, []);

    // ---- REDEEMING RULES helpers ----

    const addRedeemingRule = useCallback((newRule) => {
        setLoyaltyData((prev) => {
            if (!prev) return prev;
            const currentRules = prev?.redeeming_rules?.active_rules || [];
            return {
                ...prev,
                redeeming_rules: {
                    ...prev.redeeming_rules,
                    active_rules: [...currentRules, newRule],
                },
            };
        });
    }, []);

    const updateRedeemingRule = useCallback((ruleId, updatedFields) => {
        setLoyaltyData((prev) => {
            if (!prev) return prev;
            const redeemingRules = prev?.redeeming_rules?.active_rules || [];
            const updatedRedeemingRules = Array.isArray(redeemingRules)
                ? redeemingRules.map((r) =>
                    r.id === ruleId ? { ...r, ...updatedFields } : r
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
    }, []);

    const deleteRedeemingRule = useCallback((ruleId) => {
        setLoyaltyData((prev) => {
            if (!prev) return prev;
            const redeemingRules = prev?.redeeming_rules?.active_rules || [];
            return {
                ...prev,
                redeeming_rules: {
                    ...prev.redeeming_rules,
                    active_rules: Array.isArray(redeemingRules)
                        ? redeemingRules.filter((r) => r.id !== ruleId)
                        : redeemingRules,
                },
            };
        });
    }, []);

    // ---- REFERRAL RULES helpers ----

    const fetchReferralData = useCallback(async () => {
        setLoadingReferralRules(true);
        try {
            const formData = new FormData();
            const response = await fetchData("/get-referral-setting", formData);
            console.log('Get Referral Setting Response', response.data);
            if (response?.status === true) {
                setReferralData(response);
                setHasFetchedReferral(true);
            } else {
                shopify.toast.show(response?.message, { duration: 2000, isError: true });
            }
        } catch (error) {
            console.error("Error fetching referral data:", error);
        } finally {
            setLoadingReferralRules(false);
        }
    }, []);

    const addReferralRule = useCallback((newRule, isAdvocate = false) => {
        setReferralData((prev) => {
            if (!prev) return prev;
            const key = isAdvocate ? "advocate_reward" : "referred_friend_reward";
            const currentAdded = prev?.[key]?.added || [];
            return {
                ...prev,
                [key]: {
                    ...prev[key],
                    added: [...currentAdded, newRule],
                },
            };
        });
    }, []);

    const updateReferralRule = useCallback((referralRuleId, updatedFields) => {
        setReferralData((prev) => {
            if (!prev) return prev;
            const updateList = (list) => {
                if (!Array.isArray(list)) return list;
                return list.map((item) =>
                    item.referral_rule_id === referralRuleId ? { ...item, ...updatedFields } : item
                );
            };
            return {
                ...prev,
                referred_friend_reward: {
                    ...prev.referred_friend_reward,
                    added: updateList(prev?.referred_friend_reward?.added || []),
                },
                advocate_reward: {
                    ...prev.advocate_reward,
                    added: updateList(prev?.advocate_reward?.added || []),
                },
            };
        });
    }, []);

    const deleteReferralRule = useCallback((referralRuleId) => {
        setReferralData((prev) => {
            if (!prev) return prev;
            const filterList = (list) => {
                if (!Array.isArray(list)) return list;
                return list.filter((item) => item.referral_rule_id !== referralRuleId);
            };
            return {
                ...prev,
                referred_friend_reward: {
                    ...prev.referred_friend_reward,
                    added: filterList(prev?.referred_friend_reward?.added || []),
                },
                advocate_reward: {
                    ...prev.advocate_reward,
                    added: filterList(prev?.advocate_reward?.added || []),
                },
            };
        });
    }, []);

    const value = {
        loyaltyData,
        setLoyaltyData,
        loadingMasterRules,
        status,
        setStatus,
        hasFetched,
        fetchLoyaltyData,
        setLoyaltyStatus,
        addEarningRule,
        updateEarningRule,
        deleteEarningRule,
        addRedeemingRule,
        updateRedeemingRule,
        deleteRedeemingRule,
        // Referral
        referralData,
        setReferralData,
        loadingReferralRules,
        hasFetchedReferral,
        fetchReferralData,
        addReferralRule,
        updateReferralRule,
        deleteReferralRule,
        // VIP Tier
        hasFetchedVipTier,
        setHasFetchedVipTier,
    };

    return (
        <LoyaltyDataContext.Provider value={value}>
            {children}
        </LoyaltyDataContext.Provider>
    );
};

export default LoyaltyDataContext;


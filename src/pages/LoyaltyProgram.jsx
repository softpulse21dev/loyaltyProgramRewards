import { useEffect, useState, useCallback } from "react";
import { Page, Tabs, } from "@shopify/polaris";

import VipTier from "../components/LoyaltyPrograms/VipTier";
import Loyalty from "../components/LoyaltyPrograms/Loyalty";
import Referral from "../components/LoyaltyPrograms/Referral";
import StoreCredit from "../components/LoyaltyPrograms/StoreCredit";
import { useLocation } from "react-router-dom";
import { fetchData } from "../action";
import { useDispatch } from "react-redux";
import { GetVipTierData, MasterRewardsList } from "../redux/action";


const LoyaltyProgram = () => {
    const location = useLocation();
    const { navigateTo } = location.state || {};
    console.log('navigateTo', navigateTo)
    
    // Initialize selectedTab from navigateTo or localStorage, default to 0
    const [selectedTab, setSelectedTab] = useState(() => {
        if (navigateTo !== undefined) {
            localStorage.setItem('loyaltyProgramTab', navigateTo);
            return navigateTo;
        }
        const stored = localStorage.getItem('loyaltyProgramTab');
        return stored !== null ? parseInt(stored, 10) : 0;
    });
    
    const [entryMethod, setEntryMethod] = useState(2);
    const [tierProgressExpiry, setTierProgressExpiry] = useState(1);
    const [loadingSave, setLoadingSave] = useState(false);
    const [loadingTiers, setLoadingTiers] = useState(false);
    const [vipStatus, setVipStatus] = useState(false);
    
    const dispatch = useDispatch();

    const GetVipTierAPI = useCallback(async () => {
        setLoadingTiers(true);
        try {
            const formData = new FormData();
            const response = await fetchData("/get-tiers", formData);
            console.log('response Reward Tier', response);
            if (response.status) {
                setEntryMethod(response?.data?.tier_method);
                setTierProgressExpiry(response?.data?.tier_expiry);
                setVipStatus(response?.data?.status === '1' ? true : false);
                dispatch(GetVipTierData(response?.data?.tier_settings));
                dispatch(MasterRewardsList(response?.master_rewards));
            } else {
                shopify.toast.show(response?.message, { duration: 2000, isError: true });
            }
        } catch (error) {
            console.error('Error fetching Reward tiers:', error);
            shopify.toast.show(error?.message, { duration: 2000, isError: true });
        } finally {
            setLoadingTiers(false);
        }
    }, [dispatch]);

    // Only fetch reward tier data when the reward Tier tab is selected
    useEffect(() => {
        if (selectedTab === 2) {
            GetVipTierAPI();
        }
    }, [selectedTab, GetVipTierAPI]);

    const UpdateVipTierAPI = async () => {
        try {
            setLoadingSave(true);
            const formData = new FormData();
            formData.append("tier_method", entryMethod);
            formData.append("tier_expiry", tierProgressExpiry);

            const response = await fetchData("/tier-setting", formData);
            console.log('responseStatus', response);

            if (response?.status) {
                shopify.toast.show(response?.message, { duration: 2000 });
            } else {
                shopify.toast.show(response?.message, { duration: 2000, isError: true });
            }
        } catch (err) {
            console.error("Error updating Reward Tier:", err);
        } finally {
            setLoadingSave(false);
        }
    };

    useEffect(() => {
        if (navigateTo !== undefined) {
            setSelectedTab(navigateTo);
            localStorage.setItem('loyaltyProgramTab', navigateTo);
        }
    }, [navigateTo]);

    // Update localStorage when tab changes
    const handleTabChange = (index) => {
        setSelectedTab(index);
        localStorage.setItem('loyaltyProgramTab', index);
    };

    // Clear localStorage when leaving the page via other means
    useEffect(() => {
        return () => {
            // Only clear if we're actually leaving the loyalty program section
            const currentPath = window.location.pathname;
            if (!currentPath.includes('/loyaltyProgram')) {
                localStorage.removeItem('loyaltyProgramTab');
            }
        };
    }, []);

    const tabs = [
        {
            id: "loyalty-tab",
            content: "Loyalty",
            panelID: "loyalty-content",
        },
        {
            id: "referral-tab",
            content: "Referral",
            panelID: "referral-content",
        },
        {
            id: "vip-tier-tab",
            content: "Reward Tier",
            panelID: "vip-tier-content",
        },
    ];

    return (
        <Page title="Loyalty program"
            primaryAction={selectedTab === 2 ? {
                content: 'Save',
                loading: loadingSave,
                onAction: UpdateVipTierAPI
            } : null}
        >
            <Tabs
                tabs={tabs}
                selected={selectedTab}
                onSelect={handleTabChange}
            >
                {selectedTab === 0 && (
                    <Loyalty />
                )}
                {selectedTab === 1 && (
                    <Referral />
                )}
                {selectedTab === 2 && (
                    <VipTier 
                        entryMethod={entryMethod} 
                        tierProgressExpiry={tierProgressExpiry} 
                        setEntryMethod={setEntryMethod} 
                        setTierProgressExpiry={setTierProgressExpiry}
                        vipStatus={vipStatus}
                        setVipStatus={setVipStatus}
                        loadingTiers={loadingTiers}
                        onRefreshData={GetVipTierAPI}
                    />
                )}
            </Tabs>
        </Page >
    );
}

export default LoyaltyProgram;
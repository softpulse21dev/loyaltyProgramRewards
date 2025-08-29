import { useState } from "react";
import { Page, Tabs, } from "@shopify/polaris";

import VipTier from "../components/LoyaltyPrograms/VipTier";
import Loyalty from "../components/LoyaltyPrograms/Loyalty";
import Referral from "../components/LoyaltyPrograms/Referral";
import StoreCredit from "../components/LoyaltyPrograms/StoreCredit";


const LoyaltyProgram = () => {
    const [selectedTab, setSelectedTab] = useState(0);

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
            id: "store-credit-tab",
            content: "Store Credit",
            panelID: "store-credit-content",
        },
        {
            id: "vip-tier-tab",
            content: "VIP Tier",
            panelID: "vip-tier-content",
        },
    ];

    return (
        <Page title="Loyalty program">
            <Tabs
                tabs={tabs}
                selected={selectedTab}
                onSelect={(index) => setSelectedTab(index)}
            >
                {selectedTab === 0 && (
                    <Loyalty />
                )}
                {selectedTab === 1 && (
                    <Referral />
                )}
                {selectedTab === 2 && (
                    <StoreCredit />
                )}
                {selectedTab === 3 && (
                    <VipTier />
                )}
            </Tabs>
        </Page >
    );
}

export default LoyaltyProgram;
import { useEffect, useState } from "react";
import { Page, Tabs, Text, } from "@shopify/polaris";
import { useLocation } from "react-router-dom";
import General from "../components/Settings/General";
import Language from "../components/Settings/Language";
import CustomerEmail from "../components/Settings/CustomerEmail";
import Theme from "../components/Settings/Theme";
import Orders from "../components/Settings/Orders";

const Settings = () => {
    const location = useLocation();
    const { navigateTo } = location.state || {};
    const [selectedTab, setSelectedTab] = useState(0);

    useEffect(() => {
        if (navigateTo) {
            setSelectedTab(navigateTo);
        }
    }, [navigateTo]);

    const tabs = [
        {
            id: "general",
            content: "General",
            panelID: "general-content",
        },
        {
            id: "language",
            content: "Language",
            panelID: "language-content",
        },
        {
            id: "customer-emails",
            content: "Customer Emails",
            panelID: "customer-emails-content",
        },
        {
            id: "orders",
            content: "Orders",
            panelID: "orders-content",
        },
    ];

    return (
        <Page title="Settings">
            <Tabs
                tabs={tabs}
                selected={selectedTab}
                onSelect={(index) => setSelectedTab(index)}
            >
                {selectedTab === 0 && (
                    <General />
                )}
                {selectedTab === 1 && (
                    <Language />
                )}
                {selectedTab === 2 && (
                    <CustomerEmail />
                )}
                {selectedTab === 3 && (
                    <Orders />
                )}
            </Tabs>
        </Page >
    );
}

export default Settings;
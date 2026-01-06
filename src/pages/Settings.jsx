import { useEffect, useState, useCallback } from "react";
import { Card, InlineGrid, Page, SkeletonBodyText, SkeletonDisplayText, SkeletonPage, SkeletonTabs, Tabs, Text, } from "@shopify/polaris";
import { useLocation } from "react-router-dom";
import General from "../components/Settings/General";
import Language from "../components/Settings/Language";
import CustomerEmail from "../components/Settings/CustomerEmail";
import Theme from "../components/Settings/Theme";
import Orders from "../components/Settings/Orders";
import { fetchData } from "../action";

const Settings = () => {
    const location = useLocation();
    const { navigateTo } = location.state || {};
    const [selectedTab, setSelectedTab] = useState(0);
    const [settingsData, setSettingsData] = useState(null);
    const [resetConfirmation, setResetConfirmation] = useState('');
    const [loadingSave, setLoadingSave] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        console.log('resetConfirmation', resetConfirmation);
    }, [resetConfirmation]);

    const generalDataToAppend = {
        account_email: settingsData?.[0]?.account_email,
        contact_number: settingsData?.[0]?.contact_number,
        contact_country_code: settingsData?.[0]?.contact_country_code,
        store_currency: settingsData?.[0]?.store_currency,
        excluded_tags: settingsData?.[0]?.excluded_tags,
        date_format: settingsData?.[0]?.date_format,
    }

    const ordersDataToAppend = {
        global_prefix: settingsData?.[0]?.discount_code_prefixes?.global_prefix,
        vip_prefix: settingsData?.[0]?.discount_code_prefixes?.vip_prefix,
        advocate_prefix: settingsData?.[0]?.discount_code_prefixes?.advocate_prefix,
        friend_prefix: settingsData?.[0]?.discount_code_prefixes?.friend_prefix,
        loyalty_prefix: settingsData?.[0]?.discount_code_prefixes?.loyalty_prefix,
        reward_financial_statuses: settingsData?.[0]?.reward_financial_statuses,
        loyalty_earning_trigger: settingsData?.[0]?.loyalty_earning_trigger,
        order_total_calculation: settingsData?.[0]?.order_total_calculation,
    }

    const getSettingsAPI = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            const response = await fetchData("/get-settings", formData);
            console.log('Settings Response', response);
            if (response.status) {
                setSettingsData(response.data);
            } else {
                shopify.toast.show(response?.message, { duration: 2000, isError: true });
            }
        } catch (error) {
            console.error('Error getting settings:', error);
        } finally {
            setLoading(false);
        }
    }

    const validateSettingsData = useCallback((data) => {
        const newErrors = {};

        if (!data) {
            return { 'general.account_email': 'Settings data not loaded' };
        }

        // General Tab - Account email validation
        const accountEmail = data?.[0]?.account_email;
        if (!accountEmail || accountEmail.trim() === "") {
            newErrors['general.account_email'] = 'Account email is required';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(accountEmail.trim())) {
                newErrors['general.account_email'] = 'Please enter a valid email address';
            }
        }

        // General Tab - Contact number validation (10 digits)
        const contactNumber = data?.[0]?.contact_number;

        // 1. Check if it is empty (Required check)
        if (!contactNumber || contactNumber.trim() === "") {
            newErrors['general.contact_number'] = 'Contact number is required';
        }
        // 2. If it is NOT empty, check the length (Format check)
        else {
            const digitsOnly = contactNumber.replace(/\D/g, '');
            if (digitsOnly.length !== 10) {
                newErrors['general.contact_number'] = 'Contact number must be exactly 10 digits';
            }
        }
        // Add more validations here as needed
        // Example:
        // if (!data?.[0]?.discount_code_prefixes?.global_prefix?.trim()) {
        //     newErrors['orders.global_prefix'] = 'Global prefix is required';
        // }

        return newErrors;
    }, []);

    // Get which tab has the first error
    const getFirstErrorTab = useCallback((errorKeys) => {
        if (errorKeys.length === 0) return null;

        const firstError = errorKeys[0];

        // Check General tab errors
        if (firstError.startsWith('general.')) {
            return 0;
        }

        // Check Orders tab errors
        if (firstError.startsWith('orders.')) {
            return 3;
        }

        // Check Language tab errors (if needed in future)
        if (firstError.startsWith('language.')) {
            return 1;
        }

        // Check Customer Emails tab errors (if needed in future)
        if (firstError.startsWith('customer-emails.')) {
            return 2;
        }

        return null;
    }, []);

    const clearError = useCallback((fieldPath) => {
        setErrors((prev) => {
            if (prev[fieldPath]) {
                const newErrors = { ...prev };
                delete newErrors[fieldPath];
                return newErrors;
            }
            return prev;
        });
    }, []);

    const saveSettingsAPI = async () => {
        if (!settingsData) {
            shopify.toast.show('Settings data is still loading. Please wait.', {
                duration: 2000,
                isError: true,
            });
            return;
        }

        const validationErrors = validateSettingsData(settingsData);
        setErrors(validationErrors);

        const errorKeys = Object.keys(validationErrors);
        if (errorKeys.length > 0) {
            const firstErrorTab = getFirstErrorTab(errorKeys);
            if (firstErrorTab !== null) {
                // Navigate to the tab with the first error
                setSelectedTab(firstErrorTab);
            }
            return;
        }

        setLoadingSave(true);
        try {
            const formData = new FormData();
            formData.append("general", JSON.stringify(generalDataToAppend));
            formData.append("orders", JSON.stringify(ordersDataToAppend));
            const response = await fetchData("/update-settings", formData);
            console.log('Save Settings Response', response);
            if (response.status && response.status === true) {
                shopify.toast.show(response.message, { duration: 2000 });
            } else {
                shopify.toast.show(response.message, { duration: 2000, isError: true });
            }
        } catch (error) {
            console.error('Error saving settings:', error);
        } finally {
            setLoadingSave(false);
        }
    }

    useEffect(() => {
        getSettingsAPI();
    }, []);

    useEffect(() => {
        if (navigateTo) {
            setSelectedTab(navigateTo);
        }
    }, [navigateTo]);

    const tabs = [
        {
            id: "general",
            content: "General",
        },
        // {
        //     id: "language",
        //     content: "Language",
        // },
        // {
        //     id: "customer-emails",
        //     content: "Customer Emails",
        // },
        {
            id: "orders",
            content: "Orders",
        },
    ];

    return (
        <>
            {loading ? (
                <SkeletonPage
                    primaryAction={{ content: <SkeletonDisplayText size="small" /> }}
                >
                    <SkeletonTabs tabs={tabs} />
                    <SkeletonBodyText lines={15} />
                </SkeletonPage>
            ) : (
                <Page
                    title="Settings"
                    primaryAction={{
                        content: "Save",
                        loading: loadingSave,
                        onAction: () => { saveSettingsAPI(); }
                    }}
                >
                    <Tabs
                        tabs={tabs}
                        selected={selectedTab}
                        onSelect={(index) => setSelectedTab(index)}
                    >
                        {selectedTab === 0 && (
                            <General
                                settingsData={settingsData}
                                setSettingsData={setSettingsData}
                                errors={errors}
                                clearError={clearError}
                            />
                        )}
                        {selectedTab === 3 && (
                            <Language />
                        )}
                        {selectedTab === 2 && (
                            <CustomerEmail />
                        )}
                        {selectedTab === 1 && (
                            <Orders
                                settingsData={settingsData}
                                setSettingsData={setSettingsData}
                                errors={errors}
                                clearError={clearError}
                            />
                        )}
                    </Tabs>
                </Page >
            )}
        </>
    );
}

export default Settings;
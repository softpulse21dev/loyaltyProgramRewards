import { Badge, Banner, Box, Button, Card, Grid, InlineGrid, Page, SkeletonBodyText, SkeletonPage, SkeletonTabs, SkeletonThumbnail, Tabs, Text } from '@shopify/polaris';
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import General from './widgetTabs/General';
import StoreFront from './widgetTabs/StoreFront';
import Launcher from './widgetTabs/Launcher';
import { fetchData } from '../../action';

const Widget = () => {
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState(0);
    const [errors, setErrors] = useState({});
    const [generalCollapsible, setGeneralCollapsible] = useState('styles');
    const [storefrontCollapsible, setStorefrontCollapsible] = useState('header');
    const [widgetData, setWidgetData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false);

    const fetchWidgetAPI = useCallback(async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            const response = await fetchData('/get-onsite-settings', formData);
            console.log('Widgetresponse', response);
            if (response?.status) {
                // Ensure we always have an object, not null
                setWidgetData(response?.settings || {});
            } else {
                shopify.toast.show(response?.message || 'Failed to load settings', { duration: 2000, isError: true, });
                setWidgetData({});
            }
        } catch (error) {
            console.error('Failed to load widget data', error);
            shopify.toast.show('Failed to load widget data', { duration: 2000, isError: true, });
            setWidgetData({});
        } finally {
            setLoading(false);
        }
    }, []);

    const saveWidgetAPI = useCallback(
        async (dataToSave) => {
            if (!dataToSave) {
                shopify.toast.show('Nothing to save. Settings not loaded yet.', { duration: 2000, isError: true, });
                return;
            }

            setSaveLoading(true);
            try {
                const formData = new FormData();

                // Create a deep copy to avoid mutating original state
                const dataCopy = JSON.parse(JSON.stringify(dataToSave, (key, value) => {
                    // Replace File/Blob objects with null during stringify (we'll handle them separately)
                    if (value instanceof File || value instanceof Blob) {
                        return null;
                    }
                    return value;
                }));

                // Extract and append file objects separately to FormData
                // Header image
                if (dataToSave?.general?.styles?.header?.header_image instanceof File) {
                    formData.append('header_image', dataToSave.general.styles.header.header_image);
                    dataCopy.general.styles.header.header_image = 'FILE_UPLOAD'; // marker for backend
                }

                // Content/Background image
                if (dataToSave?.general?.styles?.content?.content_image instanceof File) {
                    formData.append('content_image', dataToSave.general.styles.content.content_image);
                    dataCopy.general.styles.content.content_image = '__FILE_UPLOAD__';
                }

                // New member card image
                if (dataToSave?.storefront_app?.new_member_card?.new_member_image instanceof File) {
                    formData.append('new_member_image', dataToSave.storefront_app.new_member_card.new_member_image);
                    dataCopy.storefront_app.new_member_card.new_member_image = '__FILE_UPLOAD__';
                }

                formData.append('settings_json', JSON.stringify(dataCopy));
                const response = await fetchData('/add-onsite-settings', formData);
                console.log('saveWidgetAPI response', response);
                if (response?.status) {
                    shopify.toast.show(response?.message || 'Settings saved', { duration: 2000, });
                } else {
                    shopify.toast.show(response?.message || 'Failed to save settings', { duration: 2000, isError: true, });
                }
            } catch (error) {
                console.error('Failed to save widget data', error);
                shopify.toast.show('Failed to save widget data', { duration: 2000, isError: true, });
            } finally {
                setSaveLoading(false);
            }
        },
        []
    );

    const handleUpdateStatus = useCallback(async (isEnabled) => {
        setStatusLoading(true);
        try {
            const formData = new FormData();
            formData.append('is_enabled', isEnabled ? '1' : '0');
            const response = await fetchData('/update-onsite-settings-status', formData);
            if (response?.status) {
                setWidgetData((prev) => ({
                    ...prev,
                    is_enabled: isEnabled
                }));
                shopify.toast.show(response?.message, { duration: 2000 });
            } else {
                shopify.toast.show(response?.message, { duration: 2000, isError: true, });
            }
        } catch (error) {
            console.error(`Failed to ${isEnabled ? 'enable' : 'disable'} widget`, error);
            shopify.toast.show(`Failed to ${isEnabled ? 'enable' : 'disable'} widget`, { duration: 2000, isError: true, });
        } finally {
            setStatusLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWidgetAPI();
    }, [fetchWidgetAPI]);

    const validateWidgetData = useCallback((data) => {
        const newErrors = {};

        if (!data) {
            return { general: 'Widget data not loaded' };
        }

        const isValidHexColor = (color) => {
            return color && /^#[0-9A-Fa-f]{6}$/.test(color);
        };

        // General Tab - Styles validation
        if (!data.general?.styles?.presentation) {
            newErrors['general.styles.presentation'] = 'Presentation is required';
        }
        if (!data.general?.styles?.position) {
            newErrors['general.styles.position'] = 'Position is required';
        }
        if (data.general?.styles?.header?.header_type === 'solid') {
            if (!isValidHexColor(data.general?.styles?.header?.solid)) {
                newErrors['general.styles.header.solid'] = 'Invalid hex color';
            }
        } else if (data.general?.styles?.header?.header_type === 'gradient') {
            if (!isValidHexColor(data.general?.styles?.header?.gradient?.color1)) {
                newErrors['general.styles.header.gradient.color1'] = 'Invalid hex color';
            }
            if (!isValidHexColor(data.general?.styles?.header?.gradient?.color2)) {
                newErrors['general.styles.header.gradient.color2'] = 'Invalid hex color';
            }
        } else if (data.general?.styles?.header?.header_type === 'image') {
            // Check if header image is uploaded (can be File object or string URL)
            if (!data.general?.styles?.header?.header_image) {
                newErrors['general.styles.header.header_image'] = 'Image is required';
            }
        }
        if (!isValidHexColor(data.general?.styles?.header?.header_bar_color)) {
            newErrors['general.styles.header.header_bar_color'] = 'Invalid hex color';
        }
        if (!isValidHexColor(data.general?.styles?.header?.header_bar_text_color)) {
            newErrors['general.styles.header.header_bar_text_color'] = 'Invalid hex color';
        }
        if (!isValidHexColor(data.general?.styles?.header?.text_color)) {
            newErrors['general.styles.header.text_color'] = 'Invalid hex color';
        }
        if (data.general?.styles?.content?.background_type === 'solid') {
            if (!isValidHexColor(data.general?.styles?.content?.solid)) {
                newErrors['general.styles.content.solid'] = 'Invalid hex color';
            }
        } else if (data.general?.styles?.content?.background_type === 'image') {
            // Check if content/background image is uploaded (can be File object or string URL)
            if (!data.general?.styles?.content?.content_image) {
                newErrors['general.styles.content.content_image'] = 'Image is required';
            }
        }
        if (!isValidHexColor(data.general?.styles?.content?.heading_color)) {
            newErrors['general.styles.content.heading_color'] = 'Invalid hex color';
        }
        if (!isValidHexColor(data.general?.styles?.content?.text_color)) {
            newErrors['general.styles.content.text_color'] = 'Invalid hex color';
        }
        if (!isValidHexColor(data.general?.styles?.accent?.button_text_color)) {
            newErrors['general.styles.accent.button_text_color'] = 'Invalid hex color';
        }
        if (!isValidHexColor(data.general?.styles?.accent?.button_color)) {
            newErrors['general.styles.accent.button_color'] = 'Invalid hex color';
        }
        if (!isValidHexColor(data.general?.styles?.accent?.link_color)) {
            newErrors['general.styles.accent.link_color'] = 'Invalid hex color';
        }
        if (!isValidHexColor(data.general?.styles?.accent?.icons_color)) {
            newErrors['general.styles.accent.icons_color'] = 'Invalid hex color';
        }

        // General Tab - Advanced validation
        if (!isValidHexColor(data.general?.advanced?.section?.background_color)) {
            newErrors['general.advanced.section.background_color'] = 'Invalid hex color';
        }
        if (!isValidHexColor(data.general?.advanced?.section?.card_border_color)) {
            newErrors['general.advanced.section.card_border_color'] = 'Invalid hex color';
        }
        if (!isValidHexColor(data.general?.advanced?.box?.background_color)) {
            newErrors['general.advanced.box.background_color'] = 'Invalid hex color';
        }
        if (!isValidHexColor(data.general?.advanced?.box?.border_color)) {
            newErrors['general.advanced.box.border_color'] = 'Invalid hex color';
        }
        if (!isValidHexColor(data.general?.advanced?.card?.background_color)) {
            newErrors['general.advanced.card.background_color'] = 'Invalid hex color';
        }
        if (!isValidHexColor(data.general?.advanced?.card?.border_color)) {
            newErrors['general.advanced.card.border_color'] = 'Invalid hex color';
        }
        if (!isValidHexColor(data.general?.advanced?.section?.progress_bar_fill)) {
            newErrors['general.advanced.section.progress_bar_fill'] = 'Invalid hex color';
        }
        if (!isValidHexColor(data.general?.advanced?.section?.progress_bar_background)) {
            newErrors['general.advanced.section.progress_bar_background'] = 'Invalid hex color';
        }
        if (!isValidHexColor(data.general?.advanced?.input?.input_color)) {
            newErrors['general.advanced.input.input_color'] = 'Invalid hex color';
        }
        if (!isValidHexColor(data.general?.advanced?.input?.input_border_color)) {
            newErrors['general.advanced.input.input_border_color'] = 'Invalid hex color';
        }

        // StoreFront Tab - Header validation
        if (!data.storefront_app?.header?.header_bar_text?.trim()) {
            newErrors['storefront.header.header_bar_text'] = 'Header bar text is required';
        }
        if (!data.storefront_app?.header?.header_text?.trim()) {
            newErrors['storefront.header.header_text'] = 'Header text is required';
        }
        if (!data.storefront_app?.header?.header_content?.trim()) {
            newErrors['storefront.header.header_content'] = 'Header content is required';
        }
        if (!data.storefront_app?.header?.history_button_text?.trim()) {
            newErrors['storefront.header.history_button_text'] = 'Header button text is required';
        }
        // if (!data.storefront_app?.header?.balance_text?.trim()) {
        //     newErrors['storefront.header.balance_text'] = 'Balance text is required';
        // }

        // StoreFront Tab - New Member Card validation
        if (!data.storefront_app?.new_member_card?.translations?.title?.trim()) {
            newErrors['storefront.new_member_card.title'] = 'Member card title is required';
        }
        if (!data.storefront_app?.new_member_card?.translations?.button_text?.trim()) {
            newErrors['storefront.new_member_card.button_text'] = 'Button text is required';
        }
        if (!data.storefront_app?.new_member_card?.translations?.signin_msg?.trim()) {
            newErrors['storefront.new_member_card.signin_msg'] = 'Sign-in message is required';
        }
        if (!data.storefront_app?.new_member_card?.translations?.signin_text?.trim()) {
            newErrors['storefront.new_member_card.signin_text'] = 'Sign-in link text is required';
        }

        // StoreFront Tab - Points Card validation
        if (!data.storefront_app?.points_card?.title?.trim()) {
            newErrors['storefront.points_card.title'] = 'Points card title is required';
        }
        if (!data.storefront_app?.points_card?.message?.trim()) {
            newErrors['storefront.points_card.message'] = 'Points card message is required';
        }
        if (!data.storefront_app?.points_card?.ways_to_earn_text?.trim()) {
            newErrors['storefront.points_card.ways_to_earn_text'] = 'Ways to earn text is required';
        }
        if (!data.storefront_app?.points_card?.ways_to_redeem_text?.trim()) {
            newErrors['storefront.points_card.ways_to_redeem_text'] = 'Ways to redeem text is required';
        }
        if (!data.storefront_app?.points_card?.my_rewards?.trim()) {
            newErrors['storefront.points_card.my_rewards'] = 'My rewards text is required';
        }

        // StoreFront Tab - Referral Card validation
        if (!data.storefront_app?.referrals_card?.title?.trim()) {
            newErrors['storefront.referrals_card.title'] = 'Referral card title is required';
        }
        if (!data.storefront_app?.referrals_card?.message?.trim()) {
            newErrors['storefront.referrals_card.message'] = 'Referral card message is required';
        }
        if (!data.storefront_app?.referrals_card?.referrer_title?.trim()) {
            newErrors['storefront.referrals_card.referrer_title'] = 'Referrer title is required';
        }
        if (!data.storefront_app?.referrals_card?.referee_title?.trim()) {
            newErrors['storefront.referrals_card.referee_title'] = 'Referee title is required';
        }
        if (!data.storefront_app?.referrals_card?.link_title?.trim()) {
            newErrors['storefront.referrals_card.link_title'] = 'Link title is required';
        }
        if (!data.storefront_app?.referrals_card?.my_discount_text?.trim()) {
            newErrors['storefront.referrals_card.my_discount_text'] = 'Discount title is required';
        }

        // StoreFront Tab - Reward Tiers Card validation
        if (!data.storefront_app?.reward_tiers_card?.title?.trim()) {
            newErrors['storefront.reward_tiers_card.title'] = 'Reward tiers title is required';
        }
        if (!data.storefront_app?.reward_tiers_card?.message?.trim()) {
            newErrors['storefront.reward_tiers_card.message'] = 'Reward tiers message is required';
        }
        if (!data.storefront_app?.reward_tiers_card?.customer_tier?.current_tier?.trim()) {
            newErrors['storefront.reward_tiers_card.current_tier'] = 'Current tier text is required';
        }
        if (!data.storefront_app?.reward_tiers_card?.customer_tier?.next_tier?.trim()) {
            newErrors['storefront.reward_tiers_card.next_tier'] = 'Next tier text is required';
        }
        if (!data.storefront_app?.reward_tiers_card?.customer_tier?.max_tier?.trim()) {
            newErrors['storefront.reward_tiers_card.max_tier'] = 'Max tier text is required';
        }
        if (!data.storefront_app?.reward_tiers_card?.all_tiers?.title?.trim()) {
            newErrors['storefront.reward_tiers_card.all_tiers'] = 'All tiers title is required';
        }

        // Launcher Tab validation
        if (!data.launcher?.layout?.title?.trim()) {
            newErrors['launcher.layout.title'] = 'Launcher title is required';
        }
        if (!isValidHexColor(data.launcher?.appearance?.text_color)) {
            newErrors['launcher.appearance.text_color'] = 'Invalid hex color';
        }
        if (data.launcher?.appearance?.background_type === 'solid') {
            if (!isValidHexColor(data.launcher?.appearance?.solid)) {
                newErrors['launcher.appearance.solid'] = 'Invalid hex color';
            }
        }
        if (data.launcher?.appearance?.background_type === 'gradient') {
            if (!isValidHexColor(data.launcher?.appearance?.gradient?.color1)) {
                newErrors['launcher.appearance.gradient.color1'] = 'Invalid hex color';
            }
            if (!isValidHexColor(data.launcher?.appearance?.gradient?.color2)) {
                newErrors['launcher.appearance.gradient.color2'] = 'Invalid hex color';
            }
        }

        return newErrors;
    }, []);

    // Get which tab and collapsible has the first error
    const getFirstErrorLocation = useCallback((errorKeys) => {
        if (errorKeys.length === 0) return null;

        const firstError = errorKeys[0];

        // Check General tab errors
        if (firstError.startsWith('general.styles')) {
            return { tab: 0, collapsible: 'styles' };
        }
        if (firstError.startsWith('general.advanced')) {
            return { tab: 0, collapsible: 'advanced' };
        }

        // Check StoreFront tab errors
        if (firstError.startsWith('storefront.header')) {
            return { tab: 1, collapsible: 'header' };
        }
        if (firstError.startsWith('storefront.new_member_card')) {
            return { tab: 1, collapsible: 'new' };
        }
        if (firstError.startsWith('storefront.points_card')) {
            return { tab: 1, collapsible: 'pointsCard' };
        }
        if (firstError.startsWith('storefront.referrals_card')) {
            return { tab: 1, collapsible: 'referralCard' };
        }
        if (firstError.startsWith('storefront.reward_tiers_card')) {
            return { tab: 1, collapsible: 'vipTier' };
        }

        // Check Launcher tab errors
        if (firstError.startsWith('launcher')) {
            return { tab: 2, collapsible: null };
        }

        return null;
    }, []);

    const tabs = [
        {
            id: 'widget-tab',
            content: 'General',
            panelID: 'general-content',
        },
        {
            id: 'settings-tab',
            content: 'Storefront app',
            panelID: 'store-front-content',
        },
        {
            id: 'appearance-tab',
            content: 'Launcher',
            panelID: 'launcher-content',
        },
    ];

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

    const handleSave = useCallback(() => {
        if (!widgetData) {
            shopify.toast.show('Widget data is still loading. Please wait.', {
                duration: 2000,
                isError: true,
            });
            return false;
        }

        const validationErrors = validateWidgetData(widgetData);
        setErrors(validationErrors);

        const errorKeys = Object.keys(validationErrors);
        if (errorKeys.length > 0) {
            const errorLocation = getFirstErrorLocation(errorKeys);
            if (errorLocation) {
                // Navigate to the tab with the first error
                setSelectedTab(errorLocation.tab);

                // Open the collapsible with the first error
                if (errorLocation.tab === 0 && errorLocation.collapsible) {
                    setGeneralCollapsible(errorLocation.collapsible);
                } else if (errorLocation.tab === 1 && errorLocation.collapsible) {
                    setStorefrontCollapsible(errorLocation.collapsible);
                }
            }
            return false;
        }

        saveWidgetAPI(widgetData);
        return true;
    }, [widgetData, validateWidgetData, getFirstErrorLocation, saveWidgetAPI,]);

    return (
        loading ?
            <Page fullWidth>
                <SkeletonPage primaryAction={<SkeletonThumbnail size="small" />} secondaryActions={<SkeletonThumbnail size="small" />}>
                    {/* <SkeletonBodyText lines={1} /> */}
                    <SkeletonTabs count={3} />
                    <Card>
                        <InlineGrid columns={2} gap='200' >
                            <Card>
                                <SkeletonBodyText lines={15} />
                            </Card>
                            <Card>
                                <SkeletonBodyText lines={15} />
                            </Card>
                        </InlineGrid>
                    </Card>
                </SkeletonPage>
            </Page > :
            (
                <>
                    <Page
                        // backAction={{ content: 'Back', onAction: () => navigate('/onsite') }}
                        title={
                            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                                <Text as="h1" variant="headingLg">Loyalty widget</Text>
                                <Badge tone={widgetData?.is_enabled ? 'success' : 'critical'}>
                                    {widgetData?.is_enabled ? 'Enabled' : 'Disabled'}
                                </Badge>
                            </Box>
                        }
                        primaryAction={
                            <Button
                                variant="primary"
                                onClick={handleSave}
                                loading={saveLoading}
                                disabled={loading || saveLoading || !widgetData}
                            >
                                Save
                            </Button>
                        }
                        secondaryActions={
                            widgetData?.is_enabled
                                ? [
                                    {
                                        content: 'Disable',
                                        destructive: true,
                                        onAction: () => handleUpdateStatus(false),
                                        loading: statusLoading,
                                    },
                                ]
                                : []
                        }
                        subtitle="A floating bubble customers can use to interact with your loyalty program"
                    >
                        {!widgetData?.is_enabled && (
                            <Box style={{ marginBottom: '30px' }}>
                                <Banner
                                    title={'Widget is disabled'}
                                    action={{ content: 'Enable', onAction: () => handleUpdateStatus(true), loading: statusLoading }}
                                    tone="warning"
                                >
                                    <p>
                                        You can still make changes, but it won't be visible to customers
                                        until you enable it.
                                    </p>
                                </Banner>
                            </Box>
                        )}

                        <Tabs
                            tabs={tabs}
                            selected={selectedTab}
                            onSelect={(index) => setSelectedTab(index)}
                        >
                            <Box paddingBlockStart="300">
                                {selectedTab === 0 && (
                                    <General
                                        widgetData={widgetData}
                                        setWidgetData={setWidgetData}
                                        errors={errors}
                                        clearError={clearError}
                                        openCollapsible={generalCollapsible}
                                        setOpenCollapsible={setGeneralCollapsible}
                                        loading={loading}
                                        setLoading={setLoading}
                                    />
                                )}
                                {selectedTab === 1 && (
                                    <StoreFront
                                        widgetData={widgetData}
                                        setWidgetData={setWidgetData}
                                        errors={errors}
                                        clearError={clearError}
                                        openCollapsible={storefrontCollapsible}
                                        setOpenCollapsible={setStorefrontCollapsible}
                                    />
                                )}
                                {selectedTab === 2 && (
                                    <Launcher
                                        widgetData={widgetData}
                                        setWidgetData={setWidgetData}
                                        errors={errors}
                                        clearError={clearError}
                                    />
                                )}
                            </Box>
                        </Tabs>
                    </Page>
                </>
            )
    );
};

export default Widget;

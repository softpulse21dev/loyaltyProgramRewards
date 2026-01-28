import { Box, Button, Card, Icon, InlineStack, Page, ResourceItem, ResourceList, SkeletonBodyText, SkeletonDisplayText, SkeletonPage, SkeletonTabs, Text } from '@shopify/polaris';
import { EmailIcon } from '@shopify/polaris-icons';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchData } from '../action';

const Emails = () => {
    const navigate = useNavigate();

    const [emailTemplates, setEmailTemplates] = useState([]);
    const [loading, setLoading] = useState(true);

    const getEmailTemplatesAPI = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            const response = await fetchData('/get-email-notifications-settings', formData);
            if (response?.status === true) {
                const data = response?.data?.email_notificatios_settings?.templates || {};
                setEmailTemplates(data);
            } else {
                shopify.toast.show(response?.message, { duration: 2000, isError: true });
            }
        } catch (error) {
            console.error('Error getting email templates:', error);
        } finally {
            setLoading(false);
        }
    }

    // ✅ FIX 1: Ensure this function returns true/false so handleStatusChange knows what happened
    const ToggleEmailTemplateStatusAPI = async (id, newStatus) => {
        try {
            const formData = new FormData();
            formData.append("template_key", id);
            formData.append("is_enabled", newStatus);
            const response = await fetchData('/toggle-email-notifications-settings', formData);

            if (response?.status === true) {
                shopify.toast.show(response?.message, { duration: 2000 });
                return true; // Success
            } else {
                shopify.toast.show(response?.message, { duration: 2000, isError: true });
                return false; // Failure
            }
        }
        catch (error) {
            console.error('Error toggling email template status:', error);
            return false; // Error
        }
    }

    const updateTemplateStatus = (templates, id, newStatus) => {
        // Handle if state is Array
        if (Array.isArray(templates)) {
            return templates.map(template =>
                (template.id === id || template.template_key === id)
                    ? { ...template, is_enabled: newStatus }
                    : template
            );
        }

        // Handle if state is Object (which your API seems to return)
        return Object.keys(templates).reduce((acc, key) => {
            const template = templates[key];
            const matches = template?.id === id || key === id;

            acc[key] = matches
                ? { ...template, is_enabled: newStatus, id: template?.id ?? key }
                : template;
            return acc;
        }, {});
    };

    const handleStatusChange = async (id, newStatus) => {
        // 1. Call API first (Wait for it)
        const success = await ToggleEmailTemplateStatusAPI(id, newStatus);

        // 2. Only update state if API returned true
        if (success) {
            setEmailTemplates(prev => updateTemplateStatus(prev, id, newStatus));
        } else {
            console.log("Toggle failed, keeping old state.");
        }
    };

    useEffect(() => {
        getEmailTemplatesAPI();
    }, []);

    return (
        <>
            {loading ?
                <SkeletonPage
                    primaryAction={{ content: <SkeletonDisplayText size="small" /> }}
                >
                    <SkeletonBodyText lines={10} />
                </SkeletonPage>
                : (
                    <Page
                        title="Loyalty Program Emails"
                        subtitle='Manage and customize your Loyalty program emails'
                        secondaryActions={<Button variant="secondary" onClick={() => { navigate('/emails/emailappearance') }}>Appearance</Button>}
                    >
                        <Card padding="0">
                            <ResourceList
                                resourceName={{ singular: 'email template', plural: 'email templates' }}
                                // Ensure we map over the data correctly regardless of if it's Array or Object
                                items={(Array.isArray(emailTemplates) ? emailTemplates : Object.entries(emailTemplates).map(([key, item]) => ({
                                    ...item,
                                    id: item.id ?? key
                                }))).map((item) => ({
                                    ...item,
                                    id: item.id,
                                    name: item.name,
                                    decription: item.decription,
                                    is_enabled: item.is_enabled
                                }))}
                                loading={loading}
                                emptyState={
                                    !loading && (
                                        <Box padding="400">
                                            <Text alignment="center" tone="subdued">No email templates found.</Text>
                                            <Text alignment="center" variant="bodyXs" tone="subdued">Check console for API structure.</Text>
                                        </Box>
                                    )
                                }
                                renderItem={(item) => {
                                    const { id, name, decription, is_enabled } = item;

                                    return (
                                        <ResourceItem id={id}>
                                            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>

                                                <InlineStack gap="400" blockAlign="center">
                                                    <Icon source={EmailIcon} tone="base" />
                                                    <Box style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                        <Text as="h3" variant="headingSm" fontWeight="bold">
                                                            {name}
                                                        </Text>
                                                        <Text as="span" variant="bodySm" tone="subdued">
                                                            {decription || 'No subject set'}
                                                        </Text>
                                                    </Box>
                                                </InlineStack>

                                                <InlineStack gap="400" blockAlign="center">
                                                    {id === 'otp_page' ? null :
                                                        (<div
                                                            className="toggle-container"
                                                            style={{ display: 'flex', alignItems: 'center' }}
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <label className="switch">
                                                                <input
                                                                    type="checkbox"
                                                                    // Handle both boolean true and integer 1
                                                                    checked={is_enabled === 1 || is_enabled === true}
                                                                    onChange={(e) => handleStatusChange(id, e.target.checked ? 1 : 0)}
                                                                />
                                                                <span className="slider"></span>
                                                            </label>
                                                        </div>)
                                                    }
                                                    <Button
                                                        variant="secondary"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            // ✅ FIX 3: Since 'item' comes from renderItem, 
                                                            // and renderItem re-runs when state updates, 
                                                            // this 'item' will contain the NEW is_enabled status automatically.
                                                            localStorage.setItem("editTemplateData", JSON.stringify(item));
                                                            navigate('/emails/emailtemplate', { state: { templateKey: id, templateData: item } });
                                                        }}
                                                    >
                                                        Edit
                                                    </Button>

                                                </InlineStack>

                                            </Box>
                                        </ResourceItem>
                                    );
                                }}
                            />
                        </Card>
                    </Page>
                )}
        </>
    )
}

export default Emails;
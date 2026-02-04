import { BlockStack, Box, Button, Card, Divider, Grid, Icon, InlineStack, Page, RadioButton, SkeletonBodyText, SkeletonDisplayText, SkeletonPage, Text, TextField } from '@shopify/polaris';
import { PinIcon } from '@shopify/polaris-icons';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchData } from '../../action';
import { darkenColor, FormatPlaceholder } from '../../utils';
import TestMailModal from '../../components/TestMailModal';

const EmailTemplate = () => {
  const storedData = localStorage.getItem('editTemplateData');
  const EmailData = storedData ? JSON.parse(storedData) : null;
  console.log('data tenos', EmailData)
  const navigate = useNavigate();
  const [status, setStatus] = useState(EmailData?.is_enabled);
  const [loading, setLoading] = useState(false); // To show loading state on button
  const [saveLoading, setSaveLoading] = useState(false);
  const [getLoading, setGetLoading] = useState(false);
  const [emailSettings, setEmailSettings] = useState(null);
  const [testMailModalOpen, setTestMailModalOpen] = useState(false);
  // --- State for Content ---
  const [emailSubject, setEmailSubject] = useState(EmailData?.subject);
  const [emailHeading, setEmailHeading] = useState(EmailData?.heading);
  const [emailContent, setEmailContent] = useState(EmailData?.content);
  const [emailAction, setEmailAction] = useState(EmailData?.action_text);
  const [emailActionUrl, setEmailActionUrl] = useState(EmailData?.redirect_url);
  const [errors, setErrors] = useState({});

  const validateFields = (urlToValidate) => {
    const newErrors = {};
    if (!emailSubject?.trim()) newErrors.subject = 'Subject is required';
    if (!emailHeading?.trim()) newErrors.heading = 'Heading is required';
    if (!emailContent?.trim()) newErrors.content = 'Content is required';

    if (EmailData?.id !== 'otp_page') {
      if (!emailAction?.trim()) newErrors.action = 'Action text is required';
      
      const urlValue = urlToValidate !== undefined ? urlToValidate : emailActionUrl;
      const cleanUrl = urlValue?.trim();
      
      if (cleanUrl && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(cleanUrl)) {
        newErrors.actionUrl = 'Invalid URL format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // --- Handler: Send Test Email ---
  const handleSendTestEmail = async () => {
    setLoading(true);

    // 1. Configuration: Gather current state from your UI AND the styling settings
    const emailConfig = {
      headingText: emailHeading,
      bodyText: emailContent,
      buttonText: emailAction,
      buttonUrl: emailActionUrl,
      // Pass the entire settings object so the generator has access to colors/images
      settings: emailSettings,
      templateId: EmailData?.id // To know if we need to show the reward code box
    };

    // 2. Test Data: specific data to fill the {placeholders} for the test
    const testData = {
      reward_name: "10% Off",
      reward_code: "TEST-CODE-123", // This matches your dotted box logic
      store_name: "My Shopify Store",
      email: "admin@example.com"
    };

    // 3. Generate the Raw HTML
    const finalHtml = generateEmailHtml(emailConfig, testData);

    // 4. Send to your Backend API
    try {
      console.log("Generated HTML to send:", finalHtml);

      // TODO: Uncomment and use your actual API call here
      /*
      const formData = new FormData();
      formData.append('html_body', finalHtml);
      formData.append('subject', emailSubject);
      formData.append('email', 'test@example.com');
      
      const response = await fetchData('/send-test-email', formData);
      if(response.status) {
           shopify.toast.show('Test email sent successfully');
      }
      */

      // Simulating API delay for demo
      setTimeout(() => {
        alert("Test email generated! Open Console (F12) to see the raw HTML code.");
        setLoading(false);
      }, 500);

    } catch (error) {
      console.error("Error sending test email", error);
      setLoading(false);
    }
  };

  const settingsData = {
    is_enabled: status,
    subject: emailSubject,
    heading: emailHeading,
    content: emailContent,
    action_text: emailAction,
    redirect_url: emailActionUrl,
    decription: EmailData?.decription,
    name: EmailData?.name,
  }

  const saveEmailTemplateAPI = async () => {
    const normalizedUrl = emailActionUrl?.trim() || '';
    const normalizedSubject = emailSubject?.trim() || '';
    const normalizedHeading = emailHeading?.trim() || '';
    const normalizedContent = emailContent?.trim() || '';
    const normalizedAction = emailAction?.trim() || '';

    let finalUrl = normalizedUrl;
    // Auto-fix URL: Add https:// if missing and not blank
    if (finalUrl !== '' && !/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }

    // Update state so UI reflects the trimmed/normalized values
    setEmailActionUrl(finalUrl);
    setEmailSubject(normalizedSubject);
    setEmailHeading(normalizedHeading);
    setEmailContent(normalizedContent);
    setEmailAction(normalizedAction);

    if (!validateFields(finalUrl)) {
      return;
    }

    setSaveLoading(true);
    try {
      const currentSettings = {
        is_enabled: status,
        subject: normalizedSubject,
        heading: normalizedHeading,
        content: normalizedContent,
        action_text: normalizedAction,
        redirect_url: finalUrl,
        decription: EmailData?.decription,
        name: EmailData?.name,
      };

      const formData = new FormData();
      formData.append('settings', JSON.stringify(currentSettings));
      formData.append('template_key', EmailData?.id);
      const response = await fetchData('/add-email-notifications-settings', formData);
      console.log('response', response)
      if (response.status === true) {
        localStorage.removeItem('editTemplateData');
        navigate('/emails');
        shopify.toast.show(response?.message, { duration: 2000 });
      } else {
        shopify.toast.show(response?.message, { duration: 2000, isError: true });
      }
    }
    catch (error) {
      console.error("Error saving email template", error);
    }
    finally {
      setSaveLoading(false);
    }
  }

  const GetEmailAppearanceAPI = async () => {
    setGetLoading(true);
    try {
      const response = await fetchData('/get-email-temp-settings', new FormData());
      if (response?.status === true) {
        const settings = response?.data[0]?.email_template_settings;
        setEmailSettings(settings);
        console.log('response?.data?.email_template_settings', settings);
      } else {
        shopify.toast.show(response?.message, { duration: 2000, isError: true });
      }
    } catch (error) {
      console.error('Error getting email appearance:', error);
    }
    finally {
      setGetLoading(false);
    }
  }

  useEffect(() => {
    GetEmailAppearanceAPI();
  }, []);

  return (
    <>
      {getLoading ? (
        <SkeletonPage
          primaryAction={{ content: <SkeletonDisplayText size="small" /> }}
        >
          <SkeletonBodyText lines={10} />
        </SkeletonPage>
      ) : (
        <Page
          title={EmailData?.name}
          subtitle={EmailData?.decription}
          backAction={{ content: 'Back', onAction: () => { localStorage.removeItem('editTemplateData'); navigate('/emails') } }}
          primaryAction={<Button variant="primary" loading={saveLoading} onClick={() => { saveEmailTemplateAPI() }}>Save</Button>}
          secondaryActions={
            <Button
              variant="secondary"
              // onClick={handleSendTestEmail}
              onClick={() => setTestMailModalOpen(true)}
              loading={loading}
            >
              Send test email
            </Button>
          }
        >

          <Grid columns={{ xs: 6, sm: 6, md: 6, lg: 12, xl: 12 }}>
            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 2, lg: 4, xl: 4 }}>
              <BlockStack gap={400}>
                <Card>
                  <BlockStack gap={200}>
                    {EmailData?.id !== 'otp_page' && (
                      <>
                        <Text variant="headingMd">Status</Text>
                        <Box style={{ display: 'flex', flexDirection: 'column' }}>
                          <RadioButton
                            label="Enabled"
                            id="enabled"
                            name="accounts"
                            checked={status == true}
                            onChange={() => setStatus(true)}
                          />
                          <RadioButton
                            label="Disabled"
                            checked={status == false}
                            id="disabled"
                            name="accounts"
                            onChange={() => setStatus(false)}
                          />
                        </Box>
                      </>
                    )}

                    <TextField
                      label="Subject"
                      value={emailSubject}
                      onChange={(value) => { setEmailSubject(value); clearError('subject'); }}
                      autoComplete="off"
                      error={errors.subject ? true : false}
                    />

                    <Box style={{ marginTop: '15px' }}>
                      <Divider />
                    </Box>

                    <BlockStack gap={400}>
                      <Text as="h2" variant="headingMd">Content</Text>

                      <BlockStack gap={300}>
                        <TextField
                          label="Heading"
                          value={emailHeading}
                          onChange={(value) => { setEmailHeading(value); clearError('heading'); }}
                          autoComplete="off"
                          error={errors.heading ? true : false}
                        />
                        <TextField
                          label="Content"
                          multiline={3}
                          value={emailContent}
                          onChange={(value) => { setEmailContent(value); clearError('content'); }}
                          autoComplete="off"
                          error={errors.content ? true : false}
                        />

                        {EmailData?.id !== 'otp_page' && (
                          <>
                            <TextField
                              label="Action"
                              value={emailAction}
                              onChange={(value) => { setEmailAction(value); clearError('action'); }}
                              autoComplete="off"
                              error={errors.action ? true : false}
                            />

                            <TextField
                              label="Action URL"
                              helpText='Redirects to your store when left blank'
                              value={emailActionUrl}
                              onChange={(value) => { setEmailActionUrl(value); clearError('actionUrl'); }}
                              autoComplete="off"
                              error={errors.actionUrl}
                            />
                          </>
                        )}
                      </BlockStack>
                    </BlockStack>
                  </BlockStack>

                </Card>

                <Card background="bg-surface-secondary" style={{ marginTop: '15px', backgroundColor: 'red' }}>
                  <BlockStack gap={200}>
                    <Text variant="bodyMd" fontWeight='semibold'>Available template variables</Text>
                    {EmailData?.available_variables?.map((item, index) => (
                      <Box key={index} style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
                        {/* <Box>
                          <Icon source={PinIcon} />
                        </Box> */}
                        <Text tone="subdued" variant="bodyMd">{FormatPlaceholder(item)}</Text>
                      </Box>
                    ))}
                  </BlockStack>
                </Card>

              </BlockStack>
            </Grid.Cell>

            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 8, xl: 8 }}>
              <Card>
                <BlockStack gap={300}>
                  <Text as="h2" variant="headingMd">Preview</Text>
                  <Card>
                    <Text><b>Subject :</b> {emailSubject}</Text>
                  </Card>

                  {/* --- React Preview UI (Visual only) --- */}
                  <Card>
                    <Box style={{ display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: emailSettings?.colors?.Background }}>
                      {/* Image placeholder */}
                      <Box style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: emailSettings?.image?.placement === 'banner' ? '250px' : '120px',
                        minWidth: emailSettings?.image?.placement === 'banner' ? '100%' : '200px',
                        margin: emailSettings?.image?.placement === 'banner' ? '0 auto' : '20px auto',
                        backgroundColor: emailSettings?.image?.image_url ? 'transparent' : darkenColor(emailSettings?.colors?.Background, 0.35) || '#f0f0f0',
                        padding: '10px'
                      }}>
                        {emailSettings?.image?.image_url && (
                          <img
                            src={emailSettings?.image?.image_url}
                            alt={emailSettings?.image?.image_name}
                            style={{
                              maxWidth: emailSettings?.image?.placement === 'banner' ? '100%' : '200px',
                              maxHeight: emailSettings?.image?.placement === 'banner' ? '100%' : '100px',
                              width: emailSettings?.image?.placement === 'banner' ? '100%' : 'auto',
                              objectFit: emailSettings?.image?.placement === 'banner' ? 'cover' : 'contain',
                              borderRadius: '4px'
                            }}
                          />
                        )}
                      </Box>

                      <Box style={{ display: 'flex', flexDirection: 'column', gap: '15px', }}>
                        <div style={{ color: emailSettings?.colors?.heading_color }}>
                          <Text alignment='center' variant='headingLg'>{emailHeading}</Text>
                        </div>
                        <div style={{ color: emailSettings?.colors?.text_color }}>
                          <Text alignment='center'>
                            {/* {emailContent.replace('{reward_name}', '10% Off')} */}
                            {emailContent}
                          </Text>
                        </div>
                      </Box>

                      {/* Code Box Preview */}
                      {(EmailData?.id === 'reward_redeemed' || EmailData?.id === 'reward_expiry_warning' || EmailData?.id === 'reward_expiry_last_chance') &&
                        <Box
                          style={{
                            display: 'flex',
                            justifyContent: 'center',
                            padding: '10px',
                            border: `1px dotted ${emailSettings?.colors?.border_color}`,
                            borderRadius: '5px',
                            cursor: 'pointer',
                            width: '60%',
                            margin: '0 auto',
                            color: emailSettings?.colors?.text_color
                          }}>
                          <Text>{'(REWARD CODE)'}</Text>
                        </Box>
                      }

                      {EmailData?.id !== 'otp_page' && (
                        <Box style={{ display: 'flex', justifyContent: 'center', }}>
                          <button
                            style={{
                              backgroundColor: emailSettings?.accent_colors?.Button_background_color,
                              display: 'flex',
                              alignItems: 'center',
                              border: 'none',
                              padding: '10px 20px',
                              borderRadius: '5px',
                              cursor: 'pointer',
                              fontSize: '16px',
                              color: emailSettings?.accent_colors?.Button_text_color
                            }}
                          >
                            {emailAction}
                          </button>
                        </Box>
                      )}

                      <div style={{ borderTop: `1px solid ${emailSettings?.colors?.border_color}`, width: '100%', margin: '16px 0' }} />

                      <Box style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                        <div style={{ color: emailSettings?.accent_colors?.footer_text_color }}>
                          <Text alignment='center' variant='bodyXs' >{emailSettings?.footer?.disclaimer}</Text>
                        </div>
                        {/* <div style={{ color: emailSettings?.accent_colors?.footer_text_color }}>
                          <Text alignment='center' variant='bodyXs' >Don't want to receive these emails anymore? <a href="#" style={{ color: emailSettings?.accent_colors?.link_color }}>Unsubscribe</a></Text>
                        </div> */}
                      </Box>
                    </Box>
                  </Card>
                </BlockStack>
              </Card>
            </Grid.Cell>
          </Grid>
        </Page>
      )}
      <TestMailModal
        open={testMailModalOpen}
        onClose={() => setTestMailModalOpen(false)}
        save={handleSendTestEmail}
        type={EmailData?.id || ''}
      />
    </>
  )
}

// ==========================================
// EMAIL GENERATOR FUNCTION
// ==========================================
const generateEmailHtml = (config, data) => {
  // 1. Destructure Config
  const {
    headingText,
    bodyText,
    buttonText,
    buttonUrl,
    settings,
    templateId
  } = config;

  // Extract Colors and Settings safely with defaults
  const colors = {
    background: settings?.colors?.Background || '#ffffff',
    heading: settings?.colors?.heading_color || '#000000',
    text: settings?.colors?.text_color || '#000000',
    border: settings?.colors?.border_color || '#e1e1e1',
    buttonBg: settings?.accent_colors?.Button_background_color || '#000000',
    buttonText: settings?.accent_colors?.Button_text_color || '#ffffff',
    footerText: settings?.accent_colors?.footer_text_color || '#666666',
    footerLink: settings?.accent_colors?.link_color || '#666666',
  };

  const imageSettings = settings?.image || {};
  const isBanner = imageSettings.placement === 'banner';
  const imageUrl = imageSettings.image_url;

  // 2. Helper to swap variables
  const replaceVariables = (text) => {
    if (!text) return "";
    let newText = text;
    Object.keys(data).forEach(key => {
      const placeholder = `{${key}}`;
      newText = newText.split(placeholder).join(data[key] || "");
    });
    return newText;
  };

  // 3. HTML Construction
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 0; width: 100% !important; font-family: Arial, sans-serif;  }
  </style>
</head>
<body style="margin: 0; padding: 0;">
  
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center" style="padding: 20px;">
        
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; border: 1px solid #e1e1e1; border-radius: 8px; overflow: hidden; background-color: ${colors.background};">
          
            ${imageUrl ? ` 
        <tr>
            <td align="center" style="padding: ${isBanner ? '0' : '20px'}; background-color: ${imageUrl ? 'transparent' : '#f0f0f0'};">
              ${imageUrl ? `
                <img src="${imageUrl}" alt="Email Image" style="
                  display: block;
                  max-width: ${isBanner ? '100%' : '200px'};
                  max-height: ${isBanner ? '100%' : '100px'};
                  width: ${isBanner ? '100%' : 'auto'};
                  object-fit: ${isBanner ? 'cover' : 'contain'};
                  border-radius: 4px;
                " />
              ` : `
                <div style="height: ${isBanner ? '250px' : '100px'}; width: ${isBanner ? '100%' : '200px'}; background-color: #cccccc; display: flex; align-items: center; justify-content: center; color: #666;">
                   No Image
                </div>
              `}
            </td>
          </tr>
          ` : ''}

          <tr>
            <td align="center" style="padding: 30px 20px 10px 20px;">
              <h1 style="margin: 0; font-size: 24px; color: ${colors.heading}; font-family: Arial, sans-serif;">
                ${replaceVariables(headingText)}
              </h1>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 0px 20px 20px 20px;">
              <p style="margin: 0; font-size: 16px; color: ${colors.text}; line-height: 1.5; font-family: Arial, sans-serif;">
                ${replaceVariables(bodyText)}
              </p>
            </td>
          </tr>

          ${(templateId === 'reward_redeemed' || templateId === 'reward_expiry_warning' || templateId === 'reward_expiry_last_chance') && data.reward_code ? `
          <tr>
            <td align="center" style="padding: 10px 20px;">
               <table border="0" cellspacing="0" cellpadding="0" width="60%">
                 <tr>
                   <td align="center" style="border: 1px dotted ${colors.border}; border-radius: 5px; padding: 15px; cursor: pointer;">
                     <span style="font-family: monospace; font-size: 16px; font-weight: bold; color: ${colors.text};">
                        Redeemed Code : ${data.reward_code}
                     </span>
                   </td>
                 </tr>
               </table>
            </td>
          </tr>
          ` : ''}

          ${templateId !== 'otp_page' ? `
          <tr>
            <td align="center" style="padding: 30px 20px;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" bgcolor="${colors.buttonBg}" style="border-radius: 5px; background-color: ${colors.buttonBg};">
                    <a href="${buttonUrl || '#'}" target="_blank" style="font-size: 16px; font-family: Arial, sans-serif; color: ${colors.buttonText}; text-decoration: none; padding: 12px 24px; display: inline-block; font-weight: bold; border-radius: 5px;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <tr>
            <td style="padding: 0 20px;">
              <div style="border-top: 1px solid ${colors.border}; height: 1px; width: 100%;"></div>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 20px;">
              <p style="margin: 0; font-size: 12px; color: ${colors.footerText}; line-height: 1.4; font-family: Arial, sans-serif;">
                This email was sent to ${data.email} because you signed up for ${data.store_name} Rewards.
              </p>
              // <p style="margin: 10px 0 0 0; font-size: 12px; color: ${colors.footerText}; font-family: Arial, sans-serif;">
              //   Don't want to receive these emails anymore? <a href="#" style="color: ${colors.footerLink}; text-decoration: underline;">Unsubscribe</a>
              // </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
    `;
};

export default EmailTemplate;
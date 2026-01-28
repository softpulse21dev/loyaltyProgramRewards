/* eslint-disable no-undef */
import { BlockStack, Box, Button, Card, Divider, Grid, Page, RadioButton, Text, TextField, SkeletonPage, SkeletonDisplayText, SkeletonBodyText, Icon } from '@shopify/polaris';
import { DeleteIcon, PinIcon, UploadIcon } from '@shopify/polaris-icons';
import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import ColorPickerInput from '../../components/ColorPickerInput';
import { darkenColor } from '../../utils';
import { fetchData } from '../../action';

const EmailAppearance = () => {
    const navigate = useNavigate();
    const [emailImage, setEmailImage] = useState(null);
    const [imagePlacement, setImagePlacement] = useState('banner');
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [headingColor, setHeadingColor] = useState('#000000');
    const [textColor, setTextColor] = useState('#000000');
    const [borderColor, setBorderColor] = useState('#000000');
    const [buttonTextColor, setButtonTextColor] = useState('#ffffff');
    const [buttonBackgroundColor, setButtonBackgroundColor] = useState('#000000');
    const [linkColor, setLinkColor] = useState('#000000');
    const [footerTextColor, setFooterTextColor] = useState('#000000');
    const [disclaimer, setDisclaimer] = useState('This email was sent to "Email" because you signed up for "store_name" Rewards.');
    const [unsubscribeText, setUnsubscribeText] = useState(`Don't want to receive these emails anymore?`);
    const [saveLoading, setSaveLoading] = useState(false);
    const [getLoading, setGetLoading] = useState(false);
    const [emailSettings, setEmailSettings] = useState(null);
    const [availableVariables, setAvailableVariables] = useState([]);
    // Memoize object URL to prevent recreation on every render
    const emailImageUrl = useMemo(() => {
        if (!emailImage) return null;

        if (typeof emailImage === 'string') {
            return emailImage; // already a URL from backend
        }

        if (emailImage instanceof File || emailImage instanceof Blob) {
            return URL.createObjectURL(emailImage);
        }

        return null;
    }, [emailImage]);

    // Cleanup object URL when component unmounts or image changes
    useEffect(() => {
        return () => {
            if (emailImageUrl && emailImage instanceof File) {
                URL.revokeObjectURL(emailImageUrl);
            }
        };
    }, [emailImageUrl, emailImage]);

    const SaveEmailAppearanceAPI = async () => {
        setSaveLoading(true);
        try {
            // Construct emailSettings object from current state variables
            const settingsToSave = {
                image: {
                    placement: imagePlacement,
                    // upload_image: emailImageUrl 
                },
                colors: {
                    Background: backgroundColor,
                    text_color: textColor,
                    border_color: borderColor,
                    heading_color: headingColor
                },
                footer: {
                    disclaimer: disclaimer,
                    unsubscribe_text: unsubscribeText
                },
                accent_colors: {
                    link_color: linkColor,
                    Button_text_color: buttonTextColor,
                    footer_text_color: footerTextColor,
                    Button_background_color: buttonBackgroundColor
                }
            };

            const formData = new FormData();
            formData.append("settings_json", JSON.stringify(settingsToSave));

            // If emailImage is a File object, append it to FormData
            if (emailImage instanceof File) {
                formData.append("upload_image", emailImage);
            }

            const response = await fetchData('/add-email-temp-settings', formData);
            if (response?.status === true) {
                shopify.toast.show(response?.message, { duration: 2000 });
                // Update emailSettings state after successful save
                setEmailSettings(settingsToSave);
            } else {
                shopify.toast.show(response?.message, { duration: 2000, isError: true });
            }
        } catch (error) {
            console.error('Error saving email appearance:', error);
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
                setAvailableVariables(response?.data[0]?.available_variables || []);
                // Populate state variables from loaded settings
                if (settings) {
                    if (settings.image) {
                        setImagePlacement(settings.image.placement || 'banner');
                        if (settings.image.image_url) {
                            setEmailImage(settings.image.image_url); // URL string from backend
                        }
                    }
                    if (settings.colors) {
                        setBackgroundColor(settings.colors.Background || '#ffffff');
                        setTextColor(settings.colors.text_color || '#000000');
                        setBorderColor(settings.colors.border_color || '#000000');
                        setHeadingColor(settings.colors.heading_color || '#000000');
                    }
                    if (settings.footer) {
                        setDisclaimer(settings.footer.disclaimer || 'This email was sent to "Email" because you signed up for "store_name" Rewards.');
                        setUnsubscribeText(settings.footer.unsubscribe_text || `Don't want to receive these emails anymore?`);
                    }
                    if (settings.accent_colors) {
                        setLinkColor(settings.accent_colors.link_color || '#000000');
                        setButtonTextColor(settings.accent_colors.Button_text_color || '#ffffff');
                        setFooterTextColor(settings.accent_colors.footer_text_color || '#000000');
                        setButtonBackgroundColor(settings.accent_colors.Button_background_color || '#000000');
                    }
                }
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

    if (getLoading) {
        return (
            <SkeletonPage
                primaryAction={{ content: <SkeletonDisplayText size="small" /> }}
            >
                <SkeletonBodyText lines={10} />
            </SkeletonPage>
        );
    }

    return (
        <Page
            title="Email Template"
            subtitle='Manage and customize your Loyalty program emails'
            backAction={{ content: 'Back', onAction: () => navigate('/emails') }}
            primaryAction={{ content: 'Save', loading: saveLoading, onAction: () => SaveEmailAppearanceAPI() }}
        >

            <Grid columns={{ xs: 6, sm: 6, md: 6, lg: 12, xl: 12 }}>
                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 2, lg: 4, xl: 4 }}>
                    <BlockStack gap={500}>
                        <Card>
                            <BlockStack gap={300}>
                                <Box style={{ gap: '10px', display: 'flex', flexDirection: 'column' }}>
                                    <Text variant="bodyMd">Image</Text>
                                    <Box style={{ display: 'flex', flexDirection: 'column' }}>
                                        {/* Dashed border upload area - shows preview if image uploaded */}
                                        <div
                                            onClick={() => document.getElementById('email-image-input').click()}
                                            style={{
                                                border: '1px dashed #c4cdd5',
                                                borderRadius: '8px',
                                                padding: emailImage ? '8px' : '24px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: '#fafbfb',
                                                minHeight: '120px',
                                                cursor: 'pointer',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            {emailImageUrl ? (
                                                // Show image preview inside the picker
                                                <div style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    width: '100%'
                                                }}>
                                                    <img
                                                        src={emailImageUrl}
                                                        alt={emailImage?.name || 'Email image'}
                                                        style={{
                                                            maxWidth: '100%',
                                                            maxHeight: '100%',
                                                            objectFit: 'contain',
                                                            borderRadius: '4px'
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                // Show Add image button when no image
                                                <Button onClick={(e) => {
                                                    e.stopPropagation();
                                                    document.getElementById('email-image-input').click();
                                                }}>
                                                    Add image
                                                </Button>
                                            )}
                                            <input
                                                type="file"
                                                id="email-image-input"
                                                accept=".jpg,.jpeg,.png,.svg,image/jpeg,image/png,image/svg+xml"
                                                style={{ display: 'none' }}
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
                                                        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.svg'];
                                                        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

                                                        if (allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension)) {
                                                            setEmailImage(file);
                                                        } else {
                                                            alert('Please upload only JPG, JPEG, PNG, or SVG images.');
                                                        }
                                                    }
                                                    // Reset input so same file can be selected again
                                                    e.target.value = '';
                                                }}
                                            />
                                        </div>

                                        {/* Upload image and Delete buttons */}
                                        <Box style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                                            {emailImageUrl && (
                                                <Button tone="critical" icon={DeleteIcon} onClick={() => setEmailImage(null)}>
                                                    Delete
                                                </Button>
                                            )}
                                            <Button icon={UploadIcon} onClick={() => document.getElementById('email-image-input').click()}>
                                                Upload image
                                            </Button>
                                        </Box>

                                    </Box>
                                </Box>

                                {/* Image placement options */}
                                <Box>
                                    <Text variant="bodyMd" style={{ marginBottom: '8px' }}>Image placement</Text>
                                    <Box style={{ display: 'flex', flexDirection: 'column' }}>
                                        <RadioButton
                                            label="Banner"
                                            id="image-placement-banner"
                                            name="imagePlacement"
                                            checked={imagePlacement === 'banner'}
                                            onChange={() => setImagePlacement('banner')}
                                        />
                                        <RadioButton
                                            label="Logo"
                                            id="image-placement-logo"
                                            name="imagePlacement"
                                            checked={imagePlacement === 'logo'}
                                            onChange={() => setImagePlacement('logo')}
                                        />
                                    </Box>
                                </Box>

                                <Divider />

                                <Text variant="bodyMd" fontWeight='semibold' >Colors</Text>

                                <ColorPickerInput
                                    label="Background color"
                                    value={backgroundColor}
                                    onChange={(value) => setBackgroundColor(value)}
                                // onChange={(value) => setWidgetData({ ...widgetData, general: { ...widgetData.general, advanced: { ...widgetData.general.advanced, input: { ...widgetData.general.advanced.input, input_color: value } } } })}
                                // error={getErrorMessage('general.advanced.input.input_color')}
                                // onClearError={() => clearError('general.advanced.input.input_color')}
                                // onFocus={() => setIsEnabled(false)}
                                />

                                <ColorPickerInput
                                    label="Heading color"
                                    value={headingColor}
                                    onChange={(value) => setHeadingColor(value)}
                                // onChange={(value) => setWidgetData({ ...widgetData, general: { ...widgetData.general, advanced: { ...widgetData.general.advanced, input: { ...widgetData.general.advanced.input, input_color: value } } } })}
                                // error={getErrorMessage('general.advanced.input.input_color')}
                                // onClearError={() => clearError('general.advanced.input.input_color')}
                                // onFocus={() => setIsEnabled(false)}
                                />

                                <ColorPickerInput
                                    label="Text color"
                                    value={textColor}
                                    onChange={(value) => setTextColor(value)}
                                // onChange={(value) => setWidgetData({ ...widgetData, general: { ...widgetData.general, advanced: { ...widgetData.general.advanced, input: { ...widgetData.general.advanced.input, input_color: value } } } })}
                                // error={getErrorMessage('general.advanced.input.input_color')}
                                // onClearError={() => clearError('general.advanced.input.input_color')}
                                // onFocus={() => setIsEnabled(false)}
                                />

                                <ColorPickerInput
                                    label="Border color"
                                    value={borderColor}
                                    onChange={(value) => setBorderColor(value)}
                                // onChange={(value) => setWidgetData({ ...widgetData, general: { ...widgetData.general, advanced: { ...widgetData.general.advanced, input: { ...widgetData.general.advanced.input, input_color: value } } } })}
                                // error={getErrorMessage('general.advanced.input.input_color')}
                                // onClearError={() => clearError('general.advanced.input.input_color')}
                                // onFocus={() => setIsEnabled(false)}
                                />

                                <Divider />

                                {/* accent colors */}
                                <Text variant="bodyMd" fontWeight='semibold' >Accent colors</Text>
                                <ColorPickerInput
                                    label="Button text color"
                                    value={buttonTextColor}
                                    onChange={(value) => setButtonTextColor(value)}
                                />
                                <ColorPickerInput
                                    label="Button background color"
                                    value={buttonBackgroundColor}
                                    onChange={(value) => setButtonBackgroundColor(value)}
                                />
                                <ColorPickerInput
                                    label="Link color"
                                    value={linkColor}
                                    onChange={(value) => setLinkColor(value)}
                                />
                                <ColorPickerInput
                                    label="Footer text color"
                                    value={footerTextColor}
                                    onChange={(value) => setFooterTextColor(value)}
                                />

                                <Divider />
                                {/* footer  */}
                                <Text variant="bodyMd" fontWeight='semibold' >Footer</Text>
                                <TextField
                                    label="Disclaimer"
                                    value={disclaimer}
                                    onChange={(value) => setDisclaimer(value)}
                                    multiline={3}
                                />
                                {/* <TextField
                                label="Unsubscribe text"
                                value={unsubscribeText}
                                onChange={(value) => setUnsubscribeText(value)}
                                multiline={3}
                            /> */}
                            </BlockStack>
                        </Card>


                        <Card background="bg-surface-secondary" style={{ marginTop: '15px', backgroundColor: 'red' }}>
                            <BlockStack gap={200}>
                                <Text variant="bodyMd" fontWeight='semibold'>Available template variables</Text>
                                {availableVariables?.map((item, index) => (
                                    <Box key={index} style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
                                        <Box>
                                            <Icon source={PinIcon} />
                                        </Box>
                                        <Text tone="subdued" variant="bodyMd">{item}</Text>
                                    </Box>
                                ))}
                            </BlockStack>
                        </Card>
                    </BlockStack>
                </Grid.Cell>

                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 8, xl: 8 }}>
                    <div style={{ position: 'sticky', top: '20px' }}>
                        <Card>
                            <BlockStack gap={300}>
                                <Text as="h2" variant="headingMd">Preview</Text>

                                <Card>
                                    <Box style={{ display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: backgroundColor }}>
                                        {/* image or logo box */}
                                        <Box style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            height: imagePlacement === 'banner' ? '250px' : '120px',
                                            minWidth: imagePlacement === 'banner' ? '100%' : '200px',
                                            margin: imagePlacement === 'banner' ? '0 auto' : '20px auto',
                                            backgroundColor: emailImageUrl ? 'transparent' : darkenColor(backgroundColor, 0.35) || '#f0f0f0',
                                            padding: '10px'
                                        }}>
                                            {emailImageUrl && (
                                                <img
                                                    src={emailImageUrl}
                                                    alt={emailImage?.name || 'Email image'}
                                                    style={{
                                                        maxWidth: imagePlacement === 'banner' ? '100%' : '200px',
                                                        maxHeight: imagePlacement === 'banner' ? '100%' : '100px',
                                                        width: imagePlacement === 'banner' ? '100%' : 'auto',
                                                        objectFit: imagePlacement === 'banner' ? 'cover' : 'contain',
                                                        borderRadius: '4px'
                                                    }}
                                                />
                                            )}
                                        </Box>

                                        <Box style={{ display: 'flex', flexDirection: 'column', gap: '15px', }}>
                                            <div style={{ color: headingColor, }}>
                                                <Text alignment='center' variant='headingLg'>Reward redeemed</Text>
                                            </div>
                                            <div style={{ color: textColor, }}>
                                                <Text alignment='center'>You redeemed 10% Off. Enjoy!</Text>
                                            </div>
                                        </Box>

                                        <Box
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                padding: '10px',
                                                border: `1px dotted ${borderColor}`,
                                                borderRadius: '5px',
                                                cursor: 'pointer',
                                                width: '60%',
                                                margin: '0 auto',
                                                color: textColor
                                            }}>
                                            <Text>redeemed Code : 123456</Text>
                                        </Box>

                                        <Box style={{ display: 'flex', justifyContent: 'center', }}>
                                            <button
                                                style={{
                                                    backgroundColor: buttonBackgroundColor,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    border: 'none',
                                                    padding: '10px',
                                                    borderRadius: '5px',
                                                    cursor: 'pointer',
                                                    color: buttonTextColor
                                                }}
                                            >
                                                ags
                                            </button>
                                        </Box>

                                        <div style={{ borderTop: `1px solid ${borderColor}`, width: '100%', margin: '16px 0' }} />

                                        <Box style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                                            <div style={{ color: footerTextColor }}>
                                                <Text alignment='center' variant='bodyXs' >This email was sent to  "Email" because you signed up for "store_name" Rewards.</Text>
                                            </div>
                                            {/* <div style={{ color: footerTextColor }}>
                                                <Text alignment='center' variant='bodyXs'>Don't want to receive these emails anymore? <a style={{ color: linkColor }} href="#">Unsubscribe</a></Text>
                                            </div> */}
                                        </Box>
                                    </Box>


                                </Card>
                            </BlockStack>
                        </Card>
                    </div>
                </Grid.Cell>
            </Grid>

        </Page>
    )
}

export default EmailAppearance

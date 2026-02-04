import { BlockStack, Box, Button, ButtonGroup, Card, Collapsible, Divider, Grid, ProgressBar, RadioButton, RangeSlider, SkeletonBodyText, Text } from '@shopify/polaris';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import '../../../widget.css';
import { UploadIcon, DeleteIcon } from '@shopify/polaris-icons';
import ColorPickerInput from '../../../components/ColorPickerInput';
import { BoldArrowRightIcon, BoldCopyIcon, BoldCrownIcon, BoldDiscountIcon, BoldFillStarIcon, BoldGiftIcon, BoldRewardsIcon, BoldStarIcon, BoldTrophyIcon, BoldTruckIcon, StarIcon } from '../../../assets/svg/svg';
import { useSelector } from 'react-redux';

const General = ({ widgetData, setWidgetData, errors = {}, clearError, openCollapsible, setOpenCollapsible, loading }) => {

    const defaultData = useSelector((state) => state.defaultData);
    const referlinkData = JSON.parse(defaultData);

    useEffect(() => {
        console.log('widgetData', widgetData)
    }, [widgetData])

    // Handler to toggle collapsibles - only one can be open at a time
    const handleToggle = useCallback((section) => {
        setOpenCollapsible((prev) => (prev === section ? null : section));
    }, [setOpenCollapsible]);

    // Helper function to get error message
    const getErrorMessage = useCallback((fieldPath) => {
        return errors[fieldPath] || '';
    }, [errors]);

    // --- NEW: State for the Segmented Button (Enable/Disable) ---
    const [isEnabled, setIsEnabled] = useState(true); // Default to 'Enable'

    // Handler to switch between Enable and Disable
    const handleStatusChange = useCallback((status) => {
        if (status === 'enable') {
            setIsEnabled(true);
        } else {
            setIsEnabled(false);
        }
    }, []);

    // Helper variables for widget styles to avoid repetitive optional chaining
    const stylesData = widgetData?.general?.styles || {};
    const advancedData = widgetData?.general?.advanced || {};
    const storefrontData = widgetData?.storefront_app || {};

    const presentation = stylesData.presentation;
    const widgetPosition = stylesData.position; // Renamed to avoid conflict with local 'position' state if any (though none seen in General.jsx)
    const headerType = stylesData.header?.header_type;
    const headerColor = stylesData.header?.solid;
    const headerGradientColor1 = stylesData.header?.gradient?.color1;
    const headerGradientColor2 = stylesData.header?.gradient?.color2;
    const headerImage = stylesData.header?.header_image;
    const headerBarColor = stylesData.header?.header_bar_color;
    const headerBarTextColor = stylesData.header?.header_bar_text_color;
    const headerTextColor = stylesData.header?.text_color;
    const contentBackgroundColorType = stylesData.content?.background_type;
    const backgroundColor = stylesData.content?.solid;
    const backgroundImage = stylesData.content?.content_image;
    const headingColor = stylesData.content?.heading_color;
    const textColor = stylesData.content?.text_color;
    const buttonTextColor = stylesData.accent?.button_text_color;
    const buttonColor = stylesData.accent?.button_color;
    const buttonRadius = stylesData.accent?.button_radius;
    const linkColor = stylesData.accent?.link_color;
    const iconColor = stylesData.accent?.icons_color;
    const progressBarFill = advancedData.section?.progress_bar_fill;
    const progressBarBackground = advancedData.section?.progress_bar_background;
    const sectionBackgroundColor = advancedData.section?.background_color;
    const sectionBorderColor = advancedData.section?.card_border_color;
    const sectionBorderWidth = advancedData.section?.card_border_width;
    const sectionBorderRadius = advancedData.section?.border_radius;
    const inputFieldColor = advancedData.input?.input_color;
    const inputFieldBorderColor = advancedData.input?.input_border_color;
    const inputBorderRadius = advancedData.input?.input_border_radius;
    const boxBackgroundColor = advancedData.box?.background_color;
    const boxBorderColor = advancedData.box?.border_color;
    const cardBackgroundColor = advancedData.card?.background_color;
    const cardBorderColor = advancedData.card?.border_color;
    const cardBorderWidth = advancedData.card?.border_width;
    const cardBorderRadius = advancedData.card?.border_radius;

    const headerBarText = storefrontData?.header?.header_bar_text;
    const headerText = storefrontData?.header?.header_text;
    const headerContent = storefrontData?.header?.header_content;
    const imagePosition = storefrontData?.new_member_card?.image_position;
    const newMemberCardImage = storefrontData?.new_member_card?.new_member_image;
    const newMemberCardTitle = storefrontData?.new_member_card?.translations?.title;
    const newMemberCardButtonText = storefrontData?.new_member_card?.translations?.button_text;
    const newMemberCardSignInMessage = storefrontData?.new_member_card?.translations?.signin_msg;
    const newMemberCardSignInLinkText = storefrontData?.new_member_card?.translations?.signin_text;
    const pointsCardTitle = storefrontData?.points_card?.title;
    const pointsCardMessage = storefrontData?.points_card?.message;
    const pointsCardWaysToEarnText = storefrontData?.points_card?.ways_to_earn_text;
    const pointsCardWaysToRedeemText = storefrontData?.points_card?.ways_to_redeem_text;
    const pointsCardMyRewardsText = storefrontData?.points_card?.my_rewards;
    const referralCardTitle = storefrontData?.referrals_card?.title;
    const referralCardMessage = storefrontData?.referrals_card?.message;
    const referrerTitle = storefrontData?.referrals_card?.referrer_title;
    const refereeTitle = storefrontData?.referrals_card?.referee_title;
    const referralCardLinkTitle = storefrontData?.referrals_card?.link_title;
    const referralCardMyDiscountText = storefrontData?.referrals_card?.my_discount_text;
    const vipTierCardTitle = storefrontData?.vip_tiers_card?.title;
    const vipTierCardMessage = storefrontData?.vip_tiers_card?.message;
    const vipTierCardCurrentTier = storefrontData?.vip_tiers_card?.customer_tier?.current_tier;
    const vipTierCardNextTier = storefrontData?.vip_tiers_card?.customer_tier?.next_tier;
    const vipTierCardMaxTierReached = storefrontData?.vip_tiers_card?.customer_tier?.max_tier;
    const vipTierCardAllTier = storefrontData?.vip_tiers_card?.all_tiers?.title;

    // Memoize object URLs to prevent recreation on every render
    const headerImageUrl = useMemo(() => {
        if (!headerImage) return null;

        if (typeof headerImage === 'string') {
            return headerImage; // already a URL from backend
        }

        if (headerImage instanceof File || headerImage instanceof Blob) {
            return URL.createObjectURL(headerImage);
        }

        return null;
    }, [headerImage]);

    const backgroundImageUrl = useMemo(() => {
        if (!backgroundImage) return null;

        if (typeof backgroundImage === 'string') {
            return backgroundImage; // already a URL from backend
        }

        if (backgroundImage instanceof File || backgroundImage instanceof Blob) {
            return URL.createObjectURL(backgroundImage);
        }
        return null;
    }, [backgroundImage]);

    const newMemberCardImageUrl = useMemo(() => {
        if (!newMemberCardImage) return null;

        if (typeof newMemberCardImage === 'string') {
            return newMemberCardImage; // already a URL from backend
        }

        if (newMemberCardImage instanceof File || newMemberCardImage instanceof Blob) {
            return URL.createObjectURL(newMemberCardImage);
        }
        return null;
    }, [newMemberCardImage]);

    // Cleanup object URLs when component unmounts or images change
    useEffect(() => {
        return () => {
            if (headerImageUrl) URL.revokeObjectURL(headerImageUrl);
        };
    }, [headerImageUrl]);

    useEffect(() => {
        return () => {
            if (backgroundImageUrl) URL.revokeObjectURL(backgroundImageUrl);
        };
    }, [backgroundImageUrl]);

    useEffect(() => {
        return () => {
            if (newMemberCardImageUrl) URL.revokeObjectURL(newMemberCardImageUrl);
        };
    }, [newMemberCardImageUrl]);

    // Compute header background based on selected type
    const headerBackgroundStyle = useMemo(() => {
        switch (headerType) {
            case 'solid':
                return { background: headerColor };
            case 'gradient':
                return { background: `linear-gradient(135deg, ${headerGradientColor1} 0%, ${headerGradientColor2} 100%)` };
            case 'image':
                return headerImageUrl
                    ? { backgroundImage: `url(${headerImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                    : { background: headerColor };
            default:
                return { background: headerColor };
        }
    }, [headerType, headerColor, headerGradientColor1, headerGradientColor2, headerImageUrl]);

    // Compute content/body background based on selected type
    const contentBackgroundStyle = useMemo(() => {
        switch (contentBackgroundColorType) {
            case 'solid':
                return { background: backgroundColor };
            case 'gradient':
                return { background: `linear-gradient(180deg, ${backgroundColor} 0%, #ffffff 100%)` };
            case 'image':
                return backgroundImageUrl
                    ? { backgroundImage: `url(${backgroundImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                    : { background: backgroundColor };
            default:
                return { background: backgroundColor };
        }
    }, [contentBackgroundColorType, backgroundColor, backgroundImageUrl]);

    return (
        <Card>
            {loading ? (<SkeletonBodyText lines={1} />) : (
                <>
                    <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text as="h1" variant='headingMd'>Preview</Text>

                        {/* --- SEGMENTED BUTTON GROUP --- */}
                        <ButtonGroup variant="segmented">
                            <Button
                                pressed={isEnabled}
                                onClick={() => handleStatusChange('enable')}
                            >
                                Anonymous
                            </Button>
                            <Button
                                pressed={!isEnabled}
                                onClick={() => handleStatusChange('disable')}
                            >
                                With Account
                            </Button>
                        </ButtonGroup>
                    </Box>

                    <Box style={{ marginTop: '1rem' }}>
                        <Grid columns={{ xs: 6, sm: 6, md: 7, lg: 12, xl: 12 }}>
                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 5, xl: 5 }}>


                                <div className="accordian-title" style={{ backgroundColor: '#f0f0f0', padding: '5px 10px', borderRadius: '5px', marginBottom: '5px' }}>
                                    <Button
                                        variant="monochromePlain"
                                        disclosure={openCollapsible === 'styles' ? 'up' : 'down'}
                                        onClick={() => handleToggle('styles')}
                                        aria-expanded={openCollapsible === 'styles'}
                                        aria-controls="styles-collapsible"
                                        fullWidth
                                        textAlign="left"
                                    >
                                        <Text as="h1" variant="headingMd">Styles</Text>
                                    </Button>
                                </div>
                                <Collapsible
                                    open={openCollapsible === 'styles'}
                                    id="styles-collapsible"
                                    transition={{ duration: '500ms', timingFunction: 'ease-in-out' }}
                                    expandOnPrint
                                >
                                    <BlockStack gap="300" style={{ display: 'flex', flexDirection: 'column', padding: '10px', gap: '10px' }}>

                                        {/* presentation options */}

                                        {/* <BlockStack gap="200">
                                            <Text variant="bodyLg" fontWeight='semibold'>Presentation</Text>
                                            <Box style={{ display: 'flex', flexDirection: 'column', }}>
                                                <RadioButton
                                                    label="Popup"
                                                    checked={widgetData?.general?.styles?.presentation === 'popup'}
                                                    onChange={() => setWidgetData({ ...widgetData, general: { ...widgetData.general, styles: { ...widgetData.general.styles, presentation: 'popup' } } })}
                                                />
                                                <RadioButton
                                                    label="Sidebar"
                                                    checked={widgetData?.general?.styles?.presentation === 'sidebar'}
                                                    onChange={() => setWidgetData({ ...widgetData, general: { ...widgetData.general, styles: { ...widgetData.general.styles, presentation: 'sidebar' } } })}
                                                />
                                            </Box>
                                        </BlockStack>

                                        <BlockStack gap="200">
                                            <Text variant="bodyLg" fontWeight='semibold'>Position</Text>
                                            <Box style={{ display: 'flex', flexDirection: 'column', }}>
                                                <RadioButton
                                                    label="Left"
                                                    checked={widgetData?.general?.styles?.position === 'left'}
                                                    onChange={() => setWidgetData({ ...widgetData, general: { ...widgetData.general, styles: { ...widgetData.general.styles, position: 'left' } } })}
                                                />
                                                <RadioButton label="Right"
                                                    checked={widgetData?.general?.styles?.position === 'right'}
                                                    onChange={() => setWidgetData({ ...widgetData, general: { ...widgetData.general, styles: { ...widgetData.general.styles, position: 'right' } } })}
                                                />
                                            </Box>
                                        </BlockStack>

                                        <Divider /> */}

                                        <Text variant="bodyLg" fontWeight='semibold'>Header</Text>
                                        <BlockStack gap="300">
                                            <Text variant="bodyMd">Header color</Text>
                                            <Box style={{ display: 'flex', flexDirection: 'column' }}>
                                                <RadioButton
                                                    label="Solid"
                                                    id="solid"
                                                    name="headerColorType"
                                                    checked={headerType === 'solid'}
                                                    onChange={() => setWidgetData({ ...widgetData, general: { ...widgetData.general, styles: { ...widgetData.general.styles, header: { ...widgetData.general.styles.header, header_type: 'solid' } } } })}
                                                />
                                                {headerType === 'solid' && (
                                                    <div style={{ marginLeft: '25px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                        <ColorPickerInput
                                                            // label="Header color"
                                                            value={headerColor}
                                                            onChange={(value) => setWidgetData({ ...widgetData, general: { ...widgetData.general, styles: { ...widgetData.general.styles, header: { ...widgetData.general.styles.header, solid: value } } } })}
                                                            error={getErrorMessage('general.styles.header.solid')}
                                                            onClearError={() => clearError('general.styles.header.solid')}
                                                        />
                                                    </div>
                                                )}
                                                <RadioButton
                                                    label="Gradient"
                                                    id="gradient"
                                                    name="headerColorType"
                                                    checked={headerType === 'gradient'}
                                                    onChange={() => setWidgetData({ ...widgetData, general: { ...widgetData.general, styles: { ...widgetData.general.styles, header: { ...widgetData.general.styles.header, header_type: 'gradient' } } } })}
                                                />
                                                {headerType === 'gradient' && (
                                                    <div style={{ marginLeft: '25px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                        <ColorPickerInput
                                                            // label="Header color"
                                                            value={headerGradientColor1}
                                                            onChange={(value) => setWidgetData({ ...widgetData, general: { ...widgetData.general, styles: { ...widgetData.general.styles, header: { ...widgetData.general.styles.header, gradient: { ...widgetData.general.styles.header.gradient, color1: value } } } } })}
                                                            error={getErrorMessage('general.styles.header.gradient.color1')}
                                                            onClearError={() => clearError('general.styles.header.gradient.color1')}
                                                        />
                                                        <ColorPickerInput
                                                            // label="Header color"
                                                            value={headerGradientColor2}
                                                            onChange={(value) => setWidgetData({ ...widgetData, general: { ...widgetData.general, styles: { ...widgetData.general.styles, header: { ...widgetData.general.styles.header, gradient: { ...widgetData.general.styles.header.gradient, color2: value } } } } })}
                                                            error={getErrorMessage('general.styles.header.gradient.color2')}
                                                            onClearError={() => clearError('general.styles.header.gradient.color2')}
                                                        />
                                                    </div>
                                                )}
                                                <RadioButton
                                                    label="Image"
                                                    id="image"
                                                    name="headerColorType"
                                                    checked={headerType === 'image'}
                                                    onChange={() => setWidgetData({ ...widgetData, general: { ...widgetData.general, styles: { ...widgetData.general.styles, header: { ...widgetData.general.styles.header, header_type: 'image' } } } })}
                                                />
                                            </Box>

                                            {/* Image Upload - Only show when Image is selected */}
                                            {headerType === 'image' && (
                                                <div style={{ marginLeft: '25px' }}>
                                                    {/* Dashed border upload area - shows preview if image uploaded */}
                                                    <div
                                                        onClick={() => document.getElementById('header-image-input').click()}
                                                        style={{
                                                            border: '1px dashed #c4cdd5',
                                                            borderRadius: '8px',
                                                            padding: headerImage ? '8px' : '24px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            backgroundColor: '#fafbfb',
                                                            minHeight: '80px',
                                                            cursor: 'pointer',
                                                            position: 'relative',
                                                            overflow: 'hidden'
                                                        }}
                                                    >
                                                        {headerImageUrl ? (
                                                            // Show image preview inside the picker
                                                            <div style={{
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                alignItems: 'center',
                                                                gap: '8px',
                                                                width: '100%'
                                                            }}>
                                                                <img
                                                                    src={headerImageUrl}
                                                                    alt={headerImage}
                                                                    style={{
                                                                        maxWidth: '100%',
                                                                        maxHeight: '100%',
                                                                        objectFit: 'contain',
                                                                        borderRadius: '4px'
                                                                    }}
                                                                />
                                                            </div>
                                                        ) : (
                                                            // Show Add file button when no image
                                                            <Button onClick={(e) => {
                                                                e.stopPropagation();
                                                                document.getElementById('header-image-input').click();
                                                            }}>
                                                                Add file
                                                            </Button>
                                                        )}
                                                        <input
                                                            type="file"
                                                            id="header-image-input"
                                                            accept=".jpg,.jpeg,.png,.svg,image/jpeg,image/png,image/svg+xml"
                                                            style={{ display: 'none' }}
                                                            onChange={(e) => {
                                                                const file = e.target.files[0];
                                                                if (file) {
                                                                    const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
                                                                    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.svg'];
                                                                    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

                                                                    if (allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension)) {
                                                                        setWidgetData(prev => {
                                                                            // make sure we don't spread null/undefined
                                                                            const safePrev = prev || {};
                                                                            const prevGeneral = safePrev.general || {};
                                                                            const prevStyles = prevGeneral.styles || {};
                                                                            const prevHeader = prevStyles.header || {};

                                                                            return {
                                                                                ...safePrev,
                                                                                general: {
                                                                                    ...prevGeneral,
                                                                                    styles: {
                                                                                        ...prevStyles,
                                                                                        header: {
                                                                                            ...prevHeader,
                                                                                            header_image: file,
                                                                                        },
                                                                                    },
                                                                                },
                                                                            };
                                                                        });
                                                                        clearError('general.styles.header.header_image');
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
                                                        {headerImageUrl && (
                                                            <Button tone="critical" icon={DeleteIcon} onClick={() => {
                                                                setWidgetData({ ...widgetData, general: { ...widgetData.general, styles: { ...widgetData.general.styles, header: { ...widgetData.general.styles.header, header_image: null } } } });
                                                                clearError('general.styles.header.header_image');
                                                            }}>
                                                                Delete
                                                            </Button>
                                                        )}
                                                        <Button icon={UploadIcon} onClick={() => document.getElementById('header-image-input').click()}>
                                                            Upload image
                                                        </Button>
                                                    </Box>
                                                    {/* Error message for header image */}
                                                    {getErrorMessage('general.styles.header.header_image') && (
                                                        <div style={{ marginTop: '8px', color: '#d72c0d', fontSize: '13px' }}>
                                                            {getErrorMessage('general.styles.header.header_image')}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </BlockStack>

                                        <Box style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
                                            <ColorPickerInput
                                                label="Header bar"
                                                value={headerBarColor}
                                                onChange={(value) => setWidgetData({ ...widgetData, general: { ...widgetData.general, styles: { ...widgetData.general.styles, header: { ...widgetData.general.styles.header, header_bar_color: value } } } })}
                                                error={getErrorMessage('general.styles.header.header_bar_color')}
                                                onClearError={() => clearError('general.styles.header.header_bar_color')}
                                            />
                                            <ColorPickerInput
                                                label="Header bar text"
                                                value={headerBarTextColor}
                                                onChange={(value) => setWidgetData({ ...widgetData, general: { ...widgetData.general, styles: { ...widgetData.general.styles, header: { ...widgetData.general.styles.header, header_bar_text_color: value } } } })}
                                                error={getErrorMessage('general.styles.header.header_bar_text_color')}
                                                onClearError={() => clearError('general.styles.header.header_bar_text_color')}
                                            />
                                            <ColorPickerInput
                                                label="Header text color"
                                                value={headerTextColor}
                                                onChange={(value) => setWidgetData({ ...widgetData, general: { ...widgetData.general, styles: { ...widgetData.general.styles, header: { ...widgetData.general.styles.header, text_color: value } } } })}
                                                error={getErrorMessage('general.styles.header.text_color')}
                                                onClearError={() => clearError('general.styles.header.text_color')}
                                            />
                                        </Box>

                                        <Divider />

                                        {/* Content section */}

                                        <Text variant="bodyLg" fontWeight='semibold'>Content</Text>
                                        <BlockStack gap="200">
                                            <Text variant="bodyMd">Background color</Text>
                                            <Box style={{ display: 'flex', flexDirection: 'column' }}>
                                                <RadioButton
                                                    label="Solid"
                                                    id="bg_solid"
                                                    name="contentBackgroundColorType"
                                                    checked={contentBackgroundColorType === 'solid'}
                                                    onChange={() => setWidgetData({ ...widgetData, general: { ...widgetData.general, styles: { ...widgetData.general.styles, content: { ...widgetData.general.styles.content, background_type: 'solid' } } } })}
                                                />
                                                {contentBackgroundColorType === 'solid' && (
                                                    <div style={{ marginLeft: '25px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                        <ColorPickerInput
                                                            // label="Header color"
                                                            value={backgroundColor}
                                                            onChange={(value) => setWidgetData({ ...widgetData, general: { ...widgetData.general, styles: { ...widgetData.general.styles, content: { ...widgetData.general.styles.content, solid: value } } } })}
                                                            error={getErrorMessage('general.styles.content.solid')}
                                                            onClearError={() => clearError('general.styles.content.solid')}
                                                        />
                                                    </div>
                                                )}
                                                {/* <RadioButton
                                            label="Gradient"
                                            id="bg_gradient"
                                            name="backgroundColorType"
                                            checked={backgroundColorType === 'gradient'}
                                            onChange={() => setBackgroundColorType('gradient')}
                                        /> */}
                                                <RadioButton
                                                    label="Image"
                                                    id="bg_image"
                                                    name="contentBackgroundColorType"
                                                    checked={contentBackgroundColorType === 'image'}
                                                    onChange={() => setWidgetData({ ...widgetData, general: { ...widgetData.general, styles: { ...widgetData.general.styles, content: { ...widgetData.general.styles.content, background_type: 'image' } } } })}
                                                />

                                                {contentBackgroundColorType === 'image' && (
                                                    <div style={{ marginLeft: '25px' }}>
                                                        {/* Dashed border upload area - shows preview if image uploaded */}
                                                        <div
                                                            onClick={() => document.getElementById('background-image-input').click()}
                                                            style={{
                                                                border: '1px dashed #c4cdd5',
                                                                borderRadius: '8px',
                                                                padding: backgroundImage ? '8px' : '24px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                backgroundColor: '#fafbfb',
                                                                minHeight: '80px',
                                                                cursor: 'pointer',
                                                                position: 'relative',
                                                                overflow: 'hidden'
                                                            }}
                                                        >
                                                            {backgroundImageUrl ? (
                                                                // Show image preview inside the picker
                                                                <div style={{
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: 'center',
                                                                    gap: '8px',
                                                                    width: '100%'
                                                                }}>
                                                                    <img
                                                                        src={backgroundImageUrl}
                                                                        alt={backgroundImage}
                                                                        style={{
                                                                            maxWidth: '100%',
                                                                            maxHeight: '100%',
                                                                            objectFit: 'contain',
                                                                            borderRadius: '4px'
                                                                        }}
                                                                    />
                                                                </div>
                                                            ) : (
                                                                // Show Add file button when no image
                                                                <Button onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    document.getElementById('background-image-input').click();
                                                                }}>
                                                                    Add file
                                                                </Button>
                                                            )}
                                                            <input
                                                                type="file"
                                                                id="background-image-input"
                                                                accept=".jpg,.jpeg,.png,.svg,image/jpeg,image/png,image/svg+xml"
                                                                style={{ display: 'none' }}
                                                                onChange={(e) => {
                                                                    const file = e.target.files[0];
                                                                    if (file) {
                                                                        const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
                                                                        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.svg'];
                                                                        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

                                                                        if (allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension)) {
                                                                            setWidgetData({ ...widgetData, general: { ...widgetData.general, styles: { ...widgetData.general.styles, content: { ...widgetData.general.styles.content, content_image: file } } } });
                                                                            clearError('general.styles.content.content_image');
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
                                                            {backgroundImageUrl && (
                                                                <Button tone="critical" icon={DeleteIcon} onClick={() => {
                                                                    setWidgetData({ ...widgetData, general: { ...widgetData.general, styles: { ...widgetData.general.styles, content: { ...widgetData.general.styles.content, content_image: null } } } });
                                                                    clearError('general.styles.content.content_image');
                                                                }}>
                                                                    Delete
                                                                </Button>
                                                            )}
                                                            <Button icon={UploadIcon} onClick={() => document.getElementById('background-image-input').click()}>
                                                                Upload image
                                                            </Button>
                                                        </Box>
                                                        {/* Error message for content/background image */}
                                                        {getErrorMessage('general.styles.content.content_image') && (
                                                            <div style={{ marginTop: '8px', color: '#d72c0d', fontSize: '13px' }}>
                                                                {getErrorMessage('general.styles.content.content_image')}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </Box>
                                        </BlockStack>

                                        <Box style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
                                            {/* Heading Color */}
                                            <ColorPickerInput
                                                label="Heading color"
                                                value={headingColor}
                                                onChange={(value) => setWidgetData({ ...widgetData, general: { ...widgetData.general, styles: { ...widgetData.general.styles, content: { ...widgetData.general.styles.content, heading_color: value } } } })}
                                                error={getErrorMessage('general.styles.content.heading_color')}
                                                onClearError={() => clearError('general.styles.content.heading_color')}
                                            />

                                            {/* Text Color */}
                                            <ColorPickerInput
                                                label="Text color"
                                                value={textColor}
                                                onChange={(value) => setWidgetData({ ...widgetData, general: { ...widgetData.general, styles: { ...widgetData.general.styles, content: { ...widgetData.general.styles.content, text_color: value } } } })}
                                                error={getErrorMessage('general.styles.content.text_color')}
                                                onClearError={() => clearError('general.styles.content.text_color')}
                                            />
                                        </Box>

                                        <Box style={{ marginBottom: '7px' }}>
                                            <Divider />
                                        </Box>


                                        <Text variant="bodyLg" fontWeight='semibold'>Accent</Text>
                                        <Box style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
                                            {/* Heading Color */}
                                            <ColorPickerInput
                                                label="Button Text color"
                                                value={buttonTextColor}
                                                onChange={(value) => setWidgetData({ ...widgetData, general: { ...widgetData.general, styles: { ...widgetData.general.styles, accent: { ...widgetData.general.styles.accent, button_text_color: value } } } })}
                                                error={getErrorMessage('general.styles.accent.button_text_color')}
                                                onClearError={() => clearError('general.styles.accent.button_text_color')}
                                            />

                                            {/* Text Color */}
                                            <ColorPickerInput
                                                label="Button color"
                                                value={buttonColor}
                                                onChange={(value) => setWidgetData({ ...widgetData, general: { ...widgetData.general, styles: { ...widgetData.general.styles, accent: { ...widgetData.general.styles.accent, button_color: value } } } })}
                                                error={getErrorMessage('general.styles.accent.button_color')}
                                                onClearError={() => clearError('general.styles.accent.button_color')}
                                            />
                                        </Box>
                                        <RangeSlider
                                            label="Button radius"
                                            max={32}
                                            min={0}
                                            value={buttonRadius}
                                            onChange={(value) => setWidgetData({ ...widgetData, general: { ...widgetData.general, styles: { ...widgetData.general.styles, accent: { ...widgetData.general.styles.accent, button_radius: value } } } })}
                                            suffix={<Box style={{ textAlign: 'right', width: '24px' }}>{buttonRadius}px</Box>}
                                        />
                                        <Box style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
                                            <ColorPickerInput
                                                label="Link color"
                                                value={linkColor}
                                                onChange={(value) => setWidgetData({ ...widgetData, general: { ...widgetData.general, styles: { ...widgetData.general.styles, accent: { ...widgetData.general.styles.accent, link_color: value } } } })}
                                                error={getErrorMessage('general.styles.accent.link_color')}
                                                onClearError={() => clearError('general.styles.accent.link_color')}
                                                onFocus={() => setIsEnabled(true)}
                                            />
                                            <ColorPickerInput
                                                label="Icon color"
                                                value={iconColor}
                                                onChange={(value) => setWidgetData({ ...widgetData, general: { ...widgetData.general, styles: { ...widgetData.general.styles, accent: { ...widgetData.general.styles.accent, icons_color: value } } } })}
                                                error={getErrorMessage('general.styles.accent.icons_color')}
                                                onClearError={() => clearError('general.styles.accent.icons_color')}
                                            />
                                        </Box>

                                    </BlockStack>
                                </Collapsible>

                                <div className="accordian-title" style={{ backgroundColor: '#f0f0f0', padding: '5px 10px', borderRadius: '5px', marginTop: '5px' }}>
                                    <Button
                                        variant="monochromePlain"
                                        disclosure={openCollapsible === 'advanced' ? 'up' : 'down'}
                                        onClick={() => handleToggle('advanced')}
                                        aria-expanded={openCollapsible === 'advanced'}
                                        aria-controls="advanced-collapsible"
                                        fullWidth
                                        textAlign="left"
                                    >
                                        <Text as="h1" variant="headingMd">Advanced</Text>
                                    </Button>
                                </div>
                                <Collapsible
                                    open={openCollapsible === 'advanced'}
                                    id="advanced-collapsible"
                                    transition={{ duration: '500ms', timingFunction: 'ease-in-out' }}
                                    expandOnPrint
                                >

                                    <BlockStack gap="300" style={{ display: 'flex', flexDirection: 'column', padding: '10px', gap: '10px' }}>
                                        {/* Card */}
                                        <BlockStack gap="300">
                                            <Text variant="bodyLg" fontWeight='semibold'>Box</Text>
                                            <Box style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                <ColorPickerInput
                                                    label="Box background color"
                                                    value={boxBackgroundColor}
                                                    onChange={(value) => setWidgetData({ ...widgetData, general: { ...widgetData.general, advanced: { ...widgetData.general.advanced, box: { ...widgetData.general.advanced.box, background_color: value } } } })}
                                                    error={getErrorMessage('general.advanced.box.background_color')}
                                                    onClearError={() => clearError('general.advanced.box.background_color')}
                                                    onFocus={() => setIsEnabled(true)}
                                                />
                                                <ColorPickerInput
                                                    label="Box border color"
                                                    value={boxBorderColor}
                                                    onChange={(value) => setWidgetData({ ...widgetData, general: { ...widgetData.general, advanced: { ...widgetData.general.advanced, box: { ...widgetData.general.advanced.box, border_color: value } } } })}
                                                    error={getErrorMessage('general.advanced.box.border_color')}
                                                    onClearError={() => clearError('general.advanced.box.border_color')}
                                                    onFocus={() => setIsEnabled(true)}
                                                />
                                            </Box>
                                        </BlockStack>

                                        <Box style={{ margin: '10px 0px 10px' }}>
                                            <Divider />
                                        </Box>

                                        <BlockStack gap="300">
                                            <Text variant="bodyLg" fontWeight='semibold'>Card</Text>
                                            <Box style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                                                <ColorPickerInput
                                                    label="Card background color"
                                                    value={cardBackgroundColor}
                                                    onChange={(value) => setWidgetData({ ...widgetData, general: { ...widgetData.general, advanced: { ...widgetData.general.advanced, card: { ...widgetData.general.advanced.card, background_color: value } } } })}
                                                    error={getErrorMessage('general.advanced.card.background_color')}
                                                    onClearError={() => clearError('general.advanced.card.background_color')}
                                                    onFocus={() => setIsEnabled(true)}
                                                />
                                                <ColorPickerInput
                                                    label="Card border color"
                                                    value={cardBorderColor}
                                                    onChange={(value) => setWidgetData({ ...widgetData, general: { ...widgetData.general, advanced: { ...widgetData.general.advanced, card: { ...widgetData.general.advanced.card, border_color: value } } } })}
                                                    error={getErrorMessage('general.advanced.card.border_color')}
                                                    onClearError={() => clearError('general.advanced.card.border_color')}
                                                    onFocus={() => setIsEnabled(true)}
                                                />
                                            </Box>
                                            <div onMouseDown={() => setIsEnabled(true)}>
                                                <RangeSlider
                                                    label="Card border width"
                                                    max={4}
                                                    min={0}
                                                    value={cardBorderWidth}
                                                    onChange={(value) => setWidgetData({ ...widgetData, general: { ...widgetData.general, advanced: { ...widgetData.general.advanced, card: { ...widgetData.general.advanced.card, border_width: value } } } })}
                                                    suffix={<Box style={{ textAlign: 'right', width: '24px' }}>{cardBorderWidth}px</Box>}
                                                />
                                            </div>
                                            <div onMouseDown={() => setIsEnabled(true)}>
                                                <RangeSlider
                                                    label="Card border radius"
                                                    max={36}
                                                    min={0}
                                                    value={cardBorderRadius}
                                                    onChange={(value) => setWidgetData({ ...widgetData, general: { ...widgetData.general, advanced: { ...widgetData.general.advanced, card: { ...widgetData.general.advanced.card, border_radius: value } } } })}
                                                    suffix={<Box style={{ textAlign: 'right', width: '24px' }}>{cardBorderRadius}px</Box>}
                                                />
                                            </div>
                                        </BlockStack>

                                        <Box style={{ margin: '10px 0px 10px' }}>
                                            <Divider />
                                        </Box>

                                        {/* section */}
                                        <BlockStack gap="300">
                                            <Text variant="bodyLg" fontWeight='semibold'>Section</Text>
                                            <Box style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                                                <ColorPickerInput
                                                    label="Section background color"
                                                    value={sectionBackgroundColor}
                                                    onChange={(value) => setWidgetData({ ...widgetData, general: { ...widgetData.general, advanced: { ...widgetData.general.advanced, section: { ...widgetData.general.advanced.section, background_color: value } } } })}
                                                    error={getErrorMessage('general.advanced.section.background_color')}
                                                    onClearError={() => clearError('general.advanced.section.background_color')}
                                                    onFocus={() => setIsEnabled(false)}
                                                />
                                                <ColorPickerInput
                                                    label="Section border color"
                                                    value={sectionBorderColor}
                                                    onChange={(value) => setWidgetData({ ...widgetData, general: { ...widgetData.general, advanced: { ...widgetData.general.advanced, section: { ...widgetData.general.advanced.section, card_border_color: value } } } })}
                                                    error={getErrorMessage('general.advanced.section.card_border_color')}
                                                    onClearError={() => clearError('general.advanced.section.card_border_color')}
                                                    onFocus={() => setIsEnabled(false)}
                                                />
                                            </Box>
                                            <div onMouseDown={() => setIsEnabled(false)}>
                                                <RangeSlider
                                                    label="Section border width"
                                                    max={4}
                                                    min={0}
                                                    value={sectionBorderWidth}
                                                    onChange={(value) => setWidgetData({ ...widgetData, general: { ...widgetData.general, advanced: { ...widgetData.general.advanced, section: { ...widgetData.general.advanced.section, card_border_width: value } } } })}
                                                    suffix={<Box style={{ textAlign: 'right', width: '24px' }}>{sectionBorderWidth}px</Box>}
                                                />
                                            </div>
                                            <div onMouseDown={() => setIsEnabled(false)}>
                                                <RangeSlider
                                                    label="Section border radius"
                                                    max={36}
                                                    min={0}
                                                    value={sectionBorderRadius}
                                                    onChange={(value) => setWidgetData({ ...widgetData, general: { ...widgetData.general, advanced: { ...widgetData.general.advanced, section: { ...widgetData.general.advanced.section, border_radius: value } } } })}
                                                    suffix={<Box style={{ textAlign: 'right', width: '24px' }}>{sectionBorderRadius}px</Box>}
                                                />
                                            </div>
                                        </BlockStack>

                                        <Box style={{ margin: '10px 0px 10px' }}>
                                            <Divider />
                                        </Box>

                                        <Text variant="bodyLg" fontWeight='semibold'>Input</Text>
                                        <Box style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                            <ColorPickerInput
                                                label="Input field color"
                                                value={inputFieldColor}
                                                onChange={(value) => setWidgetData({ ...widgetData, general: { ...widgetData.general, advanced: { ...widgetData.general.advanced, input: { ...widgetData.general.advanced.input, input_color: value } } } })}
                                                error={getErrorMessage('general.advanced.input.input_color')}
                                                onClearError={() => clearError('general.advanced.input.input_color')}
                                                onFocus={() => setIsEnabled(false)}
                                            />
                                            <ColorPickerInput
                                                label="Input field border color"
                                                value={inputFieldBorderColor}
                                                onChange={(value) => setWidgetData({ ...widgetData, general: { ...widgetData.general, advanced: { ...widgetData.general.advanced, input: { ...widgetData.general.advanced.input, input_border_color: value } } } })}
                                                error={getErrorMessage('general.advanced.input.input_border_color')}
                                                onClearError={() => clearError('general.advanced.input.input_border_color')}
                                                onFocus={() => setIsEnabled(false)}
                                            />
                                            <RangeSlider
                                                label="Input field border radius"
                                                max={36}
                                                min={0}
                                                value={inputBorderRadius}
                                                onChange={(value) => setWidgetData({ ...widgetData, general: { ...widgetData.general, advanced: { ...widgetData.general.advanced, input: { ...widgetData.general.advanced.input, input_border_radius: value } } } })}
                                                suffix={<Box style={{ textAlign: 'right', width: '24px' }}>{inputBorderRadius}px</Box>}
                                                onFocus={() => setIsEnabled(false)}
                                            />
                                        </Box>

                                        <ColorPickerInput
                                            label="Progress Bar Fill"
                                            value={progressBarFill}
                                            onChange={(value) => setWidgetData({ ...widgetData, general: { ...widgetData.general, advanced: { ...widgetData.general.advanced, section: { ...widgetData.general.advanced.section, progress_bar_fill: value } } } })}
                                            error={getErrorMessage('general.advanced.section.progress_bar_fill')}
                                            onClearError={() => clearError('general.advanced.section.progress_bar_fill')}
                                            onFocus={() => setIsEnabled(false)}
                                        />
                                        <ColorPickerInput
                                            label="Progress Bar Background"
                                            value={progressBarBackground}
                                            onChange={(value) => setWidgetData({ ...widgetData, general: { ...widgetData.general, advanced: { ...widgetData.general.advanced, section: { ...widgetData.general.advanced.section, progress_bar_background: value } } } })}
                                            error={getErrorMessage('general.advanced.section.progress_bar_background')}
                                            onClearError={() => clearError('general.advanced.section.progress_bar_background')}
                                            onFocus={() => setIsEnabled(false)}
                                        />

                                    </BlockStack>

                                </Collapsible>
                            </Grid.Cell>

                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 7, xl: 7 }}>
                                <div style={{ position: 'sticky', top: '20px' }}>
                                    {/* --- THIS IS THE MAGIC CONTAINER --- */}
                                    <div
                                        style={{
                                            background: 'linear-gradient(rgb(173, 233, 202), rgb(229, 233, 197))',
                                            backgroundSize: '100% 100%, 20px 20px',
                                            border: '1px solid #e0e0e0',
                                            maxHeight: presentation === 'popup' ? '600px' : '100%',
                                            minHeight: '400px',
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            justifyContent: presentation === 'popup' ? 'center' : (widgetPosition === 'left' ? 'flex-start' : 'flex-end'),
                                            borderRadius: '16px',
                                            position: 'relative',
                                            overflow: presentation === 'popup' ? 'hidden' : 'visible'
                                        }}
                                    >
                                        {/* --- YOUR WIDGET CONTENT GOES HERE --- */}
                                        {/* This represents the blue "Welcome" card from your screenshot */}
                                        <div
                                            className="widget-scroll-container"
                                            style={{
                                                width: '350px',
                                                minHeight: widgetData?.general?.styles?.presentation === 'popup' ? '500px' : '600px',
                                                margin: widgetData?.general?.styles?.presentation === 'popup' ? '50px auto' : '0px',
                                                marginLeft: widgetData?.general?.styles?.presentation === 'popup' ? 'auto' : (widgetData?.general?.styles?.position === 'left' ? '0px' : 'auto'),
                                                marginRight: widgetData?.general?.styles?.presentation === 'popup' ? 'auto' : (widgetData?.general?.styles?.position === 'right' ? '0px' : 'auto'),
                                                borderRadius: cardBorderRadius,
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                // overflow: 'hidden',
                                            }}>
                                            {/* Top Header */}
                                            <Box style={{ backgroundColor: headerBarColor, position: 'sticky', top: '0', zIndex: '1000' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
                                                    <text style={{ color: headerBarTextColor }}>
                                                        {headerBarText}
                                                    </text>
                                                    <Box>
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 384 512"
                                                            width="12"
                                                            height="12"
                                                            fill={headerBarTextColor}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            <path d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z" />
                                                        </svg>
                                                    </Box>
                                                </div>
                                                <Divider />
                                            </Box>

                                            {/* Top Body */}
                                            <div style={{ ...headerBackgroundStyle, padding: '20px', paddingBottom: '70px', paddingTop: '20px', color: headerTextColor }}>
                                                <BlockStack gap="200">
                                                    <Text alignment='center' variant="headingLg">{headerText}</Text>
                                                    <Text breakWord alignment='center' variant="bodyMd">{headerContent}</Text>
                                                </BlockStack>
                                            </div>

                                            {/* White Body */}
                                            <div style={{ ...contentBackgroundStyle, padding: '20px', paddingTop: '15px' }}>
                                                {isEnabled ?
                                                    <>
                                                        {/* Join and Earn Rewards Card */}
                                                        <div style={{ marginTop: '-60px', backgroundColor: cardBackgroundColor, border: `${cardBorderWidth}px solid ${cardBorderColor}`, padding: '20px', borderRadius: cardBorderRadius, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
                                                            <BlockStack gap="200" align="center">
                                                                {newMemberCardImageUrl ? (
                                                                    <div style={{
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        alignItems: 'center',
                                                                        gap: '8px',
                                                                        width: '100%',
                                                                        marginBottom: '20px'

                                                                    }}>
                                                                        <img
                                                                            src={newMemberCardImageUrl}
                                                                            alt={newMemberCardImage}
                                                                            style={{
                                                                                maxWidth: imagePosition === 'full-width' ? '100%' : '120px',
                                                                                maxHeight: '100%',
                                                                                objectFit: 'contain',
                                                                                borderRadius: '4px'
                                                                            }}
                                                                        />
                                                                    </div>
                                                                ) : null}
                                                                <text style={{ color: headingColor, fontSize: '16px', textAlign: 'center', fontWeight: '700', wordBreak: 'break-word', fontFamily: 'sans-serif' }}>
                                                                    {newMemberCardTitle}
                                                                </text>
                                                                <button
                                                                    style={{
                                                                        margin: '0 auto',
                                                                        marginTop: '2px',
                                                                        backgroundColor: buttonColor,
                                                                        color: buttonTextColor,
                                                                        width: '80%',
                                                                        padding: '10px 20px',
                                                                        borderRadius: buttonRadius,
                                                                        border: 'none',
                                                                        cursor: 'pointer',
                                                                        fontWeight: 'bold',
                                                                        transition: 'all 0.3s ease'
                                                                    }}
                                                                    onMouseEnter={e => {
                                                                        e.target.style.opacity = "0.8";
                                                                        e.target.style.transform = "translateY(-4px)";
                                                                    }}
                                                                    onMouseLeave={e => {
                                                                        e.target.style.opacity = "1";
                                                                        e.target.style.transform = "translateY(0)";
                                                                    }}
                                                                >
                                                                    {newMemberCardButtonText}
                                                                </button>

                                                                <span style={{ color: textColor, }}>
                                                                    <Text alignment='center' variant="bodySm" >
                                                                        {newMemberCardSignInMessage} {' '}
                                                                        <span style={{ color: linkColor, fontWeight: '700' }}
                                                                            onMouseEnter={e => {
                                                                                e.target.style.textDecoration = "underline";
                                                                            }}
                                                                            onMouseLeave={e => {
                                                                                e.target.style.textDecoration = "none";
                                                                            }}
                                                                        >{newMemberCardSignInLinkText}
                                                                        </span>
                                                                    </Text>
                                                                </span>


                                                            </BlockStack>
                                                        </div>

                                                        {/* Earn Points Card */}
                                                        <div style={{ marginTop: '20px', border: `${cardBorderWidth}px solid ${cardBorderColor}`, padding: '16px', backgroundColor: cardBackgroundColor, borderRadius: cardBorderRadius, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                                                            <BlockStack gap="300">
                                                                {/* Section Header */}
                                                                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'center', gap: '10px' }}>
                                                                    <text style={{ color: headingColor, fontSize: '16px', textAlign: 'center', fontWeight: '700', fontFamily: 'sans-serif' }}>
                                                                        {pointsCardTitle}
                                                                    </text>
                                                                    <text style={{ wordBreak: 'break-word', color: textColor, fontSize: '12px' }}>
                                                                        {pointsCardMessage}
                                                                    </text>
                                                                </div>

                                                                {/* Ways to Earn */}
                                                                <div
                                                                    style={{
                                                                        border: `1px solid ${boxBorderColor}`,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '12px',
                                                                        padding: '14px 16px',
                                                                        backgroundColor: boxBackgroundColor,
                                                                        borderRadius: '12px',
                                                                        cursor: 'pointer',
                                                                        transition: 'all 0.3s ease'
                                                                    }}
                                                                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.7'; e.target.style.transform = "translateY(-2px)"; }}
                                                                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.target.style.transform = "translateY(0)"; }}
                                                                >

                                                                    <BoldStarIcon color={iconColor} width='22' height='22' />
                                                                    <text style={{ flex: 1, fontWeight: 500, fontSize: '14px', color: headingColor }}>{pointsCardWaysToEarnText}</text>
                                                                    <BoldArrowRightIcon color={iconColor} height='14' width='14' />
                                                                </div>

                                                                {/* Ways to Redeem */}
                                                                <div
                                                                    style={{
                                                                        border: `1px solid ${boxBorderColor}`,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '12px',
                                                                        padding: '14px 16px',
                                                                        backgroundColor: boxBackgroundColor,
                                                                        borderRadius: '12px',
                                                                        cursor: 'pointer',
                                                                        transition: 'all 0.3s ease'
                                                                    }}
                                                                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.7'; e.target.style.transform = "translateY(-2px)"; }}
                                                                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.target.style.transform = "translateY(0)"; }}
                                                                >
                                                                    <BoldGiftIcon color={iconColor} width='22' height='22' />
                                                                    <span style={{ flex: 1, fontWeight: 500, fontSize: '14px', color: headingColor }}>{pointsCardWaysToRedeemText}</span>
                                                                    <BoldArrowRightIcon color={iconColor} height='14' width='14' />
                                                                </div>
                                                            </BlockStack>
                                                        </div>

                                                        {/* Referral Program Section */}
                                                        <div
                                                            style={{
                                                                border: `${cardBorderWidth}px solid ${cardBorderColor}`,
                                                                borderRadius: cardBorderRadius,
                                                                padding: '20px',
                                                                backgroundColor: cardBackgroundColor,
                                                                marginTop: '20px',
                                                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                            }}
                                                        >
                                                            {/* Header */}
                                                            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                                                                <text style={{ color: headingColor, fontSize: '16px', textAlign: 'center', fontWeight: '700', fontFamily: 'sans-serif' }}>
                                                                    {referralCardTitle}
                                                                </text>

                                                                <p style={{ fontSize: '13px', color: textColor, margin: 0, wordBreak: 'break-word' }}>
                                                                    {referralCardMessage}
                                                                </p>
                                                            </div>

                                                            <Box style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
                                                                {/* You get */}
                                                                <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center', backgroundColor: boxBackgroundColor, border: `1px solid ${boxBorderColor}`, padding: '10px', borderRadius: '10px' }}
                                                                >
                                                                    <BoldTruckIcon color={iconColor} width='22' height='22' />
                                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                        <span style={{ fontSize: '14px', fontWeight: 500, color: headingColor }}>{referrerTitle}</span>
                                                                        <text style={{ fontSize: '13px', color: textColor }}>Earn Points S1</text>
                                                                    </div>
                                                                </div>

                                                                {/* Your friend gets */}
                                                                <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center', backgroundColor: boxBackgroundColor, border: `1px solid ${boxBorderColor}`, padding: '10px', borderRadius: '10px' }}
                                                                >
                                                                    <BoldDiscountIcon color={iconColor} width='22' height='22' />
                                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                        <span style={{ fontSize: '14px', fontWeight: 500, color: headingColor }}>{refereeTitle}</span>
                                                                        <text style={{ fontSize: '13px', color: textColor }}>test 2</text>
                                                                    </div>
                                                                </div>
                                                            </Box>
                                                        </div>

                                                        {/* VIP Tiers Section */}
                                                        <div style={{ marginTop: '20px', border: `${cardBorderWidth}px solid ${cardBorderColor}`, padding: '20px', backgroundColor: cardBackgroundColor, borderRadius: cardBorderRadius, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                                                            <BlockStack gap="200">
                                                                {/* Crown Icon and Title */}
                                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                        <BoldCrownIcon color={iconColor} height='22' width='22' />
                                                                        <span style={{ color: headingColor }} >
                                                                            <Text variant="headingMd" as="h3">{vipTierCardTitle}</Text>
                                                                        </span>
                                                                    </div>
                                                                    <text style={{ wordBreak: 'break-word', color: textColor, fontSize: '12px' }}>
                                                                        {vipTierCardMessage}
                                                                    </text>
                                                                </div>
                                                            </BlockStack>
                                                        </div>
                                                    </>
                                                    :
                                                    <>
                                                        <div style={{ marginTop: '-60px', backgroundColor: sectionBackgroundColor, border: `${sectionBorderWidth}px solid ${sectionBorderColor}`, padding: '16px', borderRadius: sectionBorderRadius, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
                                                            <BlockStack gap="400" align="center">
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: boxBackgroundColor, border: `1px solid ${boxBorderColor}`, padding: '10px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.3s ease' }}
                                                                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.7'; e.target.style.transform = "translateY(-2px)"; }}
                                                                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.target.style.transform = "translateY(0)"; }}
                                                                >
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px' }}>
                                                                        <BoldStarIcon color={iconColor} width='22' height='22' />
                                                                        <span style={{ color: headingColor }}>
                                                                            <Text variant="bodyLg">4456 points</Text>
                                                                        </span>
                                                                    </div>

                                                                    <button
                                                                        style={{
                                                                            backgroundColor: buttonColor,
                                                                            color: buttonTextColor,
                                                                            width: 'auto',
                                                                            padding: '4px 10px',
                                                                            borderRadius: buttonRadius,
                                                                            border: 'none',
                                                                            cursor: 'pointer',
                                                                            fontWeight: '400',
                                                                            transition: 'all 0.3s ease'
                                                                        }}
                                                                    // onMouseEnter={e => {
                                                                    //     e.target.style.opacity = "0.8";
                                                                    //     e.target.style.transform = "translateY(-4px)";
                                                                    // }}
                                                                    // onMouseLeave={e => {
                                                                    //     e.target.style.opacity = "1";
                                                                    //     e.target.style.transform = "translateY(0)";
                                                                    // }}
                                                                    >
                                                                        History
                                                                    </button>
                                                                </div>

                                                                {/* <span style={{ color: headingColor }}>
                                                                    <Text variant='headingSm'>Upcoming Rewards</Text>
                                                                </span> */}

                                                                <Box style={{ display: 'flex', flexDirection: 'column', padding: '24px', border: `${cardBorderWidth}px solid ${cardBorderColor}`, backgroundColor: cardBackgroundColor, borderRadius: cardBorderRadius }}>
                                                                    {/* <div style={{ textAlign: 'center', marginBottom: '12px' }}> */}
                                                                    <text style={{ textAlign: 'center', marginBottom: '15px', color: headingColor, fontWeight: '500', fontSize: '16px' }}>{vipTierCardCurrentTier} : <b>R2</b></text>

                                                                    <div style={{ width: '100%', backgroundColor: progressBarBackground, borderRadius: '10px', height: '8px', overflow: 'hidden', margin: '5px 0 5px' }}>
                                                                        <div style={{ width: '40%', backgroundColor: progressBarFill, height: '100%', borderRadius: '10px' }}></div>
                                                                    </div>

                                                                    <text style={{ wordBreak: 'break-word', textAlign: 'center', marginTop: '15px', color: textColor, fontSize: '14px' }}>55974 {vipTierCardNextTier} R3</text>

                                                                    <span style={{ margin: '16px 0' }}>
                                                                        <Divider />
                                                                    </span>

                                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                            <BoldFillStarIcon color={iconColor} />
                                                                            <text style={{ textAlign: "center", fontSize: '14px', fontWeight: '500', color: headingColor, }}>{vipTierCardAllTier}</text>
                                                                        </div>
                                                                        <BoldArrowRightIcon color={iconColor} height='14' width='14' />
                                                                    </div>
                                                                </Box>

                                                                {/* Rewards card */}
                                                                <div
                                                                    style={{
                                                                        border: `1px solid ${boxBorderColor}`,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '12px',
                                                                        padding: '14px 16px',
                                                                        backgroundColor: boxBackgroundColor,
                                                                        borderRadius: '12px',
                                                                        cursor: 'pointer',
                                                                        transition: 'all 0.3s ease'
                                                                    }}
                                                                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.7'; e.target.style.transform = "translateY(-2px)"; }}
                                                                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.target.style.transform = "translateY(0)"; }}
                                                                >
                                                                    <BoldTrophyIcon color={iconColor} width='22' height='22' />
                                                                    <text style={{ flex: 1, fontWeight: 500, fontSize: '14px', color: headingColor }}>{pointsCardMyRewardsText}</text>
                                                                    <BoldArrowRightIcon color={iconColor} height='14' width='14' />
                                                                </div>

                                                                {/* Ways to Earn */}
                                                                <div
                                                                    style={{
                                                                        border: `1px solid ${boxBorderColor}`,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '12px',
                                                                        padding: '14px 16px',
                                                                        backgroundColor: boxBackgroundColor,
                                                                        borderRadius: '12px',
                                                                        cursor: 'pointer',
                                                                        transition: 'all 0.3s ease'
                                                                    }}
                                                                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.7'; e.target.style.transform = "translateY(-2px)"; }}
                                                                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.target.style.transform = "translateY(0)"; }}
                                                                >
                                                                    <BoldStarIcon color={iconColor} width='22' height='22' />
                                                                    <text style={{ flex: 1, fontWeight: 500, fontSize: '14px', color: headingColor }}>{pointsCardWaysToEarnText}</text>
                                                                    <BoldArrowRightIcon color={iconColor} height='14' width='14' />
                                                                </div>

                                                                {/* Ways to redeem */}
                                                                <div
                                                                    style={{
                                                                        border: `1px solid ${boxBorderColor}`,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '12px',
                                                                        padding: '14px 16px',
                                                                        backgroundColor: boxBackgroundColor,
                                                                        borderRadius: '12px',
                                                                        cursor: 'pointer',
                                                                        transition: 'all 0.3s ease'
                                                                    }}
                                                                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.7'; e.target.style.transform = "translateY(-2px)"; }}
                                                                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.target.style.transform = "translateY(0)"; }}
                                                                >
                                                                    <BoldGiftIcon color={iconColor} width='22' height='22' />
                                                                    <text style={{ flex: 1, fontWeight: 500, fontSize: '14px', color: headingColor }}>{pointsCardWaysToRedeemText}</text>
                                                                    <BoldArrowRightIcon color={iconColor} height='14' width='14' />
                                                                </div>



                                                                {/* <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                                    <button
                                                                        style={{
                                                                            backgroundColor: buttonColor,
                                                                            color: buttonTextColor,
                                                                            padding: '4px 10px',
                                                                            borderRadius: buttonRadius,
                                                                            border: 'none',
                                                                            cursor: 'pointer',
                                                                            fontWeight: '400',
                                                                            lineHeight: '1.4',
                                                                        }}
                                                                    >
                                                                        Logout
                                                                    </button>
                                                                </div> */}
                                                            </BlockStack>
                                                        </div>

                                                        {/* Referral Program Section */}
                                                        <div
                                                            style={{
                                                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                                border: `${sectionBorderWidth}px solid ${sectionBorderColor}`,
                                                                borderRadius: sectionBorderRadius,
                                                                padding: '20px',
                                                                backgroundColor: sectionBackgroundColor,
                                                                marginTop: '20px'
                                                            }}
                                                        >
                                                            {/* Header */}
                                                            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                                                                <text style={{ color: headingColor, fontSize: '16px', textAlign: 'center', fontWeight: '700', fontFamily: 'sans-serif' }}>
                                                                    {referralCardTitle}
                                                                </text>
                                                                <p style={{ fontSize: '13px', color: textColor, margin: 0, wordBreak: 'break-word' }}>
                                                                    {referralCardMessage}
                                                                </p>
                                                            </div>

                                                            <Box style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
                                                                {/* You get */}
                                                                <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center', backgroundColor: boxBackgroundColor, border: `1px solid ${boxBorderColor}`, padding: '10px', borderRadius: '10px' }} >
                                                                    <BoldTruckIcon color={iconColor} width='22' height='22' />
                                                                    <div style={{ display: 'flex', flexDirection: 'column' }} >
                                                                        <span style={{ fontSize: '14px', fontWeight: 500, color: headingColor }}>{referrerTitle}</span>
                                                                        <text style={{ fontSize: '13px', color: textColor }}>Earn Points S1</text>
                                                                    </div>
                                                                </div>

                                                                {/* Your friend gets */}
                                                                <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center', backgroundColor: boxBackgroundColor, border: `1px solid ${boxBorderColor}`, padding: '10px', borderRadius: '10px' }} >
                                                                    <BoldDiscountIcon color={iconColor} width='22' height='22' />
                                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                        <span style={{ fontSize: '14px', fontWeight: 500, color: headingColor }}>{refereeTitle}</span>
                                                                        <text style={{ fontSize: '13px', color: textColor }}>test 2</text>
                                                                    </div>
                                                                </div>
                                                            </Box>

                                                            {/* Your link */}
                                                            <div style={{ marginBottom: '16px' }}>
                                                                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                                                                    <text style={{ color: headingColor, fontSize: '16px', fontWeight: '700' }}>
                                                                        {referralCardLinkTitle}
                                                                    </text>
                                                                </div>

                                                                {/* CONTAINER: padding removed, overflow hidden added */}
                                                                <div style={{
                                                                    display: 'flex',
                                                                    alignItems: 'stretch',
                                                                    border: `1px solid ${inputFieldBorderColor}`,
                                                                    borderRadius: inputBorderRadius,
                                                                    backgroundColor: inputFieldColor,
                                                                    overflow: 'hidden'
                                                                }}
                                                                >
                                                                    {/* TEXT: padding added here */}
                                                                    <span style={{
                                                                        flex: 1,
                                                                        fontSize: '13px',
                                                                        color: '#666',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        padding: '8px 10px',
                                                                        display: 'flex',
                                                                        alignItems: 'center'
                                                                    }}>
                                                                        <text style={{ textWrap: 'nowrap' }}> {referlinkData?.referral_link}</text>
                                                                    </span>

                                                                    {/* BUTTON: border-left added, padding adjusted */}
                                                                    <button style={{
                                                                        background: 'none',
                                                                        border: 'none',
                                                                        borderLeft: `1px solid ${inputFieldBorderColor}`,
                                                                        cursor: 'pointer',
                                                                        padding: '0 10px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        margin: 0,
                                                                        borderRadius: 0

                                                                    }}
                                                                        onMouseEnter={e => { e.currentTarget.style.opacity = '0.7'; }}
                                                                        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                                                                    >
                                                                        <BoldCopyIcon color={iconColor} width='20' height='20' />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            {/* My Discounts card */}
                                                            <div
                                                                style={{
                                                                    borderTop: `1px solid ${boxBorderColor}`,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '12px',
                                                                    padding: '14px 16px',
                                                                    cursor: 'pointer',
                                                                    transition: 'background 0.2s'
                                                                }}
                                                                onMouseEnter={e => { e.currentTarget.style.opacity = '0.7'; }}
                                                                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                                                            >
                                                                <BoldRewardsIcon color={iconColor} width='22' height='22' />
                                                                <span style={{ flex: 1, fontWeight: 500, fontSize: '14px', color: headingColor }}>{referralCardMyDiscountText}</span>
                                                                <BoldArrowRightIcon color={iconColor} height='14' width='14' />
                                                            </div>
                                                        </div>
                                                    </>
                                                }
                                            </div>

                                        </div>
                                        {/* --- END WIDGET CONTENT --- */}

                                    </div>
                                </div>
                            </Grid.Cell>
                        </Grid>
                    </Box>
                </>
            )}
        </Card>
    )
}

export default General;
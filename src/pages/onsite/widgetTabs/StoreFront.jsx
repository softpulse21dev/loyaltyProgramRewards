import { BlockStack, Box, Button, ButtonGroup, Card, Collapsible, Divider, Grid, RadioButton, RangeSlider, Text, TextField } from '@shopify/polaris'
import { DeleteIcon, UploadIcon } from '@shopify/polaris-icons';
import React, { useCallback, useState, useMemo, useEffect } from 'react'
import ColorPickerInput from '../../../components/ColorPickerInput';
import { BoldArrowRightIcon, BoldCopyIcon, BoldCrownIcon, BoldDiscountIcon, BoldFillStarIcon, BoldGiftIcon, BoldRewardsIcon, BoldStarIcon, BoldTrophyIcon, BoldTruckIcon, StarIcon } from '../../../assets/svg/svg';

const StoreFront = ({ widgetData, setWidgetData, errors = {}, clearError, openCollapsible, setOpenCollapsible }) => {

    const [isEnabled, setIsEnabled] = useState(true);

    // Handler to switch between Enable and Disable
    const handleStatusChange = useCallback((status) => {
        if (status === 'enable') {
            setIsEnabled(true);
        } else {
            setIsEnabled(false);
        }
    }, []);

    // Handler to toggle collapsibles - only one can be open at a time
    const handleToggle = useCallback((section) => {
        setOpenCollapsible((prev) => (prev === section ? null : section));
    }, [setOpenCollapsible]);

    // Helper function to get error message
    const getErrorMessage = useCallback((fieldPath) => {
        return errors[fieldPath] || '';
    }, [errors]);

    // Helper function to handle field change and clear error
    const handleFieldChange = useCallback((fieldPath, value, updateFn) => {
        updateFn(value);
        if (clearError) {
            clearError(fieldPath);
        }
    }, [clearError]);

    // helper variables for widget styles
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
    const balanceText = storefrontData?.header?.balance_text;
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
                return { background: `linear-gradient(270deg, ${headerGradientColor1} 0%, ${headerGradientColor2} 100%)` };
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
                <Grid columns={{ xs: 6, sm: 6, md: 6, lg: 12, xl: 12 }}>
                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 2, lg: 4, xl: 4 }}>


                        <div className="accordian-title" style={{ backgroundColor: '#f0f0f0', padding: '5px 10px', borderRadius: '5px', marginBottom: '5px' }}>
                            <Button
                                variant="monochromePlain"
                                disclosure={openCollapsible === 'header' ? 'up' : 'down'}
                                onClick={() => handleToggle('header')}
                                aria-expanded={openCollapsible === 'header'}
                                aria-controls="header-collapsible"
                                fullWidth
                                textAlign="left"
                            >
                                <Text as="h1" variant="headingMd">Header</Text>
                            </Button>
                        </div>
                        <Collapsible
                            open={openCollapsible === 'header'}
                            id="header-collapsible"
                            transition={{ duration: '500ms', timingFunction: 'ease-in-out' }}
                            expandOnPrint
                        >
                            <BlockStack gap="300" style={{ display: 'flex', flexDirection: 'column', padding: '10px', gap: '10px' }}>
                                <BlockStack gap="200">
                                    <TextField
                                        label="Header bar text"
                                        value={headerBarText}
                                        onChange={(value) => handleFieldChange('storefront.header.header_bar_text', value, (v) => setWidgetData({ ...widgetData, storefront_app: { ...storefrontData, header: { ...storefrontData.header, header_bar_text: v } } }))}
                                        error={getErrorMessage('storefront.header.header_bar_text') ? true : null}
                                    />
                                    <TextField
                                        label="Header text"
                                        value={headerText}
                                        onChange={(value) => handleFieldChange('storefront.header.header_text', value, (v) => setWidgetData({ ...widgetData, storefront_app: { ...storefrontData, header: { ...storefrontData.header, header_text: v } } }))}
                                        error={getErrorMessage('storefront.header.header_text') ? true : null}
                                    />
                                    <TextField
                                        label="Header content"
                                        value={headerContent}
                                        onChange={(value) => handleFieldChange('storefront.header.header_content', value, (v) => setWidgetData({ ...widgetData, storefront_app: { ...storefrontData, header: { ...storefrontData.header, header_content: v } } }))}
                                        error={getErrorMessage('storefront.header.header_content') ? true : null}
                                    />
                                    <TextField
                                        label="Balance"
                                        value={balanceText}
                                        onChange={(value) => handleFieldChange('storefront.header.balance_text', value, (v) => setWidgetData({ ...widgetData, storefront_app: { ...storefrontData, header: { ...storefrontData.header, balance_text: v } } }))}
                                        error={getErrorMessage('storefront.header.balance_text') ? true : null}
                                    />
                                </BlockStack>

                            </BlockStack>
                        </Collapsible>

                        <div className="accordian-title" style={{ backgroundColor: '#f0f0f0', padding: '5px 10px', borderRadius: '5px', marginTop: '5px' }}>
                            <Button
                                variant="monochromePlain"
                                disclosure={openCollapsible === 'new' ? 'up' : 'down'}
                                onClick={() => handleToggle('new')}
                                aria-expanded={openCollapsible === 'new'}
                                aria-controls="new-collapsible"
                                fullWidth
                                textAlign="left"
                            >
                                <Text as="h1" variant="headingMd">New member card</Text>
                            </Button>
                        </div>
                        <Collapsible
                            open={openCollapsible === 'new'}
                            id="new-collapsible"
                            transition={{ duration: '500ms', timingFunction: 'ease-in-out' }}
                            expandOnPrint
                        >
                            <BlockStack gap="300" style={{ display: 'flex', flexDirection: 'column', padding: '10px', gap: '10px' }}>
                                <BlockStack gap="200">
                                    <text>Image or logo (optional)</text>
                                    {/* Dashed border upload area - shows preview if image uploaded */}
                                    <div
                                        onMouseDown={() => setIsEnabled(true)}
                                        onClick={() => document.getElementById('new-member-card-image-input').click()}
                                        style={{
                                            border: '1px dashed #c4cdd5',
                                            borderRadius: '8px',
                                            padding: newMemberCardImage ? '8px' : '24px',
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
                                        {newMemberCardImageUrl ? (
                                            // Show image preview inside the picker
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '8px',
                                                width: '100%'
                                            }}>
                                                <img
                                                    src={newMemberCardImageUrl}
                                                    alt={newMemberCardImage}
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
                                                document.getElementById('new-member-card-image-input').click();
                                            }}>
                                                Add file
                                            </Button>
                                        )}
                                        <input
                                            type="file"
                                            id="new-member-card-image-input"
                                            accept=".jpg,.jpeg,.png,.svg,image/jpeg,image/png,image/svg+xml"
                                            style={{ display: 'none' }}
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
                                                    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.svg'];
                                                    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

                                                    if (allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension)) {
                                                        setWidgetData({ ...widgetData, storefront_app: { ...widgetData.storefront_app, new_member_card: { ...widgetData.storefront_app.new_member_card, new_member_image: file } } })
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
                                    <Box style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0px' }}>
                                        {newMemberCardImageUrl && (
                                            <Button tone="critical" icon={DeleteIcon} onClick={() => setWidgetData({ ...widgetData, storefront_app: { ...widgetData.storefront_app, new_member_card: { ...widgetData.storefront_app.new_member_card, new_member_image: null } } })}>
                                                Delete
                                            </Button>
                                        )}
                                        <Button onFocus={() => setIsEnabled(true)} icon={UploadIcon} onClick={() => document.getElementById('new-member-card-image-input').click()}>
                                            Upload image
                                        </Button>
                                    </Box>
                                </BlockStack>

                                <span style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                                    <Text>Image or logo position</Text>
                                </span>
                                <Box style={{ display: 'flex', flexDirection: 'column' }}>
                                    <RadioButton
                                        label="Full-width"
                                        id="image-position-full-width"
                                        name="imagePositionType"
                                        checked={imagePosition === 'full-width'}
                                        onChange={() => setWidgetData({ ...widgetData, storefront_app: { ...widgetData.storefront_app, new_member_card: { ...widgetData.storefront_app.new_member_card, image_position: 'full-width' } } })}
                                        onFocus={() => setIsEnabled(true)}
                                    />
                                    <RadioButton
                                        label="Centered"
                                        id="image-position-centered"
                                        name="imagePositionType"
                                        checked={imagePosition === 'centered'}
                                        onChange={() => setWidgetData({ ...widgetData, storefront_app: { ...widgetData.storefront_app, new_member_card: { ...widgetData.storefront_app.new_member_card, image_position: 'centered' } } })}
                                        onFocus={() => setIsEnabled(true)}
                                    />
                                </Box>

                                <Box style={{ margin: '10px 0px 10px' }}>
                                    <Divider />
                                </Box>

                                <Text variant="bodyLg" fontWeight='semibold'>Translations</Text>
                                <Box style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <TextField
                                        label="Member card title"
                                        value={newMemberCardTitle}
                                        onChange={(value) => handleFieldChange('storefront.new_member_card.title', value, (v) => setWidgetData({ ...widgetData, storefront_app: { ...widgetData.storefront_app, new_member_card: { ...widgetData.storefront_app.new_member_card, translations: { ...widgetData.storefront_app.new_member_card.translations, title: v } } } }))}
                                        error={getErrorMessage('storefront.new_member_card.title') ? true : null}
                                        onFocus={() => setIsEnabled(true)}
                                    />
                                    <TextField
                                        label="Button text"
                                        value={newMemberCardButtonText}
                                        onChange={(value) => handleFieldChange('storefront.new_member_card.button_text', value, (v) => setWidgetData({ ...widgetData, storefront_app: { ...widgetData.storefront_app, new_member_card: { ...widgetData.storefront_app.new_member_card, translations: { ...widgetData.storefront_app.new_member_card.translations, button_text: v } } } }))}
                                        error={getErrorMessage('storefront.new_member_card.button_text') ? true : null}
                                        onFocus={() => setIsEnabled(true)}
                                    />
                                    <TextField
                                        label="Sign-in message"
                                        value={newMemberCardSignInMessage}
                                        onChange={(value) => handleFieldChange('storefront.new_member_card.signin_msg', value, (v) => setWidgetData({ ...widgetData, storefront_app: { ...widgetData.storefront_app, new_member_card: { ...widgetData.storefront_app.new_member_card, translations: { ...widgetData.storefront_app.new_member_card.translations, signin_msg: v } } } }))}
                                        error={getErrorMessage('storefront.new_member_card.signin_msg') ? true : null}
                                        onFocus={() => setIsEnabled(true)}
                                    />
                                    <TextField
                                        label="Sign-in link text"
                                        value={newMemberCardSignInLinkText}
                                        onChange={(value) => handleFieldChange('storefront.new_member_card.signin_text', value, (v) => setWidgetData({ ...widgetData, storefront_app: { ...widgetData.storefront_app, new_member_card: { ...widgetData.storefront_app.new_member_card, translations: { ...widgetData.storefront_app.new_member_card.translations, signin_text: v } } } }))}
                                        error={getErrorMessage('storefront.new_member_card.signin_text') ? true : null}
                                        onFocus={() => setIsEnabled(true)}
                                    />

                                </Box>

                            </BlockStack>

                        </Collapsible>

                        <div className="accordian-title" style={{ backgroundColor: '#f0f0f0', padding: '5px 10px', borderRadius: '5px', marginTop: '5px' }}>
                            <Button
                                variant="monochromePlain"
                                disclosure={openCollapsible === 'pointsCard' ? 'up' : 'down'}
                                onClick={() => handleToggle('pointsCard')}
                                aria-expanded={openCollapsible === 'pointsCard'}
                                aria-controls="pointsCard-collapsible"
                                fullWidth
                                textAlign="left"
                            >
                                <Text as="h1" variant="headingMd">Points card</Text>
                            </Button>
                        </div>
                        <Collapsible
                            open={openCollapsible === 'pointsCard'}
                            id="pointsCard-collapsible"
                            transition={{ duration: '500ms', timingFunction: 'ease-in-out' }}
                            expandOnPrint
                        >

                            <BlockStack gap="300" style={{ display: 'flex', flexDirection: 'column', padding: '10px', gap: '10px' }}>
                                <Box style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <TextField
                                        label="Points card title"
                                        value={pointsCardTitle}
                                        onChange={(value) => handleFieldChange('storefront.points_card.title', value, (v) => setWidgetData({ ...widgetData, storefront_app: { ...widgetData.storefront_app, points_card: { ...widgetData.storefront_app.points_card, title: v } } }))}
                                        error={getErrorMessage('storefront.points_card.title') ? true : null}
                                        onFocus={() => setIsEnabled(true)}
                                    />
                                    <TextField
                                        label="Points card message"
                                        value={pointsCardMessage}
                                        multiline={2}
                                        onChange={(value) => handleFieldChange('storefront.points_card.message', value, (v) => setWidgetData({ ...widgetData, storefront_app: { ...widgetData.storefront_app, points_card: { ...widgetData.storefront_app.points_card, message: v } } }))}
                                        error={getErrorMessage('storefront.points_card.message') ? true : null}
                                        onFocus={() => setIsEnabled(true)}
                                    />
                                    <TextField
                                        label="Ways to earn text"
                                        value={pointsCardWaysToEarnText}
                                        onChange={(value) => handleFieldChange('storefront.points_card.ways_to_earn_text', value, (v) => setWidgetData({ ...widgetData, storefront_app: { ...widgetData.storefront_app, points_card: { ...widgetData.storefront_app.points_card, ways_to_earn_text: v } } }))}
                                        error={getErrorMessage('storefront.points_card.ways_to_earn_text') ? true : null}
                                        onFocus={() => setIsEnabled(true)}
                                    />
                                    <TextField
                                        label="Ways to redeem text"
                                        value={pointsCardWaysToRedeemText}
                                        onChange={(value) => handleFieldChange('storefront.points_card.ways_to_redeem_text', value, (v) => setWidgetData({ ...widgetData, storefront_app: { ...widgetData.storefront_app, points_card: { ...widgetData.storefront_app.points_card, ways_to_redeem_text: v } } }))}
                                        error={getErrorMessage('storefront.points_card.ways_to_redeem_text') ? true : null}
                                        onFocus={() => setIsEnabled(true)}
                                    />
                                    <TextField
                                        label="My rewards"
                                        value={pointsCardMyRewardsText}
                                        onChange={(value) => handleFieldChange('storefront.points_card.my_rewards', value, (v) => setWidgetData({ ...widgetData, storefront_app: { ...widgetData.storefront_app, points_card: { ...widgetData.storefront_app.points_card, my_rewards: v } } }))}
                                        error={getErrorMessage('storefront.points_card.my_rewards') ? true : null}
                                        onFocus={() => setIsEnabled(false)}
                                    />
                                </Box>
                            </BlockStack>

                        </Collapsible>

                        <div className="accordian-title" style={{ backgroundColor: '#f0f0f0', padding: '5px 10px', borderRadius: '5px', marginTop: '5px' }}>
                            <Button
                                variant="monochromePlain"
                                disclosure={openCollapsible === 'referralCard' ? 'up' : 'down'}
                                onClick={() => handleToggle('referralCard')}
                                aria-expanded={openCollapsible === 'referralCard'}
                                aria-controls="referralCard-collapsible"
                                fullWidth
                                textAlign="left"
                            >
                                <Text as="h1" variant="headingMd">Referral card</Text>
                            </Button>
                        </div>
                        <Collapsible
                            open={openCollapsible === 'referralCard'}
                            id="referralCard-collapsible"
                            transition={{ duration: '500ms', timingFunction: 'ease-in-out' }}
                            expandOnPrint
                        >

                            <BlockStack gap="300" style={{ display: 'flex', flexDirection: 'column', padding: '10px', gap: '10px' }}>
                                <Box style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <TextField
                                        label="Referral card title"
                                        value={referralCardTitle}
                                        onChange={(value) => handleFieldChange('storefront.referrals_card.title', value, (v) => setWidgetData({ ...widgetData, storefront_app: { ...widgetData.storefront_app, referrals_card: { ...widgetData.storefront_app.referrals_card, title: v } } }))}
                                        error={getErrorMessage('storefront.referrals_card.title') ? true : null}
                                    />
                                    <TextField
                                        label="Refferal card message"
                                        value={referralCardMessage}
                                        multiline={2}
                                        onChange={(value) => handleFieldChange('storefront.referrals_card.message', value, (v) => setWidgetData({ ...widgetData, storefront_app: { ...widgetData.storefront_app, referrals_card: { ...widgetData.storefront_app.referrals_card, message: v } } }))}
                                        error={getErrorMessage('storefront.referrals_card.message') ? true : null}
                                    />
                                    <TextField
                                        label="My discount text"
                                        value={referralCardMyDiscountText}
                                        onChange={(value) => handleFieldChange('storefront.referrals_card.my_discount_text', value, (v) => setWidgetData({ ...widgetData, storefront_app: { ...widgetData.storefront_app, referrals_card: { ...widgetData.storefront_app.referrals_card, my_discount_text: v } } }))}
                                        error={getErrorMessage('storefront.referrals_card.my_discount_text') ? true : null}
                                        onFocus={() => setIsEnabled(false)}
                                    />
                                </Box>
                            </BlockStack>
                        </Collapsible>

                        <div className="accordian-title" style={{ backgroundColor: '#f0f0f0', padding: '5px 10px', borderRadius: '5px', marginTop: '5px' }}>
                            <Button
                                variant="monochromePlain"
                                disclosure={openCollapsible === 'vipTier' ? 'up' : 'down'}
                                onClick={() => handleToggle('vipTier')}
                                aria-expanded={openCollapsible === 'vipTier'}
                                aria-controls="vipTier-collapsible"
                                fullWidth
                                textAlign="left"
                            >
                                <Text as="h1" variant="headingMd">VIP tiers card</Text>
                            </Button>
                        </div>
                        <Collapsible
                            open={openCollapsible === 'vipTier'}
                            id="vipTier-collapsible"
                            transition={{ duration: '500ms', timingFunction: 'ease-in-out' }}
                            expandOnPrint
                        >

                            <BlockStack gap="300" style={{ display: 'flex', flexDirection: 'column', padding: '10px', gap: '10px' }}>
                                <Box style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <TextField
                                        label="VIP tiers title"
                                        value={vipTierCardTitle}
                                        onChange={(value) => handleFieldChange('storefront.vip_tiers_card.title', value, (v) => setWidgetData({ ...widgetData, storefront_app: { ...widgetData.storefront_app, vip_tiers_card: { ...widgetData.storefront_app.vip_tiers_card, title: v } } }))}
                                        error={getErrorMessage('storefront.vip_tiers_card.title') ? true : null}
                                        onFocus={() => setIsEnabled(true)}
                                    />
                                    <TextField
                                        label="VIP tiers message"
                                        value={vipTierCardMessage}
                                        multiline={2}
                                        onChange={(value) => handleFieldChange('storefront.vip_tiers_card.message', value, (v) => setWidgetData({ ...widgetData, storefront_app: { ...widgetData.storefront_app, vip_tiers_card: { ...widgetData.storefront_app.vip_tiers_card, message: v } } }))}
                                        error={getErrorMessage('storefront.vip_tiers_card.message') ? true : null}
                                        onFocus={() => setIsEnabled(true)}
                                    />
                                </Box>

                                <span style={{ marginTop: '10px' }}>
                                    <Divider />
                                </span>

                                <Text variant='bodyMd' fontWeight='semibold'>Customer tier</Text>
                                <Box style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <TextField
                                        label="Current tier"
                                        value={vipTierCardCurrentTier}
                                        onChange={(value) => handleFieldChange('storefront.vip_tiers_card.current_tier', value, (v) => setWidgetData({ ...widgetData, storefront_app: { ...widgetData.storefront_app, vip_tiers_card: { ...widgetData.storefront_app.vip_tiers_card, customer_tier: { ...widgetData.storefront_app.vip_tiers_card.customer_tier, current_tier: v } } } }))}
                                        error={getErrorMessage('storefront.vip_tiers_card.current_tier') ? true : null}
                                        onFocus={() => setIsEnabled(false)}
                                    />
                                    <TextField
                                        label="Next tier"
                                        value={vipTierCardNextTier}
                                        onChange={(value) => handleFieldChange('storefront.vip_tiers_card.next_tier', value, (v) => setWidgetData({ ...widgetData, storefront_app: { ...widgetData.storefront_app, vip_tiers_card: { ...widgetData.storefront_app.vip_tiers_card, customer_tier: { ...widgetData.storefront_app.vip_tiers_card.customer_tier, next_tier: v } } } }))}
                                        error={getErrorMessage('storefront.vip_tiers_card.next_tier') ? true : null}
                                        onFocus={() => setIsEnabled(false)}
                                    />
                                    <TextField
                                        label="Max tier reached"
                                        value={vipTierCardMaxTierReached}
                                        onChange={(value) => handleFieldChange('storefront.vip_tiers_card.max_tier', value, (v) => setWidgetData({ ...widgetData, storefront_app: { ...widgetData.storefront_app, vip_tiers_card: { ...widgetData.storefront_app.vip_tiers_card, customer_tier: { ...widgetData.storefront_app.vip_tiers_card.customer_tier, max_tier: v } } } }))}
                                        error={getErrorMessage('storefront.vip_tiers_card.max_tier') ? true : null}
                                        onFocus={() => setIsEnabled(false)}
                                    />
                                </Box>

                                <span style={{ marginTop: '10px' }}>
                                    <Divider />
                                </span>

                                <Text variant='bodyMd' fontWeight='semibold'>All tier</Text>
                                <Box style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <TextField
                                        label="All tier"
                                        value={vipTierCardAllTier}
                                        onChange={(value) => handleFieldChange('storefront.vip_tiers_card.all_tiers', value, (v) => setWidgetData({ ...widgetData, storefront_app: { ...widgetData.storefront_app, vip_tiers_card: { ...widgetData.storefront_app.vip_tiers_card, all_tiers: { ...widgetData.storefront_app.vip_tiers_card.all_tiers, title: v } } } }))}
                                        error={getErrorMessage('storefront.vip_tiers_card.all_tiers') ? true : null}
                                        onFocus={() => setIsEnabled(false)}
                                    />
                                </Box>
                            </BlockStack>

                        </Collapsible>
                    </Grid.Cell>

                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 8, xl: 8 }}>
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

                                                        <span style={{ color: textColor }}>
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
                                                                transition: 'background 0.2s'
                                                            }}
                                                            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                                                        >
                                                            <BoldStarIcon color={iconColor} width='22' height='22' />
                                                            <text style={{ flex: 1, fontWeight: 500, fontSize: '14px', color: textColor }}>{pointsCardWaysToEarnText}</text>
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
                                                                transition: 'background 0.2s'
                                                            }}
                                                            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                                                        >
                                                            <BoldGiftIcon color={iconColor} width='22' height='22' />
                                                            <span style={{ flex: 1, fontWeight: 500, fontSize: '14px', color: textColor }}>{pointsCardWaysToRedeemText}</span>
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
                                                        <h3 style={{ fontSize: '16px', fontWeight: 500, color: headingColor, margin: '0 0 8px 0' }}>
                                                            {referralCardTitle}
                                                        </h3>
                                                        <p style={{ fontSize: '13px', color: textColor, margin: 0, wordBreak: 'break-word' }}>
                                                            {referralCardMessage}
                                                        </p>
                                                    </div>

                                                    <Box style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
                                                        {/* You get */}
                                                        <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center', backgroundColor: boxBackgroundColor, border: `1px solid ${boxBorderColor}`, padding: '10px', borderRadius: '10px' }}
                                                            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                                                        >
                                                            <BoldTruckIcon color={iconColor} width='22' height='22' />
                                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                <span style={{ fontSize: '14px', fontWeight: 500, color: headingColor }}>You get</span>
                                                                <text style={{ fontSize: '13px', color: textColor }}>Earn Points S1</text>
                                                            </div>
                                                        </div>

                                                        {/* Your friend gets */}
                                                        <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center', backgroundColor: boxBackgroundColor, border: `1px solid ${boxBorderColor}`, padding: '10px', borderRadius: '10px' }}
                                                            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                                                        >
                                                            <BoldDiscountIcon color={iconColor} width='22' height='22' />
                                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                <span style={{ fontSize: '14px', fontWeight: 500, color: headingColor }}>Your friend gets</span>
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
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: boxBackgroundColor, border: `1px solid ${boxBorderColor}`, padding: '10px', borderRadius: '10px', cursor: 'pointer' }}
                                                            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                                                        >
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                <BoldStarIcon color={iconColor} height='22' width='22' />
                                                                <span style={{ color: textColor }}>
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

                                                        {/* upcoming rewards card */}
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
                                                                    <BoldFillStarIcon color={iconColor} height='22' width='22' />
                                                                    <text style={{ textAlign: "center", fontSize: '14px', fontWeight: '500', color: textColor, }}>{vipTierCardAllTier}</text>
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
                                                                transition: 'background 0.2s'
                                                            }}
                                                            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                                                        >
                                                            <BoldTrophyIcon color={iconColor} height='22' width='22' />
                                                            <text style={{ flex: 1, fontWeight: 500, fontSize: '14px', color: textColor }}>{pointsCardMyRewardsText}</text>
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
                                                                transition: 'background 0.2s'
                                                            }}
                                                            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                                                        >
                                                            <BoldStarIcon color={iconColor} height='22' width='22' />
                                                            <text style={{ flex: 1, fontWeight: 500, fontSize: '14px', color: textColor }}>{pointsCardWaysToEarnText}</text>
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
                                                                transition: 'background 0.2s'
                                                            }}
                                                            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                                                        >
                                                            <BoldGiftIcon color={iconColor} height='22' width='22' />
                                                            <text style={{ flex: 1, fontWeight: 500, fontSize: '14px', color: textColor }}>{pointsCardWaysToRedeemText}</text>
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
                                                        <h3 style={{ fontSize: '16px', fontWeight: 500, color: headingColor, margin: '0 0 8px 0' }}>
                                                            {referralCardTitle}
                                                        </h3>
                                                        <p style={{ fontSize: '13px', color: textColor, margin: 0, wordBreak: 'break-word' }}>
                                                            {referralCardMessage}
                                                        </p>
                                                    </div>

                                                    <Box style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
                                                        {/* You get */}
                                                        <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center', backgroundColor: boxBackgroundColor, border: `1px solid ${boxBorderColor}`, padding: '10px', borderRadius: '10px' }}
                                                            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                                                        >
                                                            <BoldTruckIcon color={iconColor} height='22' width='22' />
                                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                <span style={{ fontSize: '14px', fontWeight: 500, color: headingColor }}>You get</span>
                                                                <text style={{ fontSize: '13px', color: textColor }}>Earn Points S1</text>
                                                            </div>
                                                        </div>

                                                        {/* Your friend gets */}
                                                        <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center', backgroundColor: boxBackgroundColor, border: `1px solid ${boxBorderColor}`, padding: '10px', borderRadius: '10px' }}
                                                            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                                                        >
                                                            <BoldDiscountIcon color={iconColor} height='22' width='22' />
                                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                <span style={{ fontSize: '14px', fontWeight: 500, color: headingColor }}>Your friend gets</span>
                                                                <text style={{ fontSize: '13px', color: textColor }}>test 2</text>
                                                            </div>
                                                        </div>
                                                    </Box>

                                                    {/* Your link */}
                                                    <div style={{ marginBottom: '16px' }}>
                                                        <div style={{ textAlign: 'center', fontSize: '13px', color: headingColor, marginBottom: '8px' }}>
                                                            Your link
                                                        </div>

                                                        {/* CONTAINER: padding removed, overflow hidden added */}
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'stretch',
                                                            border: `1px solid ${inputFieldColor}`,
                                                            borderRadius: inputBorderRadius,
                                                            backgroundColor: boxBackgroundColor,
                                                            overflow: 'hidden'
                                                        }}>
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
                                                                <text style={{ textWrap: 'nowrap' }}> # https://kg-store-demo.myshopify.com?</text>
                                                            </span>

                                                            {/* BUTTON: border-left added, padding adjusted */}
                                                            <button style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                borderLeft: `1px solid ${inputFieldColor}`,
                                                                cursor: 'pointer',
                                                                padding: '0 10px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                margin: 0,
                                                                borderRadius: 0
                                                            }}>
                                                                <BoldCopyIcon color={iconColor} height='20' width='20' />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {/* My Discounts card */}
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
                                                            transition: 'background 0.2s'
                                                        }}
                                                        onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                                                    >
                                                        <BoldRewardsIcon color={iconColor} height='22' width='22' />
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
        </Card >
    )
}

export default StoreFront

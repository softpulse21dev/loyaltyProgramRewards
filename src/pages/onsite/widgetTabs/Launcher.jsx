import { BlockStack, Box, Button, Card, Divider, Grid, Icon, RadioButton, RangeSlider, Text, TextField } from '@shopify/polaris'
import { PlusIcon } from '@shopify/polaris-icons';
import React, { useRef, useEffect } from 'react'
import '../../../widget.css';
import ColorPickerInput from '../../../components/ColorPickerInput';
import { AsterikIcon, BadgeIcon, CrownIcon, DollarIcon, FlowerIcon, GemIcon, GiftIcon, HeartIcon, HoldingHeartIcon, KiteIcon, OctogramIcon, StarIcon, TulipFlowerIcon } from '../../../assets/svg/svg';

const iconList = [
    { id: 1, name: 'Asterik', icon: <AsterikIcon /> },
    { id: 2, name: 'Badge', icon: <BadgeIcon /> },
    { id: 3, name: 'Crown', icon: <CrownIcon /> },
    { id: 4, name: 'Dollar', icon: <DollarIcon /> },
    { id: 5, name: 'Holding Heart', icon: <HoldingHeartIcon /> },
    { id: 6, name: 'Flower', icon: <FlowerIcon /> },
    { id: 7, name: 'Tulip Flower', icon: <TulipFlowerIcon /> },
    { id: 8, name: 'Gift', icon: <GiftIcon /> },
    { id: 9, name: 'Gem', icon: <GemIcon /> },
    { id: 10, name: 'Heart', icon: <HeartIcon /> },
    { id: 11, name: 'Kite', icon: <KiteIcon /> },
    { id: 12, name: 'Star', icon: <StarIcon /> },
    { id: 13, name: 'Octogram', icon: <OctogramIcon /> }
];

const Launcher = ({ widgetData, setWidgetData, errors = {}, clearError }) => {
    const launcherData = widgetData.launcher;
    const position = launcherData.layout.position;
    const iconId = launcherData.layout.icon;
    const title = launcherData.layout.title;

    // Get the selected icon object from iconList based on the ID in widgetData
    const selectedIcon = iconList.find(item => item.id === iconId) || iconList[0];

    // Helper function to get error message
    const getErrorMessage = (fieldPath) => {
        return errors[fieldPath] || '';
    };

    // Helper function to handle field change and clear error
    const handleFieldChange = (fieldPath, value, updateFn) => {
        updateFn(value);
        if (clearError) {
            clearError(fieldPath);
        }
    };

    const textColor = launcherData.appearance.text_color;
    const backgroundType = launcherData.appearance.background_type;
    const solidColor = launcherData.appearance.solid;
    const gradientColor1 = launcherData.appearance.gradient.color1;
    const gradientColor2 = launcherData.appearance.gradient.color2;
    const borderRadius = launcherData.appearance.border_radius;
    const sideSpacing = launcherData.appearance.side_spacing;
    const bottomSpacing = launcherData.appearance.bottom_spacing;
    const visibleOn = launcherData.accessibility.visible_on;

    const previewContainerRef = useRef(null);

    useEffect(() => {
        console.log('Selected icon:', selectedIcon);
    }, [selectedIcon]);

    // Scroll based on position type
    useEffect(() => {
        if (previewContainerRef.current) {
            // For bottom labels - scroll to bottom to show content at bottom
            if (position === 'bottom_left' || position === 'bottom_right') {
                previewContainerRef.current.scrollTo({
                    top: previewContainerRef.current.scrollHeight,
                    behavior: 'smooth'
                });
            }
            // For bubble and side labels - scroll to top (they're sticky)
            else {
                previewContainerRef.current.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        }
    }, [position]);

    // Get background style based on type
    const getBackgroundStyle = () => {
        if (backgroundType === 'gradient') {
            return `linear-gradient(135deg, ${gradientColor1} 0%, ${gradientColor2} 100%)`;
        }
        return solidColor;
    };


    // Helper to render icon with selected color
    const renderIcon = () => {
        if (selectedIcon && selectedIcon.icon) {
            return React.cloneElement(selectedIcon.icon, { color: textColor });
        }
        // Default icon if none selected, using Shopify Icon component for consistency or just the SVG
        return <Icon source={PlusIcon} tone="inherit" color={textColor} />;
    };

    return (
        <Card>
            <Grid columns={{ xs: 6, sm: 6, md: 6, lg: 12, xl: 12 }}>
                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 2, lg: 4, xl: 4 }}>
                    <Box style={{ marginBottom: '15px' }}>
                        <Text as="h1" variant="headingMd" >Layout</Text>
                    </Box>
                    <BlockStack gap="500">

                        {/* Radio Button positons*/}
                        <Box style={{ display: 'flex', flexDirection: 'column', }}>
                            <span style={{ marginBottom: '5px' }}>
                                <Text as="p" variant="bodyMd">Position</Text>
                            </span>
                            <RadioButton
                                label="Bubble left"
                                checked={position === 'bubble_left'}
                                onChange={() => setWidgetData({ ...widgetData, launcher: { ...launcherData, layout: { ...launcherData.layout, position: 'bubble_left' } } })}
                            />
                            <RadioButton
                                label="Bubble right"
                                checked={position === 'bubble_right'}
                                onChange={() => setWidgetData({ ...widgetData, launcher: { ...launcherData, layout: { ...launcherData.layout, position: 'bubble_right' } } })}
                            />
                            <RadioButton
                                label="Label bottom left"
                                checked={position === 'bottom_left'}
                                onChange={() => setWidgetData({ ...widgetData, launcher: { ...launcherData, layout: { ...launcherData.layout, position: 'bottom_left' } } })}
                            />
                            <RadioButton
                                label="Label bottom right"
                                checked={position === 'bottom_right'}
                                onChange={() => setWidgetData({ ...widgetData, launcher: { ...launcherData, layout: { ...launcherData.layout, position: 'bottom_right' } } })}
                            />
                            <RadioButton
                                label="Label left"
                                checked={position === 'label_left'}
                                onChange={() => setWidgetData({ ...widgetData, launcher: { ...launcherData, layout: { ...launcherData.layout, position: 'label_left' } } })}
                            />
                            <RadioButton
                                label="Label right"
                                checked={position === 'label_right'}
                                onChange={() => setWidgetData({ ...widgetData, launcher: { ...launcherData, layout: { ...launcherData.layout, position: 'label_right' } } })}
                            />
                        </Box>

                        {/* Icons Section */}
                        <Box>
                            <Box style={{ marginBottom: '10px' }}>
                                <Text as="p" variant="bodyMd">Icons</Text>
                            </Box>
                            <Box style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                                {iconList.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setWidgetData({ ...widgetData, launcher: { ...launcherData, layout: { ...launcherData.layout, icon: item.id } } })}
                                        className='icon-button'
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '6px',
                                            border: iconId === item.id ? '2px solid #2563eb' : '1px solid #e5e7eb',
                                            background: 'white',
                                            cursor: 'pointer',
                                            color: '#374151',
                                        }}
                                    >
                                        {item.icon}
                                    </button>
                                ))}
                            </Box>
                        </Box>

                        {/* Title Section */}
                        <TextField
                            label="Title"
                            value={title}
                            onChange={(value) => handleFieldChange('launcher.layout.title', value, (v) => setWidgetData({ ...widgetData, launcher: { ...launcherData, layout: { ...launcherData.layout, title: v } } }))}
                            error={getErrorMessage('launcher.layout.title') ? true : null}
                        />

                        <Divider />

                        <Text variant="bodyLg" fontWeight='bold'>Appearance</Text>

                        <ColorPickerInput
                            label="Text color"
                            value={textColor}
                            onChange={(value) => setWidgetData({ ...widgetData, launcher: { ...launcherData, appearance: { ...launcherData.appearance, text_color: value } } })}
                            error={getErrorMessage('launcher.appearance.text_color')}
                            onClearError={() => clearError && clearError('launcher.appearance.text_color')}
                        />

                        {/* Background color section */}
                        <Box style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <Text as="p" variant="bodyMd">Background color</Text>
                            <Box style={{ display: 'flex', flexDirection: 'column', }}>
                                <RadioButton
                                    label="Solid color"
                                    checked={backgroundType === 'solid'}
                                    onChange={() => setWidgetData({ ...widgetData, launcher: { ...launcherData, appearance: { ...launcherData.appearance, background_type: 'solid' } } })}
                                />
                                {backgroundType === 'solid' && (
                                    <div style={{ marginLeft: '25px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <ColorPickerInput
                                            value={solidColor}
                                            onChange={(value) => setWidgetData({ ...widgetData, launcher: { ...launcherData, appearance: { ...launcherData.appearance, solid: value } } })}
                                            error={getErrorMessage('launcher.appearance.solid')}
                                            onClearError={() => clearError && clearError('launcher.appearance.solid')}
                                        />
                                    </div>
                                )}
                                <RadioButton
                                    label="Gradient color"
                                    checked={backgroundType === 'gradient'}
                                    onChange={() => setWidgetData({ ...widgetData, launcher: { ...launcherData, appearance: { ...launcherData.appearance, background_type: 'gradient' } } })}
                                />
                                {backgroundType === 'gradient' && (
                                    <div style={{ marginLeft: '25px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <ColorPickerInput
                                            value={gradientColor1}
                                            onChange={(value) => setWidgetData({ ...widgetData, launcher: { ...launcherData, appearance: { ...launcherData.appearance, gradient: { ...launcherData.appearance.gradient, color1: value } } } })}
                                            error={getErrorMessage('launcher.appearance.gradient.color1')}
                                            onClearError={() => clearError('launcher.appearance.gradient.color1')}
                                        />
                                        <ColorPickerInput
                                            value={gradientColor2}
                                            onChange={(value) => setWidgetData({ ...widgetData, launcher: { ...launcherData, appearance: { ...launcherData.appearance, gradient: { ...launcherData.appearance.gradient, color2: value } } } })}
                                            error={getErrorMessage('launcher.appearance.gradient.color2')}
                                            onClearError={() => clearError('launcher.appearance.gradient.color2')}
                                        />
                                    </div>
                                )}
                            </Box>
                        </Box>

                        {/* Range Slider */}
                        <Box style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <RangeSlider
                                label="Border radius"
                                max={32}
                                min={0}
                                value={borderRadius}
                                onChange={(value) => setWidgetData({ ...widgetData, launcher: { ...launcherData, appearance: { ...launcherData.appearance, border_radius: value } } })}
                                suffix={<Box style={{ textAlign: 'right', width: '24px' }}>{borderRadius}px</Box>}
                            />
                            <RangeSlider
                                label="Side spacing"
                                max={32}
                                min={0}
                                value={sideSpacing}
                                onChange={(value) => setWidgetData({ ...widgetData, launcher: { ...launcherData, appearance: { ...launcherData.appearance, side_spacing: value } } })}
                                suffix={<Box style={{ textAlign: 'right', width: '24px' }}>{sideSpacing}px</Box>}
                            />
                            <RangeSlider
                                label="Bottom spacing"
                                max={32}
                                min={0}
                                value={bottomSpacing}
                                onChange={(value) => setWidgetData({ ...widgetData, launcher: { ...launcherData, appearance: { ...launcherData.appearance, bottom_spacing: value } } })}
                                suffix={<Box style={{ textAlign: 'right', width: '24px' }}>{bottomSpacing}px</Box>}
                            />
                        </Box>

                        <Divider />

                        {/* Accessibility */}
                        <Text variant="bodyLg" fontWeight='bold'>Accessibility</Text>
                        <Box>
                            <Text as="p" variant="bodyMd">Visible on </Text>
                            <Box style={{ display: 'flex', flexDirection: 'column' }}>
                                <RadioButton
                                    label="All devices"
                                    checked={visibleOn === 'all'}
                                    onChange={() => setWidgetData({ ...widgetData, launcher: { ...launcherData, accessibility: { ...launcherData.accessibility, visible_on: 'all' } } })}
                                />
                                <RadioButton
                                    label="Desktop devices only"
                                    checked={visibleOn === 'desktop'}
                                    onChange={() => setWidgetData({ ...widgetData, launcher: { ...launcherData, accessibility: { ...launcherData.accessibility, visible_on: 'desktop' } } })}
                                />
                                <RadioButton
                                    label="Mobile devices only"
                                    checked={visibleOn === 'mobile'}
                                    onChange={() => setWidgetData({ ...widgetData, launcher: { ...launcherData, accessibility: { ...launcherData.accessibility, visible_on: 'mobile' } } })}
                                />
                                <RadioButton
                                    label="Hidden"
                                    checked={visibleOn === 'hidden'}
                                    onChange={() => setWidgetData({ ...widgetData, launcher: { ...launcherData, accessibility: { ...launcherData.accessibility, visible_on: 'hidden' } } })}
                                />
                            </Box>
                        </Box>

                    </BlockStack>
                </Grid.Cell>


                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 8, xl: 8 }}>

                    <div style={{ position: 'sticky', top: '20px' }}>

                        {/* --- PREVIEW CONTAINER WRAPPER --- */}
                        <div
                            style={{
                                background: 'linear-gradient(rgb(173, 233, 202), rgb(229, 233, 197))',
                                border: '1px solid #e0e0e0',
                                height: '500px',
                                width: '100%',
                                borderRadius: '16px',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {/* --- FIXED/STICKY ELEMENTS (Overlay on top of scroll content) --- */}

                            {/* Side label LEFT */}
                            {position === 'label_left' && (
                                <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '0',
                                    transform: 'translateY(-50%)',
                                    zIndex: 20
                                }}>
                                    <button
                                        style={{
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                            background: getBackgroundStyle(),
                                            color: textColor,
                                            padding: '16px 10px',
                                            borderRadius: `0 ${borderRadius}px ${borderRadius}px 0`,
                                            border: 'none',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            writingMode: 'vertical-rl',
                                            textOrientation: 'mixed',
                                            transform: 'rotate(360deg)'
                                        }}
                                    >
                                        {renderIcon()}
                                        {title}
                                    </button>
                                </div>
                            )}

                            {/* Side label RIGHT */}
                            {position === 'label_right' && (
                                <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    right: '0',
                                    transform: 'translateY(-50%)',
                                    zIndex: 11
                                }}>
                                    <button
                                        style={{
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                            background: getBackgroundStyle(),
                                            color: textColor,
                                            padding: '16px 10px',
                                            borderRadius: `${borderRadius}px 0 0 ${borderRadius}px`,
                                            border: 'none',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            writingMode: 'vertical-lr',
                                            textOrientation: 'mixed'
                                        }}
                                    >
                                        {renderIcon()}
                                        {title}
                                    </button>
                                </div>
                            )}

                            {/* Bubble type - Fixed at bottom corners */}
                            {(position === 'bubble_left' || position === 'bubble_right') && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: `${bottomSpacing}px`,
                                    left: position === 'bubble_left' ? `${sideSpacing}px` : 'auto',
                                    right: position === 'bubble_right' ? `${sideSpacing}px` : 'auto',
                                    zIndex: 20
                                }}>
                                    <button
                                        style={{
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            background: getBackgroundStyle(),
                                            color: textColor,
                                            padding: '12px 16px',
                                            borderRadius: `${borderRadius}px`,
                                            border: 'none',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                            fontSize: '14px',
                                            fontWeight: '500'
                                        }}
                                    >
                                        {renderIcon()}
                                        {title}
                                    </button>
                                </div>
                            )}

                            {/* --- SCROLLABLE CONTENT --- */}
                            <div
                                ref={previewContainerRef}
                                style={{
                                    height: '100%',
                                    width: '100%',
                                    position: 'relative', // Acts as the anchor frame
                                    overflow: 'hidden'    // Prevents double scrollbars
                                }}
                            >
                                {/* 1. SCROLLABLE CONTENT LAYER */}
                                <div style={{
                                    height: '100%',
                                    width: '100%',
                                    overflowY: 'auto',    // The scrolling happens ONLY here
                                    overflowX: 'hidden',
                                }}>
                                    <div style={{
                                        height: '800px', // Your long content
                                        width: '100%',
                                        position: 'relative'
                                    }}>
                                        {/* Your page content goes here */}
                                    </div>
                                </div>

                                {/* 2. FLOATING BUTTON LAYER (Sibling to scrollable content) */}
                                {(position === 'bottom_left' || position === 'bottom_right') && (
                                    <div style={{
                                        position: 'absolute',
                                        zIndex: 20, // Ensure it sits on top of the scrollable content
                                        bottom: '0', // Fixed to bottom edge
                                        left: position === 'bottom_left' ? `${sideSpacing}px` : 'auto',
                                        right: position === 'bottom_right' ? `${sideSpacing}px` : 'auto'
                                    }}>
                                        <button
                                            style={{
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                background: getBackgroundStyle(),
                                                color: textColor,
                                                padding: '12px 24px',
                                                // Flat on the bottom (0), rounded on Top-Left and Top-Right
                                                borderRadius: `${borderRadius}px ${borderRadius}px 0 0`,
                                                border: 'none',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                fontSize: '14px',
                                                fontWeight: '500'
                                            }}
                                        >
                                            {renderIcon()}
                                            {title}
                                        </button>
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Position indicator label */}
                        <div style={{
                            marginTop: '12px',
                            textAlign: 'center',
                            padding: '8px',
                            background: '#f6f6f7',
                            borderRadius: '8px'
                        }}>
                            <Text variant="bodySm" tone="subdued">
                                Position: {position.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Text>
                        </div>
                    </div>
                </Grid.Cell>
            </Grid>
        </Card >
    )
}

export default Launcher

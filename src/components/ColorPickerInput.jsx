import { Box, ColorPicker, hsbToHex, InlineError, Popover, Text, TextField } from '@shopify/polaris';
import React, { useCallback, useState } from 'react'
import { hexToHsb } from '../utils';

const ColorPickerInput = ({ label, value, onChange, error, onClearError, hideErrorMessage = false, onFocus }) => {
    const [isActive, setIsActive] = useState(false);
    const [hsbColor, setHsbColor] = useState(() => hexToHsb(value || '#ffffff'));

    const togglePopover = useCallback(() => {
        setIsActive((active) => !active);
        if (onFocus && !isActive) {
            onFocus();
        }
    }, [onFocus, isActive]);

    const handleColorPickerChange = useCallback((color) => {
        setHsbColor(color);
        onChange(hsbToHex(color));
        if (onClearError) {
            onClearError();
        }
    }, [onChange, onClearError]);

    const handleTextChange = useCallback((newValue) => {
        // Always keep the # prefix - don't allow removing it
        // If user tries to clear, reset to just #
        if (newValue === '' || newValue === '#') {
            onChange('#');
            if (onClearError) {
                onClearError();
            }
            return;
        }
        
        // Only allow valid hex pattern starting with #
        if (newValue.match(/^#[0-9A-Fa-f]{0,6}$/)) {
            onChange(newValue);
            if (newValue.length === 7) {
                setHsbColor(hexToHsb(newValue));
            }
            if (onClearError) {
                onClearError();
            }
        }
    }, [onChange, onClearError]);

    return (
        <Box style={{ display: 'flex', flexDirection: 'column', gap: '8px'}}>
            {label && <Text variant="bodymd" >{label}</Text>}
            <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Popover
                    active={isActive}
                    activator={
                        <div
                            style={{
                                width: '32px',
                                height: '32px',
                                border: '1px solid #c4cdd5',
                                borderRadius: '6px',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                backgroundColor: value && value.length === 7 ? value : '#ffffff'
                            }}
                            onClick={togglePopover}
                        />
                    }
                    onClose={togglePopover}
                    preferredAlignment="left"
                >
                    <Box padding="300">
                        <ColorPicker
                            onChange={handleColorPickerChange}
                            color={hsbColor}
                        />
                    </Box>
                </Popover>
                <div style={{ flex: 1 }}>
                    <TextField
                        value={value}
                        onChange={handleTextChange}
                        onFocus={onFocus}
                        autoComplete="off"
                        maxLength={7}
                        error={error ? true : false}
                    />
                </div>
            </Box>
            {error && !hideErrorMessage && <InlineError message={error} fieldID="color-picker" />}
        </Box>
    );
};

export default ColorPickerInput

import { Box, ColorPicker, hsbToHex, Popover, Text, TextField } from '@shopify/polaris';
import React, { useCallback, useState } from 'react'
import { hexToHsb } from '../utils';

const ColorPickerInput = ({ label, value, onChange }) => {
    const [isActive, setIsActive] = useState(false);
    const [hsbColor, setHsbColor] = useState(() => hexToHsb(value || '#ffffff'));

    const togglePopover = useCallback(() => {
        setIsActive((active) => !active);
    }, []);

    const handleColorPickerChange = useCallback((color) => {
        setHsbColor(color);
        onChange(hsbToHex(color));
    }, [onChange]);

    const handleTextChange = useCallback((newValue) => {
        if (newValue.match(/^#[0-9A-Fa-f]{0,6}$/)) {
            onChange(newValue);
            if (newValue.length === 7) {
                setHsbColor(hexToHsb(newValue));
            }
        }
    }, [onChange]);

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
                                backgroundColor: value
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
                        autoComplete="off"
                        maxLength={7}
                    />
                </div>
            </Box>
        </Box>
    );
};

export default ColorPickerInput

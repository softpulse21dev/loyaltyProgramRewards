import { Box, Modal, Text, TextField } from '@shopify/polaris'
import React, { useState } from 'react'
import { fetchData } from '../action';

const ResetPointsModal = ({ active, setActive }) => {

    const [value, setValue] = useState('');
    const [loadingReset, setLoadingReset] = useState(false);


    const ResetPointsAPI = async () => {
        setLoadingReset(true);
        try {
            const formData = new FormData();
            formData.append("confirmation", value);
            const response = await fetchData("/reset-points", formData);
            console.log('Reset Settings Response', response);
            if (response.status && response.status === true) {
                shopify.toast.show(response.message, { duration: 2000 });
                setActive(false);
            } else {
                shopify.toast.show(response.message, { duration: 2000, isError: true });
            }
        } catch (error) {
            console.error('Error resetting settings:', error);
        } finally {
            setLoadingReset(false);
        }
    }

    const handleChange = (newValue) => {
        setValue(newValue);
    }

    return (
        <Modal
            open={active}
            onClose={() => setActive(false)}
            title="Reset Customer Points"
            primaryAction={{
                content: 'Confirm Reset',
                disabled: value !== 'RESET',
                destructive: true,
                loading: loadingReset,
                onAction: () => {
                    ResetPointsAPI();
                },
            }}
            secondaryActions={[
                {
                    content: 'Cancel',
                    onAction: () => setActive(false),
                },
            ]}
        >
            <Modal.Section>
                <Text>This action will Permanently:</Text>
                <ul>
                    <li>Delete all Customer activities</li>
                    <li>Reset all customer points to 0</li>
                    <li>Reset all lifetime points to 0</li>
                    <li>Reset all customer tiers to default</li>
                </ul>

                <Text tone="critical">This action cannot be undone. All customer data will be permanently reset.</Text>

                <Box style={{ marginTop: '10px' }}>
                    <div onPasteCapture={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }}>
                        <TextField
                            label="Type 'RESET' to confirm"
                            placeholder="e.g. RESET"
                            value={value}
                            onChange={handleChange}
                            autoComplete="off"
                        />
                    </div>
                </Box>
            </Modal.Section>
        </Modal>
    )
}

export default ResetPointsModal
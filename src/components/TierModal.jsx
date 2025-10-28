import { BlockStack, Box, Modal, Select, Text, TextField } from '@shopify/polaris'
import React, { useState, useEffect } from 'react'

const TierModal = ({ open, onClose, tiers, selectedTier, onSave }) => {
    const [selected, setSelected] = useState(selectedTier);
    const [reason, setReason] = useState('');
    // sync when prop changes
    useEffect(() => {
        setSelected(selectedTier);
    }, [selectedTier]);

    const handleChange = (value) => {
        setSelected(value);
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Change Customer Tier"
            primaryAction={{
                content: 'Save',
                onAction: () => onSave(selected), // send value to parent
            }}
            secondaryActions={[
                {
                    content: 'Cancel',
                    onAction: onClose,
                },
            ]}
        >
            <Modal.Section>
                <BlockStack gap={200}>
                    <Select
                        label="New VIP tier"
                        helpText="Customers can only be placed into higher tiers."
                        options={tiers.map(tier => ({
                            label: tier.content,
                            value: tier.id
                        }))}
                        onChange={handleChange}
                        value={selected}
                    />
                    <TextField
                        label="Reason for change"
                        placeholder='e.g. A small gift from us'
                        value={reason}
                        onChange={setReason}
                        helpText='Reason for updating customer tier'
                    />
                    <Box>
                        <Text tone='subdued'>Customers will be issued tier rewards</Text>
                        <Text tone='subdued'>Customers will be notified of tier changes</Text>
                    </Box>
                </BlockStack>
            </Modal.Section>
        </Modal>
    );
};

export default TierModal;

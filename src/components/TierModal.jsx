import { Modal, Select, Text } from '@shopify/polaris'
import React, { useState, useEffect } from 'react'

const TierModal = ({ open, onClose, tiers, selectedTier, onSave }) => {
    const [selected, setSelected] = useState(selectedTier);

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
                <Text>New VIP tier</Text>
                <Select
                    helpText="Customers can only be placed into higher tiers."
                    options={tiers.map(tier => ({
                        label: tier.content,
                        value: tier.id
                    }))}
                    onChange={handleChange}
                    value={selected}
                />
                <Text tone='subdued'>Customers will be issued tier rewards</Text>
                <Text tone='subdued'>Customers will be notified of tier changes</Text>
            </Modal.Section>
        </Modal>
    );
};

export default TierModal;

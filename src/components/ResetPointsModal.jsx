import { Box, Modal, Text } from '@shopify/polaris'
import React from 'react'

const ResetPointsModal = ({ active, setActive }) => {
    return (
        <Modal
            open={active}
            onClose={() => setActive(false)}
            title="Reset Customer Points"
            primaryAction={{
                content: 'Confirm Reset',
                destructive: true,
                onAction: () => {
                    // Add logic to reset customer points here
                    setActive(false);
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
            </Modal.Section>
        </Modal>
    )
}

export default ResetPointsModal

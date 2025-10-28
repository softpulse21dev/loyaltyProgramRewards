import {
    Modal,
    Text,
    TextField,
    RadioButton,
    BlockStack,
    Box,
} from '@shopify/polaris'
import React, { useState, useEffect } from 'react'

const PointsModal = ({ open, onClose, customerPoints, onSave }) => {
    const [rawPoints, setRawPoints] = useState() // always positive input
    const [mode, setMode] = useState('credit') // "credit" or "debit"
    const [reason, setReason] = useState('')

    const handleSave = () => {
        const value = Number(rawPoints) || 0
        const signedValue = mode === 'debit' ? -Math.abs(value) : Math.abs(value)
        const newBalance = customerPoints + signedValue
        onSave(newBalance)
    }

    // preview balance with selected mode
    const previewBalance =
        customerPoints +
        (mode === 'debit' ? -Math.abs(Number(rawPoints) || 0) : Math.abs(Number(rawPoints) || 0))

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Adjust Points Balance for Customer"
            primaryAction={{
                content: 'Adjust Points Balance',
                onAction: handleSave,
            }}
            secondaryActions={[
                {
                    content: 'Cancel',
                    onAction: onClose,
                },
            ]}
        >
            <Modal.Section>
                <BlockStack gap="200">
                    {/* Radio buttons */}
                    <Box style={{ display: 'flex', alignItems: 'column', gap: '10px' }}>
                        <RadioButton
                            label="Debit"
                            checked={mode === 'debit'}
                            onChange={() => setMode('debit')}
                        />
                        <RadioButton
                            label="Credit"
                            checked={mode === 'credit'}
                            onChange={() => setMode('credit')}
                        />
                    </Box>

                    {/* Raw input (always positive) */}
                    <TextField
                        label="Points Change"
                        placeholder='e.g. 100'
                        type="number"
                        value={rawPoints}
                        onChange={setRawPoints}
                        autoComplete="off"
                        min="0"
                        helpText={`Points will be ${mode === 'debit' ? 'subtracted from' : 'added to'} the customer's balance.`}
                    />

                    <TextField
                        label="Reason for change"
                        placeholder='e.g. A small gift from us'
                        value={reason}
                        onChange={setReason}
                        helpText='Reason for updating customer points'
                    />

                    {/* New Balance */}
                    <Text variant="bodyMd" fontWeight="bold">
                        New Balance: {previewBalance} points
                    </Text>
                </BlockStack>
            </Modal.Section>
        </Modal>
    )
}

export default PointsModal

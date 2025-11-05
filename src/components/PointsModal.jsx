import {
    Modal,
    Text,
    TextField,
    RadioButton,
    BlockStack,
    Box,
} from '@shopify/polaris'
import { useState } from 'react'

const PointsModal = ({ open, onClose, customerPoints, onSave, isLoading }) => {
    const [rawPoints, setRawPoints] = useState('')
    const [mode, setMode] = useState('credit')
    const [reason, setReason] = useState('')

    const handleSave = () => {
        onSave({
            points: rawPoints || '0',
            point_type: mode,
            reason: reason
        });
    }

    const previewBalance =
        customerPoints +
        (mode === 'debit' ? -Math.abs(Number(rawPoints) || 0) : Math.abs(Number(rawPoints) || 0))

    const handleClose = () => {
        setRawPoints('');
        setReason('');
        setMode('credit');
        onClose();
    }

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title="Adjust Points Balance for Customer"
            primaryAction={{
                content: 'Adjust Points Balance',
                onAction: handleSave,
                loading: isLoading,
            }}
            secondaryActions={[
                {
                    content: 'Cancel',
                    onAction: handleClose,
                    disabled: isLoading,
                },
            ]}
        >
            <Modal.Section>
                <BlockStack gap="200">
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
                    <TextField
                        label="Points Change"
                        placeholder='e.g. 100'
                        type="number"
                        value={rawPoints}
                        onChange={setRawPoints}
                        autoComplete="off"
                        min="0"
                        step="1"
                        helpText={`Points will be ${mode === 'debit' ? 'subtracted from' : 'added to'} the customer's balance.`}
                    />
                    <TextField
                        label="Reason for change"
                        placeholder='e.g. A small gift from us'
                        value={reason}
                        onChange={setReason}
                        helpText='Reason for updating customer points'
                    />
                    <Text variant="bodyMd" fontWeight="bold">
                        New Balance: {previewBalance} points
                    </Text>
                </BlockStack>
            </Modal.Section>
        </Modal>
    )
}

export default PointsModal

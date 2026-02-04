import { Modal, Text, TextField, RadioButton, BlockStack, InlineStack, } from '@shopify/polaris'
import { useState, useEffect } from 'react'
import { NoLeadingZero } from '../utils'

const PointsModal = ({ open, onClose, customerPoints, onSave, isLoading }) => {
    const [pointsAmount, setPointsAmount] = useState('')
    const [mode, setMode] = useState('credit')
    const [reason, setReason] = useState('')
    const [pointsAmountError, setPointsAmountError] = useState('')

    useEffect(() => {
        if (open) {
            setPointsAmount('');
            setReason('');
            setMode('credit');
            setPointsAmountError('');
        }
    }, [open])

    const handleClose = () => {
        onClose()
    }

    const handleValidation = () => {
        const value = pointsAmount.trim();
        const num = Number(value);
        if (!value || isNaN(num) || num <= 0) {
            setPointsAmountError('Points must be a number greater than 0');
            return true;
        }
        setPointsAmountError('');
        return false;
    };

    const handleSave = async () => {
        if (handleValidation()) {
            return;
        }
        try {
            await onSave({
                points: pointsAmount.trim() || '0',
                point_type: mode,
                reason: reason
            });
            onClose();
        } catch (error) {
            console.error('Failed to adjust points:', error);
        }
    }

    const handlePointsChange = (value) => {
        const regex = /^[0-9]*(\.[0-9]{0,2})?$/;
        if (value === '' || regex.test(value)) {
            setPointsAmount(NoLeadingZero(value));
        }
        if (pointsAmountError) {
            setPointsAmountError('');
        }
    }

    // After (Fixed)
    const previewBalance = (Number(customerPoints) + (mode === 'debit' ? -(Number(pointsAmount) || 0) : (Number(pointsAmount) || 0))).toFixed(2);

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
                <BlockStack gap="400">
                    <InlineStack gap="400">
                        <RadioButton
                            label="Credit"
                            checked={mode === 'credit'}
                            onChange={() => setMode('credit')}
                        />
                        <RadioButton
                            label="Debit"
                            checked={mode === 'debit'}
                            onChange={() => setMode('debit')}
                        />
                    </InlineStack>

                    <TextField
                        label="Points Change"
                        placeholder='e.g. 100'
                        requiredIndicator={true}
                        type="text"
                        inputMode="decimal"
                        value={pointsAmount}
                        onChange={handlePointsChange}
                        autoComplete="off"
                        helpText={`Points will be ${mode === 'debit' ? 'subtracted from' : 'added to'} the customer's balance.`}
                        error={pointsAmountError}
                    />

                    <TextField
                        label="Reason for change"
                        placeholder='e.g. A small gift from us'
                        value={reason}
                        onChange={setReason}
                        autoComplete="off"
                        helpText='Reason for updating customer points'
                    />
                    <Text variant="bodyMd" fontWeight="bold">
                        New Balance: {Number(previewBalance).toFixed(2)} points
                    </Text>
                </BlockStack>
            </Modal.Section>
        </Modal>
    )
}

export default PointsModal
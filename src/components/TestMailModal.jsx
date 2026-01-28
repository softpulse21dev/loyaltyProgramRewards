import { Modal, Text, TextField } from '@shopify/polaris';
import React, { useState } from 'react';
import { fetchData } from '../action';

const TestMailModal = ({ open, onClose, save, type }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState('');

    const handleSendTestEmail = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("type", type);
            formData.append("email", email);
            const response = await fetchData("/send-test-email", formData);
            if (response?.status === true) {
                shopify.toast.show(response?.message, { duration: 2000 });
            } else {
                shopify.toast.show(response?.message, { duration: 2000, isError: true });
            }
        } catch (error) {
            console.error('Failed to send test email:', error);
        } finally {
            setLoading(false);
        }
    }

    const validateEmail = (value) => {
        if (!value || value.trim() === '') {
            return 'Email is required';
        }
        // Basic Email Regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return 'Please enter a valid email address';
        }
        return '';
    };

    const handleSave = () => {
        const error = validateEmail(email);
        
        if (error) {
            setEmailError(error);
            return;
        }

        setEmailError('');
        handleSendTestEmail();
        onClose();
        setEmail('');
    }

    const handleClose = () => {
        onClose();
        setEmail('');
        setEmailError(''); // Clear error when closing manually
    }

    const handleEmailChange = (value) => {
        setEmail(value);
        if (emailError) {
            setEmailError('');
        }
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title="Send test email"
            primaryAction={{ 
                content: 'Send', 
                onAction: handleSave, // simplified call
                loading: loading 
            }}
            secondaryActions={{ content: 'Cancel', onAction: handleClose }}
        >
            <Modal.Section>
                <TextField
                    label="We'll send a test email to"
                    value={email}
                    onChange={handleEmailChange}
                    error={emailError}
                    autoComplete="email"
                    type="email"
                    placeholder="example@store.com"
                />
            </Modal.Section>
        </Modal>
    )
}

export default TestMailModal;
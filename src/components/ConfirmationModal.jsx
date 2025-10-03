import { BlockStack, Modal, Text } from '@shopify/polaris'


function ConfirmationModal({ isOpen, setIsOpen, text, title, buttonText, buttonAction, destructive, buttonLoader }) {
    return (
        <Modal open={isOpen} id="ConfirmationModal"
            size='small'
            onClose={() => setIsOpen(false)}
            title={title}
            primaryAction={{ content: buttonText, onAction: () => buttonAction(), destructive: destructive, loading: buttonLoader }}
            secondaryActions={[
                {
                    content: 'cancel',
                    onAction: () => setIsOpen(false),
                },
            ]}
        >
            <Modal.Section >
                <BlockStack gap={200}>
                    <Text>{text}</Text>
                </BlockStack>
            </Modal.Section>
        </Modal>
    )
}

export default ConfirmationModal

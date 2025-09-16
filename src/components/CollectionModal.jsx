import { BlockStack, Box, Button, InlineStack, Modal, ResourceItem, ResourceList, Text, TextField, Icon } from '@shopify/polaris'
import { SearchIcon, ProductIcon } from '@shopify/polaris-icons';
import React, { useState } from 'react'

const dummyCollections = [
    {
        id: '1',
        title: 'All Products',
        description: '3,000 products',
    },
    {
        id: '2',
        title: 'Bestsellers',
        description: '25 products',
    },
    {
        id: '3',
        title: 'Summer Collection',
        description: '150 products',
    },
    {
        id: '4',
        title: 'Winter Sale',
        description: '200 products',
    },
];

const CollectionModal = ({ open, onClose, onSave }) => {
    const [collectionName, setCollectionName] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Add Collection"
            primaryAction={{
                content: 'Add',
                onAction: onSave,
            }}
            secondaryActions={[
                {
                    content: 'Cancel',
                    onAction: onClose,
                },
            ]}
        >
            <div className='LPR_CollectionModal'>
                <Modal.Section>

                        <div style={{paddingBlockEnd: '16px', borderBottom: '0.1rem solid #dfe3e8' }}>
                            <TextField
                                value={collectionName}
                                onChange={(value) => setCollectionName(value)}
                                placeholder="Search Collections"
                                prefix={<Icon source={SearchIcon} />}
                            />
                        </div>

                        <ResourceList
                            resourceName={{ singular: 'collection', plural: 'collections' }}
                            showHeader={false}
                            items={dummyCollections}
                            selectedItems={selectedItems}
                            onSelectionChange={setSelectedItems}
                            selectable
                            renderItem={(item) => {
                                const { id, title, description } = item;
                                return (
                                    <ResourceItem
                                        id={id}
                                        media={<Icon source={ProductIcon} tone="base" />}
                                    >
                                        <BlockStack gap="100">
                                            <Text variant="headingMd" as="h3">
                                                {title}
                                            </Text>
                                            <Text variant="bodyMd" as="p" tone="subdued">
                                                {description}
                                            </Text>
                                        </BlockStack>
                                    </ResourceItem>
                                );
                            }}
                        />
                </Modal.Section>
            </div>
        </Modal >
    )
}

export default CollectionModal
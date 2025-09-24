import { BlockStack, Box, Modal, ResourceItem, ResourceList, Text, TextField, Icon, Spinner } from '@shopify/polaris';
import { SearchIcon } from '@shopify/polaris-icons';
import { useState, useEffect } from 'react';
import { fetchData } from '../action';

const CollectionModal = ({ open, onClose, onSave, initialSelectedCollections = [] }) => {
    const [collectionName, setCollectionName] = useState('');
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);


    useEffect(() => {
        if (open) {
            // Extract just the IDs from the full collection objects
            const initialIds = initialSelectedCollections.map(col => col.collection_id);
            setSelectedItems(initialIds);

            // Fetch all collections so the list is ready
            fetchCollections(collectionName);
        }
    }, [open]); // This effect runs only when the modal opens
    
    console.log('selectedItems', selectedItems)

    const fetchCollections = async (query = '') => {
        try {
            setLoading(true);
            const formData = new FormData();
            if (query) formData.append("query", query);

            const response = await fetchData("/get-list-of-collection", formData);
            console.log("response", response);

            if (response?.status && response?.data) {
                setCollections(response.data);
            } else {
                setCollections([]);
            }
        } catch (err) {
            console.error("Error fetching collections:", err);
            setCollections([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open === true) {
            const delay = setTimeout(() => {
                fetchCollections(collectionName);
            }, 500);
            return () => clearTimeout(delay);
        }
    }, [collectionName]);

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Add Collection"
            primaryAction={{
                content: "Add",
                onAction: () =>
                    onSave(collections.filter((c) => selectedItems.includes(c.collection_id))),
            }}
            secondaryActions={[{ content: "Cancel", onAction: onClose }]}
        >
            <div className="LPR_CollectionModal">
                <Modal.Section>
                    <div
                        style={{
                            paddingBlockEnd: "16px",
                            borderBottom: "0.1rem solid #dfe3e8",
                        }}
                    >
                        <TextField
                            value={collectionName}
                            onChange={setCollectionName}
                            placeholder="Search Collections"
                            prefix={<Icon source={SearchIcon} />}
                            clearButton
                            onClearButtonClick={() => setCollectionName("")}
                        />
                    </div>

                    {loading ? (
                        <Box alignment="center" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80px' }}>
                            <Spinner accessibilityLabel="Loading collections" size="large" />
                        </Box>
                    ) : (
                        <ResourceList
                            resourceName={{ singular: "collection", plural: "collections" }}
                            showHeader={false}
                            items={collections}
                            selectedItems={selectedItems}
                            onSelectionChange={setSelectedItems}
                            selectable
                            renderItem={(item) => {
                                const { collection_id, name, image } = item;
                                return (
                                    <ResourceItem
                                        id={collection_id}
                                        media={
                                            <img
                                                src={image}
                                                alt=""
                                                style={{ width: 40, height: 40, borderRadius: 4 }}
                                            />
                                        }
                                    >
                                        <BlockStack gap="100">
                                            <Text variant="headingMd">{name}</Text>
                                        </BlockStack>
                                    </ResourceItem>
                                );
                            }}
                        />
                    )}
                </Modal.Section>
            </div>
        </Modal>
    );
};

export default CollectionModal;

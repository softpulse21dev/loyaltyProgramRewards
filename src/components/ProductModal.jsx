import { Avatar, Box, Button, Checkbox, Filters, Grid, Icon, InlineStack, Modal, ResourceItem, ResourceList, Select, Text, TextField } from '@shopify/polaris';
import { CurrencyConvertIcon, SearchIcon } from '@shopify/polaris-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchData } from '../action';

const ProductModal = ({ open, onClose, onSave, selectedProducts }) => {
    const [searchValue, setSearchValue] = useState('');
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedItems, setSelectedItems] = useState(new Set());
    console.log('selectedProducts modal', selectedProducts)
    const SELECTION_LIMIT = 5;

    const fetchProductsAPI = async () => {
        try {
            setIsLoading(true);
            const formData = new FormData();
            const response = await fetchData("/get-list-of-product", formData);
            if (response.status && response.data) {
                setProducts(response.data);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchProductsAPI();

            // Check if there are pre-selected products passed from the parent
            if (selectedProducts && selectedProducts.length > 0) {
                const initialSelection = new Set();

                // Loop through the saved products and variants
                selectedProducts.forEach(product => {
                    // Add the parent product's unique ID to the set
                    initialSelection.add(`product-${product.product_id}`);

                    // Add each variant's unique ID to the set
                    product.variant_ids.forEach(variantId => {
                        initialSelection.add(`variant-${variantId}`);
                    });
                });

                // Set the modal's internal state with these initial selections
                setSelectedItems(initialSelection);
            } else {
                // If there are no pre-selected products, just reset to empty
                setSelectedItems(new Set());
            }
        }
    }, [open, selectedProducts]);

    // ProductModal.js

    const flattenedItems = useMemo(() => {
        const items = [];
        products.forEach((product) => {
            // Start building the main product item object
            const productItem = {
                ...product,
                variants: product.variants || [],
                isVariant: false,
                uniqueId: `product-${product.product_id}`,
                parentProductId: product.product_id,
            };

            // --- NEW LOGIC IS HERE ---
            // If the product has exactly one variant, use that variant's price
            // for the main product row's display.
            if (product.variants && product.variants.length === 1) {
                const singleVariant = product.variants[0];
                // Override the default product price with the variant's price
                productItem.price = singleVariant.price;
            }
            // --- END OF NEW LOGIC ---

            // Push the potentially modified product item to the list
            items.push(productItem);

            // The logic for creating rows for multi-variant products remains the same
            if (product.variants && product.variants.length > 1) {
                product.variants.forEach((variant) => {
                    items.push({
                        ...variant,
                        isVariant: true,
                        uniqueId: `variant-${variant.variant_id || variant.id}`,
                        parentProductId: product.product_id,
                        image: variant.image || product.image,
                        name: variant.title,
                    });
                });
            }
        });
        return items;
    }, [products]);

    const itemMap = useMemo(() => {
        const map = new Map();
        flattenedItems.forEach((item) => map.set(item.uniqueId, item));
        return map;
    }, [flattenedItems]);

    const selectedProductIds = useMemo(() => {
        const productIds = new Set();
        selectedItems.forEach((id) => {
            const item = itemMap.get(id);
            if (item) {
                productIds.add(item.parentProductId);
            }
        });
        return productIds;
    }, [selectedItems, itemMap]);

    const handleSelectionChange = useCallback((item) => {
        const isCurrentlySelected = selectedItems.has(item.uniqueId);

        if (!isCurrentlySelected && !selectedProductIds.has(item.parentProductId) && selectedProductIds.size >= SELECTION_LIMIT) {
            return;
        }

        const newSelectedItems = new Set(selectedItems);
        const childVariantIds = (item.variants || []).map(v => `variant-${v.variant_id || v.id}`);

        if (item.isVariant) {
            if (newSelectedItems.has(item.uniqueId)) {
                newSelectedItems.delete(item.uniqueId);
            } else {
                newSelectedItems.add(item.uniqueId);
            }

            const parentId = `product-${item.parentProductId}`;
            const parentItem = itemMap.get(parentId);
            const parentChildVariantIds = (parentItem?.variants || []).map(v => `variant-${v.variant_id || v.id}`);
            const selectedChildrenCount = parentChildVariantIds.filter(id => newSelectedItems.has(id)).length;

            if (selectedChildrenCount > 0) {
                newSelectedItems.add(parentId);
            } else {
                newSelectedItems.delete(parentId);
            }
        } else {
            const allChildrenSelected = childVariantIds.length > 0 && childVariantIds.every(id => newSelectedItems.has(id));
            if (allChildrenSelected) {
                newSelectedItems.delete(item.uniqueId);
                childVariantIds.forEach(id => newSelectedItems.delete(id));
            } else {
                newSelectedItems.add(item.uniqueId);
                childVariantIds.forEach(id => newSelectedItems.add(id));
            }
        }
        console.log('newSelectedItems', newSelectedItems)
        setSelectedItems(newSelectedItems);
    }, [selectedItems, itemMap, selectedProductIds]);

    const handleSave = () => {
        // This object will now store product details along with variant IDs.
        const groupedByProduct = {};

        selectedItems.forEach(uniqueId => {
            const item = itemMap.get(uniqueId);
            if (!item) return;

            if (uniqueId.startsWith('variant-')) {
                // CASE 1: A specific variant was selected.
                const parentId = item.parentProductId;
                const variantId = item.variant_id || item.id;

                // If we haven't seen this product yet, create its entry.
                if (!groupedByProduct[parentId]) {
                    // Find the parent product in the map to get its title and image.
                    const parentItem = itemMap.get(`product-${parentId}`);
                    groupedByProduct[parentId] = {
                        title: parentItem.name,
                        img: parentItem.image,
                        variants: new Set() // Use a Set to avoid duplicates
                    };
                }
                // Add the selected variant ID.
                groupedByProduct[parentId].variants.add(String(variantId));

            } else if (uniqueId.startsWith('product-')) {
                // CASE 2: A product row was selected (for a single-variant product).
                if (item.variants && item.variants.length === 1) {
                    const parentId = item.product_id;
                    const variantId = item.variants[0].variant_id || item.variants[0].id;

                    // If we haven't seen this product yet, create its entry.
                    if (!groupedByProduct[parentId]) {
                        // Here, the 'item' is the product itself.
                        groupedByProduct[parentId] = {
                            title: item.name,
                            img: item.image,
                            variants: new Set()
                        };
                    }
                    // Add its single variant ID.
                    groupedByProduct[parentId].variants.add(String(variantId));
                }
            }
        });

        // --- NEW: Transform the grouped data into your desired final format ---
        const formattedSelection = Object.entries(groupedByProduct).map(([productId, data]) => ({
            product_id: String(productId),
            title: data.title,
            img: data.img,
            variant_ids: Array.from(data.variants), // Convert the Set to an Array
        }));

        // The final output will be an array of products.
        // If you need it inside a {"products": [...]}, you can wrap it here.

        console.log('Final Formatted Data:', formattedSelection);
        onSave(formattedSelection); // or onSave(formattedSelection) depending on what the parent expects
        onClose();
    };

    const filterControl = (
        <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--p-color-border-subdued)' }}>
            <Grid>
                <Grid.Cell columnSpan={{ xs: 6, sm: 4, md: 8, lg: 8, xl: 8 }}>
                    <TextField
                        value={searchValue}
                        onChange={setSearchValue}
                        placeholder="Search Product"
                        prefix={<Icon source={SearchIcon} />}
                    />
                </Grid.Cell>
                <Grid.Cell columnSpan={{ xs: 6, sm: 2, md: 2, lg: 4, xl: 4 }}>
                    <Select
                        label="Search by"
                        labelInline
                        options={[{ label: "Variant title", value: "variant" }, { label: "Product title", value: "product" }]}
                        onChange={() => { }}
                        value={"product"}
                    />
                </Grid.Cell>
            </Grid>
        </div>
    );

    const filters = [
        {
            key: 'accountStatus',
            label: 'Account status',
            filter: 'asfasf',
            shortcut: true,
        },
    ];

    const modalFooter = (
        <Text variant="bodyMd">
            {`${selectedProductIds.size} of ${SELECTION_LIMIT} products selected`}
        </Text>
    );

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Add Product"
            footer={modalFooter}
            primaryAction={{
                content: "Add",
                onAction: () => handleSave(),
            }}
            secondaryActions={[{ content: "Cancel", onAction: onClose }]}
        >
            <ResourceList
                resourceName={{ singular: 'product', plural: 'products' }}
                items={flattenedItems}
                loading={isLoading}
                flushFilters
                filterControl={<>
                    {filterControl}
                    <Filters
                        hideQueryField={true}
                        filters={filters}
                    />
                </>}
                renderItem={(item) => {
                    const { uniqueId, name, image, price, isVariant, variants } = item;
                    const isMultiVariantParent = !isVariant && variants && variants.length > 1;
                    const isLimitReached = selectedProductIds.size >= SELECTION_LIMIT;
                    const isPartOfSelection = selectedProductIds.has(item.parentProductId);
                    const disabled = isLimitReached && !isPartOfSelection;

                    const itemStyle = {
                        paddingLeft: isVariant ? '32px' : undefined,
                        opacity: disabled ? 0.5 : 1,
                        cursor: disabled ? 'not-allowed' : 'pointer',
                    };

                    let checked = false;
                    let indeterminate = false;

                    if (isVariant) {
                        checked = selectedItems.has(uniqueId);
                    } else { // It's a parent product
                        checked = selectedItems.has(uniqueId);

                        const childVariantIds = (item.variants || []).map(v => `variant-${v.variant_id || v.id}`);
                        if (childVariantIds.length > 0) {
                            const selectedChildrenCount = childVariantIds.filter(id => selectedItems.has(id)).length;
                            const allChildrenSelected = selectedChildrenCount === childVariantIds.length;

                            if (checked && !allChildrenSelected) {
                                indeterminate = true;
                            }
                        }
                    }

                    return (
                        <ResourceItem id={uniqueId} key={uniqueId}>
                            <div style={{ ...itemStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                                <InlineStack blockAlign="center" gap="300" wrap={false}>
                                    <Checkbox
                                        labelHidden
                                        checked={checked}
                                        indeterminate={indeterminate}
                                        onChange={() => handleSelectionChange(item)}
                                        disabled={disabled}
                                    />
                                    <Avatar source={image} alt="" size="lg" />
                                    <Text variant="bodyMd" as="span">{name}</Text>
                                </InlineStack>
                                {!isMultiVariantParent && price && (
                                    <Text variant="bodyMd" as="span">${price}</Text>
                                )}
                            </div>
                        </ResourceItem>
                    );
                }}
            />
        </Modal>
    );
}

export default ProductModal;
// --- STEP 1: Make sure Button is imported ---
import { Avatar, Box, Button, Checkbox, Filters, Grid, Icon, InlineStack, Modal, ResourceItem, ResourceList, Select, Text, TextField } from '@shopify/polaris';
import { SearchIcon } from '@shopify/polaris-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchData } from '../action';

const ProductModal = ({ open, onClose, onSave }) => {
    const [searchValue, setSearchValue] = useState('');
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedItems, setSelectedItems] = useState(new Set());

    const SELECTION_LIMIT = 5;

    const fetchProductsAPI = async () => {
        try {
            setIsLoading(true);
            const formData = new FormData();
            const response = await fetchData("/get-list-of-product?Y6vg3RZzOZz7a9W", formData);
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
            setSelectedItems(new Set());
        }
    }, [open]);

    const flattenedItems = useMemo(() => {
        const items = [];
        products.forEach((product) => {
            items.push({
                ...product,
                variants: product.variants || [],
                isVariant: false,
                uniqueId: `product-${product.product_id}`,
                parentProductId: product.product_id,
            });

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
        setSelectedItems(newSelectedItems);
    }, [selectedItems, itemMap, selectedProductIds]);

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
                onAction: () => onSave(Array.from(selectedItems)),
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
                    const { uniqueId, name, image, isVariant } = item;

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
                            <div style={itemStyle}>
                                <InlineStack blockAlign="center" gap="300" wrap={false}>
                                    <Checkbox
                                        labelHidden
                                        checked={checked}
                                        indeterminate={indeterminate}
                                        onChange={() => handleSelectionChange(item)}
                                        disabled={disabled}
                                    />
                                    <Avatar source={image} alt="" size="lg" />
                                    <Text variant="bodyMd" as="span" fontWeight="semibold">{name}</Text>
                                </InlineStack>
                            </div>
                        </ResourceItem>
                    );
                }}
            />
        </Modal>
    );
}

export default ProductModal;
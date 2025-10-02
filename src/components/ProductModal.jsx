import { Avatar, Box, Button, Card, Checkbox, ChoiceList, Filters, Grid, Icon, InlineStack, Modal, Popover, RadioButton, ResourceItem, ResourceList, Select, Text, TextField } from '@shopify/polaris';
import { CurrencyConvertIcon, SearchIcon } from '@shopify/polaris-icons';
import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { fetchData } from '../action';

const ProductModal = ({ open, onClose, onSave, selectedProducts }) => {
    const [searchValue, setSearchValue] = useState('');
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedItems, setSelectedItems] = useState(new Set());
    console.log('selectedProducts modal', selectedProducts)
    const SELECTION_LIMIT = 5;

    const [filtersData, setFiltersData] = useState(null);
    const [searchBy, setSearchBy] = useState('all');
    const [productFilter, setProductFilter] = useState({
        product_type: [],
        tags: [],
        vendor: [],
        collection_id: null,
    });
    const [searchCollectionName, setSearchCollectionName] = useState('');
    const isInitialMount = useRef(true);

    const fetchProductsAPI = async () => {
        try {
            setIsLoading(true);
            const formData = new FormData();
            formData.append("search", searchValue);
            formData.append("search_by", searchBy);
            formData.append("filters", JSON.stringify(productFilter));
            const response = await fetchData("/get-list-of-product", formData);
            if (response.status && response.data) {
                setProducts(response.data);
                setFiltersData(response.filters || null);
            } else {
                setProducts([]);
                setFiltersData(null);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // This effect for initial load is correct and requires no changes.
    useEffect(() => {
        if (open) {
            isInitialMount.current = true;
            fetchProductsAPI();

            if (selectedProducts && selectedProducts.length > 0) {
                const initialSelection = new Set();
                selectedProducts.forEach(product => {
                    initialSelection.add(`product-${product.product_id}`);
                    product.variant_ids.forEach(variantId => {
                        initialSelection.add(`variant-${variantId}`);
                    });
                });
                setSelectedItems(initialSelection);
            } else {
                setSelectedItems(new Set());
            }
        }
    }, [open, selectedProducts]);

    // MODIFIED: The debounced effect is fixed here.
    useEffect(() => {
        // 1. Add a guard to ensure this effect does nothing when the modal is closed.
        if (!open) {
            return;
        }

        // This now runs when the modal opens, correctly consuming the 'isInitialMount' flag.
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const handler = setTimeout(() => {
            fetchProductsAPI();
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    // 2. Add `open` to the dependency array.
    }, [open, searchValue, searchBy, productFilter]);


    const flattenedItems = useMemo(() => {
        const items = [];
        products.forEach((product) => {
            const productItem = {
                ...product,
                variants: product.variants || [],
                isVariant: false,
                uniqueId: `product-${product.product_id}`,
                parentProductId: product.product_id,
            };

            if (product.variants && product.variants.length === 1) {
                const singleVariant = product.variants[0];
                productItem.price = singleVariant.price;
            }

            items.push(productItem);

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

    // ... (The rest of the component remains exactly the same) ...

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
        const groupedByProduct = {};

        selectedItems.forEach(uniqueId => {
            const item = itemMap.get(uniqueId);
            if (!item) return;

            if (uniqueId.startsWith('variant-')) {
                const parentId = item.parentProductId;
                const variantId = item.variant_id || item.id;

                if (!groupedByProduct[parentId]) {
                    const parentItem = itemMap.get(`product-${parentId}`);
                    groupedByProduct[parentId] = {
                        title: parentItem.name,
                        img: parentItem.image,
                        variants: new Set()
                    };
                }
                groupedByProduct[parentId].variants.add(String(variantId));

            } else if (uniqueId.startsWith('product-')) {
                if (item.variants && item.variants.length === 1) {
                    const parentId = item.product_id;
                    const variantId = item.variants[0].variant_id || item.variants[0].id;

                    if (!groupedByProduct[parentId]) {
                        groupedByProduct[parentId] = {
                            title: item.name,
                            img: item.image,
                            variants: new Set()
                        };
                    }
                    groupedByProduct[parentId].variants.add(String(variantId));
                }
            }
        });

        const formattedSelection = Object.entries(groupedByProduct).map(([productId, data]) => ({
            product_id: String(productId),
            title: data.title,
            img: data.img,
            variant_ids: Array.from(data.variants),
        }));

        console.log('Final Formatted Data:', formattedSelection);
        onSave(formattedSelection);
        onClose();
    };

    const handleClearAllFilters = useCallback(() => {
        setProductFilter({
            product_type: [],
            tags: [],
            vendor: [],
            collection_id: null,
        });
        setSearchCollectionName('');
    }, []);

    const appliedFilters = useMemo(() => {
        const filters = [];
        if (productFilter.product_type.length > 0) {
            filters.push({
                key: 'type',
                label: `Type: ${productFilter.product_type.join(', ')}`,
                onRemove: () => setProductFilter({ ...productFilter, product_type: [] }),
            });
        }
        if (productFilter.tags.length > 0) {
            filters.push({
                key: 'tag',
                label: `Tag: ${productFilter.tags.join(', ')}`,
                onRemove: () => setProductFilter({ ...productFilter, tags: [] }),
            });
        }
        if (productFilter.vendor.length > 0) {
            filters.push({
                key: 'vendor',
                label: `Vendor: ${productFilter.vendor.join(', ')}`,
                onRemove: () => setProductFilter({ ...productFilter, vendor: [] }),
            });
        }
        if (productFilter.collection_id) {
            const collectionName = filtersData?.collections?.find(c => c.id === productFilter.collection_id)?.title || '';
            filters.push({
                key: 'collection',
                label: `Collection: ${collectionName}`,
                onRemove: () => setProductFilter({ ...productFilter, collection_id: null }),
            });
        }
        return filters;
    }, [productFilter, filtersData]);

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
                        options={[
                            { label: "All", value: "all" },
                            { label: "Title", value: "title" },
                            { label: "Id", value: "id" },
                            { label: "SKU", value: "sku" },
                            { label: "Variant ID", value: "variant_id" },
                            { label: "Variant Title", value: "variant_title" },
                            { label: "Barcode", value: "barcode" },
                        ]}
                        onChange={(value) => setSearchBy(value)}
                        value={searchBy}
                    />
                </Grid.Cell>
            </Grid>
        </div>
    );

    const filters = [
        {
            key: "type",
            label: "Type",
            filter: (
                <Box style={{ padding: '1px' }}>
                    <ChoiceList
                        choices={filtersData?.product_types?.map((type) => ({ label: type, value: type })) || []}
                        selected={productFilter.product_type}
                        onChange={(value) => setProductFilter({ ...productFilter, product_type: value })}
                        allowMultiple
                    />
                </Box>
            ),
        },
        {
            key: "tag",
            label: "Tags",
            filter: (
                <ChoiceList
                    choices={filtersData?.tags?.map((tag) => ({ label: tag, value: tag })) || []}
                    selected={productFilter.tags}
                    onChange={(value) => setProductFilter({ ...productFilter, tags: value })}
                    allowMultiple
                />
            ),
        },
        {
            key: "vendor",
            label: "Vendors",
            filter: (
                <ChoiceList
                    choices={filtersData?.vendors?.map((vendor) => ({ label: vendor, value: vendor })) || []}
                    selected={productFilter.vendor}
                    onChange={(value) => setProductFilter({ ...productFilter, vendor: value })}
                    allowMultiple
                />
            ),
        },
        {
            key: "collection",
            label: "Collections",
            filter: (
                <Box style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <TextField
                        value={searchCollectionName}
                        onChange={(value) => setSearchCollectionName(value)}
                        placeholder="Search Collections"
                        prefix={<Icon source={SearchIcon} />}
                        clearButton
                        onClearButtonClick={() => setSearchCollectionName("")}
                    />
                    <Box>
                        {(filtersData?.collections || [])
                            .filter((collection) =>
                                searchCollectionName.trim() === ""
                                    ? true
                                    : collection.title
                                        ?.toLowerCase()
                                        .includes(searchCollectionName.toLowerCase())
                            )
                            .map((collection) => (
                                <Box key={collection.id}>
                                    <RadioButton
                                        label={collection.title}
                                        value={collection.id}
                                        checked={productFilter.collection_id === collection.id}
                                        onChange={() => setProductFilter({ ...productFilter, collection_id: collection.id })}
                                    />
                                </Box>
                            ))}
                    </Box>
                </Box>
            ),
        }
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
            <Box className="LPR_ProductModal" style={{ '--pc-scrollable-shadow-size': '0px', '--pc-scrollable-shadow-color': 'transparent' }}>
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
                            appliedFilters={appliedFilters}
                            onClearAll={handleClearAllFilters}
                            closeOnChildOverlayClick={true}
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
                        } else {
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
            </Box>
        </Modal>
    );
}

export default ProductModal;
import { Box, Button, Grid, Icon, InlineStack, Modal, Select, Text, TextField } from '@shopify/polaris'
import { SearchIcon } from '@shopify/polaris-icons';
import React, { useState } from 'react'

const ProductModal = ({ open, onClose, onSave }) => {

    const [searchValue, setSearchValue] = useState('');
    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Add Collection"
            primaryAction={{
                content: "Add",
                onAction: () =>
                    onSave([]),
            }}
            secondaryActions={[{ content: "Cancel", onAction: onClose }]}
        >
            <Modal.Section>
                <Box>
                    <Grid>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 4, md: 8, lg: 8, xl: 8 }}>
                            <Box>
                                <TextField
                                    value={searchValue}
                                    onChange={setSearchValue}
                                    placeholder="Search Product"
                                    prefix={<Icon source={SearchIcon} />}
                                />
                            </Box>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 2, md: 2, lg: 4, xl: 4 }}>
                            <Box>
                                <Select
                                    options={[
                                        {
                                            label: "Variant title",
                                            value: "variant"
                                        },
                                        {
                                            label: "Product title",
                                            value: "product"
                                        }
                                    ]}
                                    onChange={() => { }}
                                    value={[]}
                                />
                            </Box>
                        </Grid.Cell>
                    </Grid>
                    
                </Box>
                <Text>Product</Text>
            </Modal.Section>
        </Modal>
    )
}

export default ProductModal




// import {
//     Modal,
//     Filters,
//     ResourceList,
//     Text,
//     Thumbnail,
//     ChoiceList,
//     Select,
//     Box,
// } from '@shopify/polaris';
// import { useState, useCallback, useMemo } from 'react';

// // --- Mock Data: In a real app, this would come from an API ---
// const mockProducts = [
//     { id: '1', name: 'Selling Plans Ski Wax', sku: 'WAX-001', available: true },
//     { id: '2', name: 'Gift Card', sku: 'GIFTCARD', available: true },
//     { id: '3', name: 'Out of Stock Snowboard', sku: 'BOARD-003', available: false },
//     { id: '4', name: 'Premium Ski Goggles', sku: 'GGL-004', available: true },
// ];
// // --- End Mock Data ---

// const ProductModal = ({ open, onClose, onSave }) => {
//     // State for all filters
//     const [availability, setAvailability] = useState(null);
//     const [searchType, setSearchType] = useState('PRODUCT_TITLE');
//     const [queryValue, setQueryValue] = useState('');

//     // Callbacks to update filter state
//     const handleAvailabilityChange = useCallback((value) => setAvailability(value), []);
//     const handleSearchTypeChange = useCallback((value) => setSearchType(value), []);
//     const handleQueryValueChange = useCallback((value) => setQueryValue(value), []);
//     const handleAvailabilityRemove = useCallback(() => setAvailability(null), []);
//     const handleQueryValueRemove = useCallback(() => setQueryValue(''), []);
//     const handleClearAll = useCallback(() => {
//         handleAvailabilityRemove();
//         handleQueryValueRemove();
//     }, [handleAvailabilityRemove, handleQueryValueRemove]);

//     // Define the available filters for the "Add filter" button
//     const filters = [
//         {
//             key: 'availability',
//             label: 'Availability',
//             filter: (
//                 <ChoiceList
//                     title="Availability"
//                     titleHidden
//                     choices={[
//                         { label: 'Available', value: 'true' },
//                         { label: 'Not available', value: 'false' },
//                     ]}
//                     selected={availability || []}
//                     onChange={handleAvailabilityChange}
//                 />
//             ),
//             shortcut: true,
//         },
//     ];

//     // Create the "applied" filter tags that show up when a filter is active
//     const appliedFilters = [];
//     if (availability && !isEmpty(availability)) {
//         const key = 'availability';
//         appliedFilters.push({
//             key,
//             label: `Availability is ${availability[0] === 'true' ? 'Available' : 'Not Available'}`,
//             onRemove: handleAvailabilityRemove,
//         });
//     }

//     // Use useMemo to efficiently filter the list when data or filters change
//     const filteredItems = useMemo(() => {
//         let items = [...mockProducts];

//         // Filter by text query
//         if (queryValue) {
//             const query = queryValue.toLowerCase();
//             items = items.filter((item) => {
//                 if (searchType === 'SKU') {
//                     return item.sku.toLowerCase().includes(query);
//                 }
//                 return item.name.toLowerCase().includes(query);
//             });
//         }

//         // Filter by availability
//         if (availability && availability.length > 0) {
//             const isAvailable = availability[0] === 'true';
//             items = items.filter((item) => item.available === isAvailable);
//         }

//         return items;
//     }, [queryValue, searchType, availability]);

//     return (
//         <Modal
//             open={open}
//             onClose={onClose}
//             title="Add product"
//             primaryAction={{ content: "Add", onAction: () => onSave([]) }}
//             secondaryActions={[{ content: "Cancel", onAction: onClose }]}
//         >
//             <ResourceList
//                 resourceName={{ singular: 'product', plural: 'products' }}
//                 items={filteredItems}
//                 renderItem={(item) => (
//                     <ResourceList.Item id={item.id} media={() => <Thumbnail source="" alt={item.name} />}>
//                         <Text variant="bodyMd" fontWeight="bold" as="h3">{item.name}</Text>
//                         <Text variant="bodySm" tone="subdued">{item.sku}</Text>
//                     </ResourceList.Item>
//                 )}
//                 // The Filters component is passed directly here
//                 filterControl={
//                     <Filters
//                         queryValue={queryValue}
//                         filters={filters}
//                         appliedFilters={appliedFilters}
//                         onQueryChange={handleQueryValueChange}
//                         onQueryClear={handleQueryValueRemove}
//                         onClearAll={handleClearAll}
//                         queryPlaceholder="Search products"
//                     >
//                         {/* This is where the "Search by" dropdown goes */}

//                         <Box>
//                             <Select
//                                 label="Search by"
//                                 labelInline
//                                 options={[
//                                     { label: 'Product title', value: 'PRODUCT_TITLE' },
//                                     { label: 'SKU', value: 'SKU' },
//                                 ]}
//                                 value={searchType}
//                                 onChange={handleSearchTypeChange}
//                             />
//                         </Box>

//                     </Filters>
//                 }
//                 flushFilters
//             />
//         </Modal>
//     );
// };

// // Helper function
// function isEmpty(value) {
//     if (Array.isArray(value)) {
//         return value.length === 0;
//     } else {
//         return value === '' || value == null;
//     }
// }

// export default ProductModal;

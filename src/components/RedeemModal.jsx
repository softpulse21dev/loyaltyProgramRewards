import { Box, Icon, Modal, ResourceItem, ResourceList, Text } from '@shopify/polaris'
import { CurrencyConvertIcon } from '@shopify/polaris-icons'
import React from 'react'

const RedeemModal = ({ active, setActive }) => {
    const methods = [
        {
            id: 1,
            name: 'Amount Discount',
            icon: CurrencyConvertIcon,
        },
        {
            id: 2,
            name: 'Percentage Discount',
            icon: CurrencyConvertIcon,
        },

        {
            id: 3,
            name: 'Free Shipping',
            icon: CurrencyConvertIcon,
        },

        {
            id: 4,
            name: 'Free Gift',
            icon: CurrencyConvertIcon,
        },
    ]

    return (
        <Modal
            open={active}
            onClose={() => setActive(false)}
            title="Ways to Redeem"
        >

            <Modal.Section>
                <div className='LPR_RedeemModal'>
                    <ResourceList
                        resourceName={{ singular: 'method', plural: 'methods' }}
                        items={methods}
                        renderItem={(item) => {
                            const { id, name, icon } = item;

                            return (
                                <ResourceItem
                                    id={id}
                                    icon={icon}
                                    name={name}
                                >
                                    <Box className='LPR_RedeemModal' style={{ display: 'flex', alignItems: 'center', gap: '10px', }}>
                                        <Box>
                                            <Icon source={icon} />
                                        </Box>
                                        <Text variant="bodyMd" fontWeight="bold" as="h3">
                                            {name}
                                        </Text>
                                    </Box>
                                </ResourceItem>
                            );
                        }}
                    />
                </div>
            </Modal.Section>
        </Modal >
    )
}

export default RedeemModal

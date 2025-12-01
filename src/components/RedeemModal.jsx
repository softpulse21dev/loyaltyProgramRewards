import { Box, Button, Icon, InlineStack, Modal, ResourceItem, ResourceList, Text, SkeletonBodyText, Card } from '@shopify/polaris'
import { CurrencyConvertIcon } from '@shopify/polaris-icons'
import React from 'react'
import { iconsMap } from '../utils'
import { useNavigate } from 'react-router-dom'

const RedeemModal = ({ active, setActive, data, referralRule, navigateTo, localSave, loading }) => {
    console.log('data', data)
    const navigate = useNavigate();

    return (
        <Modal
            open={active}
            onClose={() => setActive(false)}
            title="Ways to Redeem"
        >
            {loading ? (
                <Box style={{ padding: '16px' }}>
                    <SkeletonBodyText lines={8} />
                </Box>
            ) : (
                <ResourceList
                    items={data || []}
                    renderItem={(item) => {
                        const IconSource = iconsMap[item.icon];
                        return (
                            <ResourceItem id={item.master_rule_id}>
                                <InlineStack align="space-between" blockAlign="center">
                                    <Box style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <Box>
                                            <Icon source={IconSource} />
                                        </Box>
                                        <Text>{item.title}</Text>
                                    </Box>
                                    <Button
                                        onClick={() =>
                                            navigate(`/loyaltyProgram/CouponPage`, { state: { rule: item, referralRule: referralRule, navigateTo: navigateTo, localSave: localSave } })
                                        }
                                    > ADD
                                    </Button>
                                </InlineStack>
                            </ResourceItem>
                        );
                    }}
                />
            )}
        </Modal >
    )
}

export default RedeemModal

import {
    Card,
    Layout,
    Button,
    ResourceList,
    ResourceItem,
    Text,
    Badge,
    Box,
    Icon,
    BlockStack,
} from "@shopify/polaris";
import { EditIcon, GiftCardIcon } from "@shopify/polaris-icons";

const Referral = () => {

    return (
        <div className="annotatedSection-border">
            <Layout.AnnotatedSection
                title={'Referral program status'}
                description={'Activate/Deactivate your Referral program'}
            >
                <Card>
                    <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Text variant="headingMd">This feature is Deactivated</Text>
                        <Button primary>Activate</Button>
                    </Box>
                </Card>
            </Layout.AnnotatedSection>
            <Layout.AnnotatedSection
                title={'Referral Rewards'}
                description={'Set rewards for referrals'}
            >

                <BlockStack gap="400">
                    <Card padding="0">
                        <Box style={{ backgroundColor: "#F5F5F5", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Text variant="headingMd">Referral Rewards</Text>
                            <Button variant="plain">Change Rewards</Button>
                        </Box>
                        <Box style={{ backgroundColor: "#fff", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Box>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <Icon source={GiftCardIcon} />
                                    <Box>
                                        <Text variant="bodyMd">Rs. 5 off coupon</Text>
                                        <Text variant="bodyMd">0 redeemed so far</Text>
                                    </Box>
                                </div>
                            </Box>
                            <Button icon={<Icon source={EditIcon} />} primary>Edit</Button>
                        </Box>
                    </Card>
                    <Card padding="0">
                        <Box style={{ backgroundColor: "#F5F5F5", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Text variant="headingMd">Referral Rewards</Text>
                            <Button variant="plain">Change Rewards</Button>
                        </Box>
                        {/* <Box style={{ backgroundColor: "#fff", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Box>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <Icon source={GiftCardIcon} />
                                    <Box>
                                        <Text variant="bodyMd">Rs. 5 off coupon</Text>
                                        <Text variant="bodyMd">0 redeemed so far</Text>
                                    </Box>
                                </div>
                            </Box>
                            <Button icon={<Icon source={EditIcon} />} primary>Edit</Button>
                        </Box> */}
                        <Box style={{ backgroundColor: "#FFF", padding: "10px 16px" }}>
                            <div style={{ marginBottom: "10px" }}>
                                <Text variant="bodyMd">Referral Rewards</Text>
                            </div>
                            <Button variant="secondary">Add Reward</Button>
                        </Box>
                    </Card>
                </BlockStack>

            </Layout.AnnotatedSection>
        </div>
    );
}

export default Referral;
import {
    Card,
    Layout,
    Button,
    Text,
    Box,
    Icon,
    BlockStack,
    TextField,
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
                            <Text variant="headingMd">Advocate Rewards</Text>
                            <Button variant="plain">Change Rewards</Button>
                        </Box>
                        <Box style={{ backgroundColor: "#FFF", padding: "10px 16px" }}>
                            <div style={{ marginBottom: "10px" }}>
                                <Text variant="bodyMd">Referral Rewards</Text>
                            </div>
                            <Button variant="secondary">Add Reward</Button>
                        </Box>
                    </Card>
                </BlockStack>

            </Layout.AnnotatedSection>
            <Layout.AnnotatedSection
                title={'Referrals Customer Account'}
                description={'If "ON", it requires customer to create an account to claim referral coupon'}
            >
                <Card>
                    <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Text variant="headingMd">Current status is enabled.</Text>
                        <div className="toggle-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={true}
                                    onChange={() =>
                                        ''
                                    }
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </Box>
                </Card>
            </Layout.AnnotatedSection>
            <Layout.AnnotatedSection
                title={'Referrals Redirection URL'}
                description={'Set the URL that customers will be redirected to when visiting a referral link'}
            >
                <Card>
                    <BlockStack gap={200}>
                        <TextField
                            label="Referrals Landing URL Domain"
                            placeholder="kg-demo-store.shopify.com"
                            value={''}
                            onChange={''}
                        />
                        <TextField
                            label="Referrals Landing URL Path"
                            helpText='Your homepage will be the default if you leave this blank'
                            value={''}
                            onChange={''}
                        />
                    </BlockStack>
                </Card>
            </Layout.AnnotatedSection>
        </div>
    );
}

export default Referral;
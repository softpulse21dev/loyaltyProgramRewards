import {
    Card,
    Layout,
    Button,
    ResourceList,
    ResourceItem,
    Text,
    Badge,
    Box,
    Modal,
    InlineStack,
    Icon,
    TextField,
} from "@shopify/polaris";
import { ConfettiIcon, DeliveryIcon, DiscountCodeIcon, EditIcon, EyeCheckMarkIcon, GiftCardIcon, LogoInstagramIcon, LogoTiktokIcon, OrderIcon } from "@shopify/polaris-icons";
import { useCallback, useState } from "react";

const iconsMap = {
    LogoInstagramIcon,
    EyeCheckMarkIcon,
    LogoTiktokIcon,
    OrderIcon,
    ConfettiIcon,
    GiftCardIcon,
    DiscountCodeIcon,
    DeliveryIcon
};
const Loyalty = () => {

    const [modalActive, setModalActive] = useState(false);

    const toggleModal = useCallback(() => setModalActive((active) => !active), []);

    const earningOptions = [
        { id: 1, title: "Follow on Instagram", points: "20 Points", icon: "LogoInstagramIcon" },
        { id: 2, title: "Sign up", points: "100 Points", icon: "EyeCheckMarkIcon" },
        { id: 3, title: "Follow on TikTok", points: "20 Points", icon: "LogoTiktokIcon" },
        { id: 4, title: "Place an order", points: "1 Point for every Rs. 1 spent", icon: "OrderIcon" },
        { id: 5, title: "Celebrate a birthday", points: "250 Points", icon: "ConfettiIcon" },
    ];

    const waysToEarn = [
        { id: 1, title: "Celebrate Loyalty Anniversary", upgrade: true },
        { id: 2, title: "Visit a URL", upgrade: true },
        { id: 3, title: "Complete a Referral", upgrade: true },
        { id: 4, title: "Share link on Facebook", upgrade: false },
        { id: 5, title: "Custom Action", upgrade: true },
    ];

    const redeemPoints = [
        { id: "redeem1", title: "Rs. 5 of coupon", points: "100 points", icon: "DiscountCodeIcon" },
        { id: "redeem2", title: "Rs. 10 of coupon", points: "200 points", icon: "DiscountCodeIcon" },
        { id: "redeem4", title: "Free Shipping coupon", points: "1000 points", icon: "DeliveryIcon" },
        { id: "redeem3", title: "50% of coupon", points: "500 points", icon: "DiscountCodeIcon" },
        { id: "redeem4", title: "Free Product", points: "2000 points", icon: "GiftCardIcon" },
    ]

    return (
        <div className="annotatedSection-border icon-size">
            <Layout.AnnotatedSection
                title={'Loyalty program status'}
                description={'Activate/Deactivate your points program'}
            >
                <Card>
                    <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Text variant="headingMd">This feature is Deactivated</Text>
                        <Button primary>Activate</Button>
                    </Box>
                </Card>
            </Layout.AnnotatedSection>
            <Layout.AnnotatedSection
                title="Earning Points"
                description={
                    <>
                        <Box>
                            <p>Customize how your customers will earn points</p>
                        </Box>
                        <Box style={{ marginTop: 7, marginLeft: 0 }}>
                            <Button variant="primary" onClick={toggleModal}>Add Another Way to Earn</Button>
                        </Box>
                    </>
                }
            >
                <Card padding={0}>
                    <Box style={{ padding: '16px 16px 20px 16px' }}>
                        <Text variant="headingMd" as="h6">Customers will earn points through the actions below</Text>
                    </Box>
                    <ResourceList
                        resourceName={{ singular: "earning", plural: "earnings" }}
                        items={earningOptions}
                        renderItem={(item) => {
                            const { id, title, points, icon } = item;
                            const IconSource = iconsMap[icon];
                            return (
                                <ResourceItem id={id}>
                                    <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <Box style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                            <Icon source={IconSource} />
                                            <Box>
                                                <Text variant="bodyMd">{title}</Text>
                                                <Text variant="bodyMd">{points}</Text>
                                            </Box>
                                        </Box>
                                        <Box style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                            <Button variant="plain">Edit</Button>
                                            <div className="onoffswitch">
                                                <input
                                                    type="checkbox"
                                                    name=""
                                                    className="onoffswitch-checkbox test_mode"
                                                    id={`testMode-${id}`}
                                                    checked=""
                                                    onChange={() => ''}
                                                />
                                                <label className="onoffswitch-label" htmlFor={`testMode-${id}`}>
                                                    <span className="onoffswitch-inner onoffswitch-inner-testmode"></span>
                                                    <span className="onoffswitch-switch"></span>
                                                </label>
                                            </div>
                                        </Box>
                                    </Box>
                                </ResourceItem>
                            );
                        }}
                    />
                </Card>
            </Layout.AnnotatedSection>
            <Layout.AnnotatedSection
                title={'Redeeming rule'}
                description={
                    <>
                        <Box>
                            <p>Let customer redeem their earned points</p>
                        </Box>
                        <Box style={{ marginTop: 7, marginLeft: 0 }}>
                            <Button variant="primary">Add new rule</Button>
                        </Box>
                    </>
                }
            >
                <Card padding={0}>
                    <Box style={{ padding: '16px 16px 20px 16px' }}>
                        <Text variant="headingMd" as="h6">Customers can redeem these rewards using their points</Text>
                    </Box>
                    <ResourceList
                        resourceName={{ singular: "rule", plural: "rules" }}
                        items={redeemPoints}
                        renderItem={(item) => {
                            const { id, title, points, icon } = item;
                            const IconSource = iconsMap[icon];
                            return (
                                <ResourceItem id={id}>
                                    <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <Box style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                            <Icon source={IconSource} />
                                            <Box>
                                                <Text variant="bodyMd">{title}</Text>
                                                <Text variant="bodyMd">{points}</Text>
                                            </Box>
                                        </Box>
                                        <Box style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                            <Button variant="plain">Edit</Button>
                                            <div className="onoffswitch">
                                                <input
                                                    type="checkbox"
                                                    name=""
                                                    className="onoffswitch-checkbox test_mode"
                                                    id={`testMode-${id}`}
                                                    checked=""
                                                    onChange={() => ''}
                                                />
                                                <label className="onoffswitch-label" htmlFor={`testMode-${id}`}>
                                                    <span className="onoffswitch-inner onoffswitch-inner-testmode"></span>
                                                    <span className="onoffswitch-switch"></span>
                                                </label>
                                            </div>
                                        </Box>
                                    </Box>
                                </ResourceItem>
                            );
                        }}
                    />
                </Card>
            </Layout.AnnotatedSection>
            {/* <Layout.AnnotatedSection
                title={'Points Expiry'}
                description={'Increase engagement by setting customers points balances to expire after a certain amount of time'}
            >
                <Card>
                    <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Text variant="headingMd">This feature is Deactivated</Text>
                        <Button primary>Activate</Button>
                    </Box>
                </Card>
            </Layout.AnnotatedSection> */}
            <Layout.AnnotatedSection
                title={'Birthday Eligibility Period'}
                description={'Set how far in advance customers must provide their birthdate to be eligible for birthday rewards'}
            >
                <Card>
                    <TextField
                        type="number"
                        label="Date of Birth Updated Wait Period"
                        suffix="Days"
                        value={30}
                        onChange={() => { " " }}
                        min={1}
                        max={30}
                    />
                </Card>
            </Layout.AnnotatedSection>
            <Modal
                open={modalActive}
                onClose={toggleModal}
                title="Ways to Earn"
                large
            >
                <Modal.Section>
                    <ResourceList
                        items={waysToEarn}
                        renderItem={(item) => {
                            const { id, title } = item;
                            return (
                                <ResourceItem id={id}>
                                    <InlineStack align="space-between" blockAlign="center">
                                        <Text>{title}</Text>
                                        <Button size="slim">ADD</Button>
                                    </InlineStack>
                                </ResourceItem>
                            );
                        }}
                    />
                </Modal.Section>
            </Modal>
        </div>
    );
}

export default Loyalty;
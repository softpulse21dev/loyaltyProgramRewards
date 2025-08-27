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
    Select,
    TextField,
} from "@shopify/polaris";
import { ConfettiIcon, EyeCheckMarkIcon, LogoInstagramIcon, LogoTiktokIcon, OrderIcon } from "@shopify/polaris-icons";
import { useCallback, useState } from "react";

const iconsMap = {
    LogoInstagramIcon,
    EyeCheckMarkIcon,
    LogoTiktokIcon,
    OrderIcon,
    ConfettiIcon,
};

export default function Loyalty() {

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
        { id: 2, title: "Post a product review", upgrade: true },
        { id: 3, title: "Visit a URL", upgrade: true },
        { id: 4, title: "Complete a Referral", upgrade: true },
        { id: 5, title: "Like page on Facebook", upgrade: false },
        { id: 6, title: "Share link on Facebook", upgrade: false },
        { id: 7, title: "Follow on X", upgrade: false },
        { id: 8, title: "Share link on X", upgrade: false },
        { id: 9, title: "Custom Action", upgrade: true },
    ];

    return (
        <div className="annotatedSection-border">
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
                        // showHeader
                        renderItem={(item) => {
                            const { id, title, points, icon } = item;
                            const IconSource = iconsMap[icon];
                            return (
                                <ResourceItem id={id}>
                                    <InlineStack align="space-between" blockAlign="center">
                                        <Box>
                                            <Icon source={IconSource} />
                                        </Box>
                                        <Box>
                                            <Text variant="bodyMd" fontWeight="bold">{title}</Text>
                                            <div>{points}</div>
                                        </Box>
                                        <Box>
                                            <Button variant="plain">Edit</Button>
                                        </Box>
                                        <Box>
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
                                    </InlineStack>
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
                <Card title="Redeeming rule">
                    <ResourceList
                        resourceName={{ singular: "rule", plural: "rules" }}
                        items={[
                            { id: "redeem1", title: "Redeem on cart ranges", status: "Inactive", details: "100% points" },
                        ]}
                        renderItem={(item) => (
                            <ResourceItem id={item.id}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Text>{item.title}</Text>
                                    <Badge status={item.status === "Active" ? "success" : "attention"}>{item.status}</Badge>
                                    <Text>{item.details}</Text>
                                    <Button plain>Edit</Button>
                                </div>
                            </ResourceItem>
                        )}
                    />
                </Card>
            </Layout.AnnotatedSection>
            <Layout.AnnotatedSection
                title={'Points Expiry'}
                description={'Increase engagement by setting customers points balances to expire after a certain amount of time'}
            >
                <Card>
                    <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Text variant="headingMd">This feature is Deactivated</Text>
                        <Button primary>Activate</Button>
                    </Box>
                </Card>
            </Layout.AnnotatedSection>
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
                        onChange={() => {" "}}
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
                            const { id, title, upgrade } = item;
                            return (
                                <ResourceItem id={id}>
                                    <InlineStack align="space-between" blockAlign="center">
                                        <Text>{title}</Text>
                                        {upgrade ? (
                                            <Button size="slim" disabled>Upgrade to Unlock</Button>
                                        ) : (
                                            <Button size="slim">Select</Button>
                                        )}
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

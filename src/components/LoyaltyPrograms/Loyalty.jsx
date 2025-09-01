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
    SkeletonBodyText,
    Spinner,
} from "@shopify/polaris";
import { ConfettiIcon, DeliveryIcon, DiscountCodeIcon, EditIcon, EyeCheckMarkIcon, GiftCardIcon, LogoInstagramIcon, LogoTiktokIcon, LogoXIcon, OrderIcon, RewardIcon } from "@shopify/polaris-icons";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { iconsMap } from "../../utils";

const Loyalty = () => {
    const navigate = useNavigate();
    const [modalActive, setModalActive] = useState(false);
    const toggleModal = useCallback(() => setModalActive((active) => !active), []);
    const [waysToEarn, setWaysToEarn] = useState([]);
    const [earningOptions, setEarningOptions] = useState([]);
    const [socialOptions, setSocialOptions] = useState([]);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const shop = "kg-store-demo.myshopify.com";


    const fetchSettings = async () => {
        try {
            // setLoading(true);
            const formData = new FormData();
            formData.append("shop", shop);

            const res = await fetch(
                "https://demo.shopiapps.in/loyalty/api/get-merchant-settings?Y6vg3RZzOZz7a9W",
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await res.json();
            if (data.status && data.data) {
                setStatus(data.data.status); // true/false
            }
        } catch (error) {
            console.error("Fetch settings error:", error);
        } finally {
            // setLoading(false);
        }
    };



    const handleToggleStatus = async () => {
        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("shop", shop);
            formData.append("status", !status ? "true" : "false"); // toggle

            const res = await fetch(
                "https://demo.shopiapps.in/loyalty/api/update-merchant-settings?Y6vg3RZzOZz7a9W",
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await res.json();
            if (data.status) {
                setStatus((prev) => !prev); // toggle UI
            }
        } catch (error) {
            console.error("Update status error:", error);
        } finally {
            setLoading(false);
        }
    };

    const waysToEarnAPI = async () => {
        try {
            const formdata = new FormData();
            formdata.append("shop", "kg-store-demo.myshopify.com");
            formdata.append("setting_id", "ztEfTSMcDejdHNDnDiM5xBPdJdEuyCEkwhxdaL==");

            const response = await fetch(
                "https://demo.shopiapps.in/loyalty/api/get-master-rules?Y6vg3RZzOZz7a9W",
                {
                    method: "POST",
                    body: formdata,
                    redirect: "follow",
                }
            );

            const result = await response.json();
            console.log("result ways to earn api:", result);
            setWaysToEarn(result.available_rules);
            setEarningOptions(result.active_rules?.other_rules);
            setSocialOptions(result.active_rules?.social_rules);
        } catch (error) {
            console.error("error:", error);
        }
    }
    //     try {
    //         var formdata = new FormData();
    //         formdata.append("shop", "kg-store-demo.myshopify.com");
    //         formdata.append("status", status ? "true" : "false"); // ensure string

    //         const response = await fetch(
    //             "https://demo.shopiapps.in/loyalty/api/update-merchant-settings?Y6vg3RZzOZz7a9W",
    //             {
    //                 method: "POST",
    //                 body: formdata,
    //                 redirect: "follow",
    //             }
    //         );

    //         const result = await response.json();
    //         console.log("✅ update result:", result);
    //     } catch (error) {
    //         console.error("❌ error updating:", error);
    //     }
    // };

    useEffect(() => {
        fetchSettings();
        waysToEarnAPI();
    }, []);

    const NavigateMap = {
        signup: "/loyaltyProgram/loyaltySignupView",
        social_share: "/loyaltyProgram/loyaltySocialView",
        social_follow: "/loyaltyProgram/loyaltySocialView",
        order: "/loyaltyProgram/orderPoints",
        loyalty_anniversary: "/loyaltyProgram/loyaltySignupView",
        review: "/loyaltyProgram/loyaltyStoreCreditView",
        url_visit: "/loyaltyProgram/loyaltySocialView",
        referral: "/loyaltyProgram/loyaltyReferralView",
        custom_action: "/loyaltyProgram/loyaltySocialView",
        birthday: "/loyaltyProgram/loyaltySignupView",
        add_wallet: "/loyaltyProgram/loyaltySignupView",
    }

    // const earningOptions = [
    //     { id: 1, title: "Follow on Instagram", points: "20 Points", icon: "LogoInstagramIcon" },
    //     { id: 2, title: "Sign up", points: "100 Points", icon: "EyeCheckMarkIcon" },
    //     { id: 3, title: "Follow on TikTok", points: "20 Points", icon: "LogoTiktokIcon" },
    //     { id: 4, title: "Place an order", points: "1 Point for every Rs. 1 spent", icon: "OrderIcon" },
    //     { id: 5, title: "Celebrate a birthday", points: "250 Points", icon: "ConfettiIcon" },
    // ];

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
                        <Text variant="headingMd">
                            {status === null
                                ? "Loading..."
                                : status
                                    ? "This feature is Activated"
                                    : "This feature is Deactivated"}
                        </Text>
                        <Button
                            primary={status === false}
                            tone={status ? "critical" : "success"}
                            onClick={handleToggleStatus}
                            loading={loading}
                            disabled={status === null}
                        >
                            {status ? "Deactivate" : "Activate"}
                        </Button>
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
                    <Box style={{ padding: '16px 16px 16px 16px', backgroundColor: "#F5F5F5" }}>
                        <Text variant="headingMd" as="h6">Customers will earn points through the actions below</Text>
                    </Box>
                    <ResourceList
                        resourceName={{ singular: "earning", plural: "earnings" }}
                        items={earningOptions}
                        headerContent={<Text variant="headingMd" as="h6">Online Store</Text>}
                        showHeader={true}
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
                                            <Button onClick={() => navigate('/loyaltyProgram/loyaltySocialView')} variant="plain">Edit</Button>
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
                    <ResourceList
                        resourceName={{ singular: "earning", plural: "earnings" }}
                        items={socialOptions}
                        headerContent={<Text variant="headingMd" as="h6">Social Rules</Text>}
                        showHeader={true}
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
                                            <Button onClick={() => navigate('/loyaltyProgram/loyaltySocialView')} variant="plain">Edit</Button>
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
                    <Box style={{ padding: '16px 16px 16px 16px' }}>
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
                            const { id, title, type, platform, master_rule_id } = item;
                            const route =
                                NavigateMap[type] || `/loyaltyProgram/loyaltysocialview${window.location.search}`;

                            return (
                                <ResourceItem id={id}>
                                    <InlineStack align="space-between" blockAlign="center">
                                        <Box style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <Box>
                                                <Icon source={RewardIcon} />
                                            </Box>
                                            <Text>{title}</Text>
                                        </Box>
                                        <Button onClick={() => navigate(route, { state: { type, platform, master_rule_id } })} >ADD</Button>
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
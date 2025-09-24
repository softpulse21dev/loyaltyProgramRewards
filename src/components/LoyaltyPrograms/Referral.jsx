import {
    Card,
    Layout,
    Button,
    Text,
    Box,
    Icon,
    BlockStack,
    TextField,
    ResourceList,
    ResourceItem,
} from "@shopify/polaris";
import { EditIcon, GiftCardIcon } from "@shopify/polaris-icons";
import { fetchData } from "../../action";
import { useEffect, useState } from "react";
import RedeemModal from "../RedeemModal";
import { iconsMap } from "../../utils";
import { useNavigate } from "react-router-dom";

const Referral = () => {
    const [referralData, setReferralData] = useState({});
    const [modalData, setModalData] = useState([]);
    const [referralModalActive, setReferralModalActive] = useState(false);
    const [isAdvocate, setIsAdvocate] = useState(false);
    const navigate = useNavigate();

    const GetReferralRuleByIdAPI = async () => {
        const formData = new FormData();
        // formData.append("rule_id", rule.id);
        const response = await fetchData("/get-referral-setting", formData);
        console.log('Get Redeem Rule By ID Response', response.data);
        console.log('response.master_rules', response.master_rules)
        if (response?.status === true) {
            setReferralData(response.data);
            setModalData(response.master_rules);
        }
    }

    useEffect(() => {
        GetReferralRuleByIdAPI();
    }, []);

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
                            <Button variant="plain" onClick={() => { setIsAdvocate(false), setReferralModalActive(true); }}>Add Reward</Button>
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

                            <Box style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <Button variant="plain" primary>Edit</Button>
                                <Button variant="plain" tone="critical" primary>Delete</Button>
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
                        </Box>

                        {/* <ResourceList
                            items={referralData?.referred_friend_reward || []}
                            renderItem={(item) => {
                                const { id, title, icon, redeemed_count } = item;
                                const IconSource = iconsMap[icon] || GiftCardIcon;
                                return (
                                    <ResourceItem key={id}>
                                        <Box style={{ padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #E1E3E5" }}>
                                            <Box>
                                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                    <Icon source={IconSource} />
                                                    <Box>
                                                        <Text variant="bodyMd">{title}</Text>
                                                        <Text variant="bodyMd">{redeemed_count || 0} redeemed so far</Text>
                                                    </Box>
                                                </div>
                                            </Box>
                                            <Box style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <Button variant="plain" primary>Edit</Button>
                                                <Button variant="plain" tone="critical" primary>Delete</Button>
                                            </Box>
                                        </Box>
                                    </ResourceItem>
                                );
                            }}
                        /> */}

                    </Card>

                    <Card padding="0">
                        <Box style={{ backgroundColor: "#F5F5F5", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Text variant="headingMd">Advocate Rewards</Text>
                            <Button variant="plain" onClick={() => { setIsAdvocate(true), setReferralModalActive(true); }}>Add Reward</Button>
                        </Box>

                        <Box style={{ backgroundColor: "#FFF", padding: "10px 16px" }}>
                            <div style={{ marginBottom: "10px" }}>
                                {referralData?.advocate_reward === null ?
                                    <Text variant="bodyMd">Advocate Rewards</Text>
                                    :
                                    <Text variant="bodyMd">No Advocate Rewards</Text>}
                            </div>
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

            {console.log('isAdvocate', isAdvocate)}
            <RedeemModal active={referralModalActive} setActive={setReferralModalActive} data={isAdvocate ? modalData?.advocate_reward : modalData?.referred_friend_reward} />
        </div>
    );
}

export default Referral;
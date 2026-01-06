import { BlockStack, Box, Button, Card, Checkbox, Layout, Page, Select, Text, TextField } from '@shopify/polaris'
import React from 'react'
import { cleanStrictWhitespace } from '../../utils';

const Orders = ({ settingsData, setSettingsData }) => {
    console.log('settingsData orders page', settingsData);

    const ordercalculation = settingsData?.[0]?.order_total_calculation || [];
    const loyaltyEarningsTrigger = settingsData?.[0]?.loyalty_earning_trigger;
    const orderFinancialStatuses = settingsData?.[0]?.reward_financial_statuses || [];
    const globalPrefix = settingsData?.[0]?.discount_code_prefixes?.global_prefix;
    const loyaltyRewardPrefix = settingsData?.[0]?.discount_code_prefixes?.loyalty_prefix;
    const vipTierRewardPrefix = settingsData?.[0]?.discount_code_prefixes?.vip_prefix
    const referralAdvocateRewardPrefix = settingsData?.[0]?.discount_code_prefixes?.advocate_prefix;
    const referralFriendRewardPrefix = settingsData?.[0]?.discount_code_prefixes?.friend_prefix;
    // const [loyaltyEarningsTrigger, setLoyaltyEarningsTrigger] = useState("on_order_placement");
    // const [orderFinancialStatuses, setOrderFinancialStatuses] = useState([]);
    // const [pointsCancelations, setPointsCancelations] = useState([]);
    // const [globalPrefix, setGlobalPrefix] = useState("");
    // const [loyaltyRewardPrefix, setLoyaltyRewardPrefix] = useState("");
    // const [vipTierRewardPrefix, setVipTierRewardPrefix] = useState("");
    // const [referralAdvocateRewardPrefix, setReferralAdvocateRewardPrefix] = useState("");
    // const [referralFriendRewardPrefix, setReferralFriendRewardPrefix] = useState("");

    // Helper function to toggle order calculation values
    const toggleOrderCalculation = (value) => {
        const currentArray = Array.isArray(ordercalculation) ? ordercalculation : [];
        const isIncluded = currentArray.includes(value);
        const newArray = isIncluded
            ? currentArray.filter(item => item !== value)
            : [...currentArray, value];
        setSettingsData([{ ...settingsData[0], order_total_calculation: newArray }]);
    };

    const toggleFinancialStatus = (value) => {
        const currentArray = Array.isArray(orderFinancialStatuses) ? orderFinancialStatuses : [];
        const isIncluded = currentArray.includes(value);
        const newArray = isIncluded
            ? currentArray.filter(item => item !== value)
            : [...currentArray, value];
        setSettingsData([{ ...settingsData[0], reward_financial_statuses: newArray }]);
    }

    return (
        <>
            <Layout.AnnotatedSection title="Order total calculation" description="Select how order totals are calculated for earnings">
                <Card>
                    <BlockStack gap={200}>
                        <Checkbox
                            label="Include shipping in order total"
                            helpText="The total savings amount from applied discounts on the order in the shop currency"
                            checked={Array.isArray(ordercalculation) && ordercalculation.includes("include_discount")}
                            onChange={() => toggleOrderCalculation("include_discount")}
                        />
                        <Checkbox
                            label="Include taxes"
                            helpText="The sum of all the taxes applied to the order in the shop currency"
                            checked={Array.isArray(ordercalculation) && ordercalculation.includes("include_taxes")}
                            onChange={() => toggleOrderCalculation("include_taxes")}
                        />
                        <Checkbox
                            label="Include shipping"
                            helpText="The total shipping price of the order, excluding discounts and returns, in shop and presentment currencies."
                            checked={Array.isArray(ordercalculation) && ordercalculation.includes("include_shipping")}
                            onChange={() => toggleOrderCalculation("include_shipping")}
                        />
                    </BlockStack>
                </Card>
            </Layout.AnnotatedSection>

            <Layout.AnnotatedSection title="Loyalty Earnings Trigger" description="Choose when loyalty earnings should be processed for orders">
                <Card>
                    <BlockStack gap={200}>
                        <Select
                            label="Process loyalty earnings when"
                            helpText="Select whether to process loyalty earnings immediately when an order is placed or wait until the order is fulfilled."
                            options={[
                                { label: "Order is placed (Default)", value: "0" },
                                { label: "Order is fulfilled", value: "1" },
                            ]}
                            value={loyaltyEarningsTrigger}
                            onChange={(value) => setSettingsData([{ ...settingsData[0], loyalty_earning_trigger: value }])}
                        />
                    </BlockStack>
                </Card>
            </Layout.AnnotatedSection >

            <Layout.AnnotatedSection title="Order Financial Statuses for Rewards" description="Select which order financial statuses should qualify for earning rewards">
                <Card>
                    <BlockStack gap={200}>
                        <Checkbox
                            label="Paid"
                            checked={Array.isArray(orderFinancialStatuses) && orderFinancialStatuses.includes("paid")}
                            onChange={() => toggleFinancialStatus("paid")}
                        />
                        <Checkbox
                            label="Authorized"
                            checked={Array.isArray(orderFinancialStatuses) && orderFinancialStatuses.includes("authorized")}
                            onChange={() => toggleFinancialStatus("authorized")}
                        />
                        <Checkbox
                            label="Partially paid"
                            checked={Array.isArray(orderFinancialStatuses) && orderFinancialStatuses.includes("partially_paid")}
                            onChange={() => toggleFinancialStatus("partially_paid")}
                        />
                    </BlockStack>
                </Card>
            </Layout.AnnotatedSection >

            {/* <Layout.AnnotatedSection title="Points Cancelations" description="Select how points are deducted when an order is refunded.">
                <Card>
                    <BlockStack gap={200}>
                        <Checkbox
                            label="Refunded"
                            checked={pointsCancelations.includes("refunded")}
                            onChange={(checked) => setPointsCancelations(checked ? [...pointsCancelations, "refunded"] : pointsCancelations.filter(status => status !== "refunded"))}
                        />
                        <Checkbox
                            label="Partially refunded"
                            checked={pointsCancelations.includes("partially_refunded")}
                            onChange={(checked) => setPointsCancelations(checked ? [...pointsCancelations, "partially_refunded"] : pointsCancelations.filter(status => status !== "partially_refunded"))}
                        />
                        <Checkbox
                            label="Voided"
                            checked={pointsCancelations.includes("voided")}
                            onChange={(checked) => setPointsCancelations(checked ? [...pointsCancelations, "voided"] : pointsCancelations.filter(status => status !== "voided"))}
                        />
                    </BlockStack>
                </Card>
            </Layout.AnnotatedSection > */}

            <Layout.AnnotatedSection title="Discount Code Prefixes" description="Customize prefixes for specific discount codes. Please note that gift cards only support prefixes of up to 8 characters.">
                <Card>
                    <BlockStack gap={300}>
                        <TextField
                            label="Global Prefix"
                            helpText="This prefix will be applied to all discount codes."
                            value={globalPrefix}
                            onChange={(value) => setSettingsData([{ ...settingsData[0], discount_code_prefixes: { ...settingsData[0].discount_code_prefixes, global_prefix: cleanStrictWhitespace(value) } }])}
                        />
                        <TextField
                            label="Loyalty Reward Prefix"
                            helpText="This is the prefix for all loyalty reward discount codes. Leave blank to use the global prefix"
                            value={loyaltyRewardPrefix}
                            onChange={(value) => setSettingsData([{ ...settingsData[0], discount_code_prefixes: { ...settingsData[0].discount_code_prefixes, loyalty_prefix: cleanStrictWhitespace(value) } }])}
                        />
                        <TextField
                            label="VIP Tier Reward Prefix"
                            helpText="This is the prefix for all VIP reward discount codes. Leave blank to use the global prefix"
                            value={vipTierRewardPrefix}
                            onChange={(value) => setSettingsData([{ ...settingsData[0], discount_code_prefixes: { ...settingsData[0].discount_code_prefixes, vip_prefix: cleanStrictWhitespace(value) } }])}
                        />
                        <TextField
                            label="Referral Advocate Reward Prefix"
                            helpText="This is the prefix for all Advocate reward discount codes. Leave blank to use the global prefix"
                            value={referralAdvocateRewardPrefix}
                            onChange={(value) => setSettingsData([{ ...settingsData[0], discount_code_prefixes: { ...settingsData[0].discount_code_prefixes, advocate_prefix: cleanStrictWhitespace(value) } }])}
                        />
                        <TextField
                            label="Referral Friend Reward Prefix"
                            helpText="This is the prefix for all Friend reward discount codes. Leave blank to use the global prefix"
                            value={referralFriendRewardPrefix}
                            onChange={(value) => setSettingsData([{ ...settingsData[0], discount_code_prefixes: { ...settingsData[0].discount_code_prefixes, friend_prefix: cleanStrictWhitespace(value) } }])}
                        />
                    </BlockStack>
                </Card>
            </Layout.AnnotatedSection >



        </>
    )
}

export default Orders

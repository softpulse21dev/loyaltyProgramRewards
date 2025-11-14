import { BlockStack, Box, Button, Card, Checkbox, Layout, Page, Select, Text, TextField } from '@shopify/polaris'
import React, { useState } from 'react'

const Orders = () => {
    const [checked, setChecked] = useState(false);
    const [loyaltyEarningsTrigger, setLoyaltyEarningsTrigger] = useState("on_order_placement");
    const [orderFinancialStatuses, setOrderFinancialStatuses] = useState([]);
    const [pointsCancelations, setPointsCancelations] = useState([]);
    const [globalPrefix, setGlobalPrefix] = useState("");
    const [loyaltyRewardPrefix, setLoyaltyRewardPrefix] = useState("");
    const [vipTierRewardPrefix, setVipTierRewardPrefix] = useState("");
    const [referralAdvocateRewardPrefix, setReferralAdvocateRewardPrefix] = useState("");
    const [referralFriendRewardPrefix, setReferralFriendRewardPrefix] = useState("");
    return (
        <>
            <Layout.AnnotatedSection title="Order total calculation" description="Select how order totals are calculated for earnings   ">
                <Card>
                    <BlockStack gap={200}>
                        <Checkbox
                            label="Include shipping in order total"
                            helpText="The total savings amount from applied discounts on the order in the shop currency"
                            checked={checked}
                            onChange={() => setChecked(!checked)}
                        />
                        <Checkbox
                            label="Include taxes"
                            helpText="The sum of all the taxes applied to the order in the shop currency"
                            checked={checked}
                            onChange={() => setChecked(!checked)}
                        />
                        <Checkbox
                            label="Include shipping"
                            helpText="The total shipping price of the order, excluding discounts and returns, in shop and presentment currencies."
                            checked={checked}
                            onChange={() => setChecked(!checked)}
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
                                { label: "Order is placed (Default)", value: "on_order_placement" },
                                { label: "Order is fulfilled", value: "on_order_fulfilled" },
                            ]}
                            value={loyaltyEarningsTrigger}
                            onChange={(value) => setLoyaltyEarningsTrigger(value)}
                        />
                    </BlockStack>
                </Card>
            </Layout.AnnotatedSection >

            <Layout.AnnotatedSection title="Order Financial Statuses for Rewards" description="Select which order financial statuses should qualify for earning rewards">
                <Card>
                    <BlockStack gap={200}>
                        <Checkbox
                            label="Paid"
                            checked={orderFinancialStatuses.includes("paid")}
                            onChange={(checked) => setOrderFinancialStatuses(checked ? [...orderFinancialStatuses, "paid"] : orderFinancialStatuses.filter(status => status !== "paid"))}
                        />
                        <Checkbox
                            label="Authorized"
                            checked={orderFinancialStatuses.includes("authorized")}
                            onChange={(checked) => setOrderFinancialStatuses(checked ? [...orderFinancialStatuses, "authorized"] : orderFinancialStatuses.filter(status => status !== "authorized"))}
                        />
                        <Checkbox
                            label="Partially paid"
                            checked={orderFinancialStatuses.includes("partially_paid")}
                            onChange={(checked) => setOrderFinancialStatuses(checked ? [...orderFinancialStatuses, "partially_paid"] : orderFinancialStatuses.filter(status => status !== "partially_paid"))}
                        />
                    </BlockStack>
                </Card>
            </Layout.AnnotatedSection >

            <Layout.AnnotatedSection title="Points Cancelations" description="Select how points are deducted when an order is refunded.">
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
            </Layout.AnnotatedSection >

            <Layout.AnnotatedSection title="Discount Code Prefixes" description="Customize prefixes for specific discount codes. Please note that gift cards only support prefixes of up to 8 characters.">
                <Card>
                    <BlockStack gap={300}>
                        <TextField
                            label="Global Prefix"
                            helpText="This prefix will be applied to all discount codes."
                            value={globalPrefix}
                            onChange={(value) => setGlobalPrefix(value)}
                        />
                        <TextField
                            label="Loyalty Reward Prefix"
                            helpText="This is the prefix for all loyalty reward discount codes. Leave blank to use the global prefix"
                            value={loyaltyRewardPrefix}
                            onChange={(value) => setLoyaltyRewardPrefix(value)}
                        />
                        <TextField
                            label="VIP Tier Reward Prefix"
                            helpText="This is the prefix for all VIP reward discount codes. Leave blank to use the global prefix"
                            value={vipTierRewardPrefix}
                            onChange={(value) => setVipTierRewardPrefix(value)}
                        />
                        <TextField
                            label="Referral Advocate Reward Prefix"
                            helpText="This is the prefix for all Advocate reward discount codes. Leave blank to use the global prefix"
                            value={referralAdvocateRewardPrefix}
                            onChange={(value) => setReferralAdvocateRewardPrefix(value)}
                        />
                        <TextField
                            label="Referral Friend Reward Prefix"
                            helpText="This is the prefix for all Friend reward discount codes. Leave blank to use the global prefix"
                            value={referralFriendRewardPrefix}
                            onChange={(value) => setReferralFriendRewardPrefix(value)}
                        />
                    </BlockStack>
                </Card>
            </Layout.AnnotatedSection >



        </>
    )
}

export default Orders

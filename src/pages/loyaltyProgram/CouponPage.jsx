import { Avatar, Badge, BlockStack, Box, Button, Card, Checkbox, FormLayout, Grid, Layout, Page, RadioButton, Text, TextField } from '@shopify/polaris'
import { DeleteIcon } from '@shopify/polaris-icons';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CollectionModal from '../../components/CollectionModal';
import { fetchData } from '../../action';
import ProductModal from '../../components/ProductModal';
import { useDispatch } from 'react-redux';
import { addData } from '../../redux/action';

const CouponPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { rule, edit, referralRule, navigateTo, localSave } = location.state || {};
    console.log('localSave', localSave)
    console.log('navigateTo coupons', navigateTo)
    console.log('rule', rule)
    const [rewardTitle, setRewardTitle] = useState('');
    const [pointsAmount, setPointsAmount] = useState(100);
    const [rewardExpiration, setRewardExpiration] = useState(0);
    const [collectionModalOpen, setCollectionModalOpen] = useState(false);
    const [productModalOpen, setProductModalOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [loading, setLoading] = useState(true);
    const [ruleId, setRuleId] = useState('');
    const [ruleType, setRuleType] = useState('');
    const dispatch = useDispatch();

    const [settings_json, setSettingsJson] = useState({
        points_type: 'fixed',
        reward_value: 1,
        min_requirement: 'none',
        min_order_value_in_cents: 0,
        applies_to: 'entire',
        max_points_to_spend: false,
        max_points_to_spend_value: 0,
        min_points_to_redeem: false,
        min_points_to_redeem_value: 0,
        purchase_type: 'one_time',
        number_of_times_on_recurring_purchases: 0,
        collections: [],
        min_order_quantity: 0,
        min_order_value_excludes_free_product: false,
        products: [],
    });

    useEffect(() => {
        if (localSave) {
            return;
        }
        if (edit) {
            if (referralRule) {
                GetReferralRuleByIdAPI();
            } else {
                GetRedeemRuleByIdAPI();
            }
        }
    }, [edit, rule, referralRule, localSave]);

    const addDatas = {
        master_rule_id: rule.master_rule_id,
        status: status,
        points: pointsAmount,
        title: rewardTitle,
        settings_json: settings_json,
        expiration_days: rewardExpiration,
    }

    const handleAddLocalData = () => {
        dispatch(addData(addDatas));
        navigate('/loyaltyProgram/tierview');
    }

    // Redeem API

    const AddRedeemRuleAPI = async () => {
        const formData = new FormData();
        formData.append("master_rule_id", rule.master_rule_id);
        formData.append("status", status);
        formData.append("points", pointsAmount);
        formData.append("title", rewardTitle);
        formData.append("settings_json", JSON.stringify(settings_json));
        formData.append("expiration_days", rewardExpiration);
        const response = await fetchData("/add-merchant-redeeming-rules", formData);
        console.log('Add Redeem Rule Response', response);
        if (response?.status === true) {
            navigate('/loyaltyProgram');
            shopify.toast.show(response?.message, { duration: 2000 });
        } else {
            console.error('Add Redeem Rule Error', response);
            shopify.toast.show(response?.message, { duration: 2000, isError: true });
        }
    }

    const UpdateRedeemRuleAPI = async () => {
        const formData = new FormData();
        formData.append("rule_id", ruleId);
        formData.append("status", status);
        formData.append("points", pointsAmount);
        formData.append("title", rewardTitle);
        formData.append("settings_json", JSON.stringify(settings_json));
        formData.append("expiration_days", rewardExpiration);
        const response = await fetchData("/update-merchant-redeeming-rules", formData);
        console.log('Update Redeem Rule Response', response);
        if (response?.status === true) {
            navigate('/loyaltyProgram');
            shopify.toast.show(response?.message, { duration: 2000 });
        } else {
            console.error('Update Redeem Rule Error', response);
            shopify.toast.show(response?.message, { duration: 2000, isError: true });
        }
    }

    const DeleteRedeemRuleAPI = async (id) => {
        console.log('id', id)
        const formData = new FormData();
        formData.append("rule_id", id);
        const response = await fetchData("/delete-merchant-redeeming-rules", formData);
        console.log('Delete Redeem Rule Response', response);
        if (response?.status === true) {
            navigate('/loyaltyProgram');
            shopify.toast.show(response?.message, { duration: 2000 });
        } else {
            console.error('Delete Redeem Rule Error', response);
            shopify.toast.show(response?.message, { duration: 2000, isError: true });
        }
    }

    const GetRedeemRuleByIdAPI = async () => {
        setLoading(true);
        const formData = new FormData();
        formData.append("rule_id", rule.id);
        const response = await fetchData("/get-merchant-redeeming-rules-by-id", formData);
        console.log('Get Redeem Rule By ID Response', response);
        if (response?.status === true) {
            setSettingsJson(response.data.settings_json);
            setRewardTitle(response.data.title);
            setPointsAmount(response.data.points);
            setRewardExpiration(response.data.expiration_days);
            setStatus(response.data.status);
            setRuleId(response.data.id);
            setLoading(false);
        } else {
            console.error('Get Redeem Rule By ID Error', response);
            shopify.toast.show(response?.message, { duration: 2000, isError: true });
            setLoading(false);
        }
    }

    // Referrals API

    const AddReferralRuleAPI = async () => {
        try {
            const formData = new FormData();
            formData.append("master_rule_id", rule.master_rule_id);
            formData.append("status", status);
            formData.append("points", pointsAmount);
            formData.append("title", rewardTitle);
            formData.append("settings_json", JSON.stringify(settings_json));
            formData.append("expiration_days", rewardExpiration);
            formData.append("referral_setting_id", rule.referral_setting_id);
            formData.append("rule_type", rule.rule_type);
            const response = await fetchData("/add-referral-rule", formData);
            console.log('Add Referral Rule Response', response);
            if (response?.status === true) {
                navigate('/loyaltyProgram', { state: { navigateTo: navigateTo } });
                shopify.toast.show(response?.message, { duration: 2000 });
            } else {
                console.error('Add Referral Rule Error', response);
                shopify.toast.show(response?.message, { duration: 2000, isError: true });
            }
        } catch (error) {
            console.error('Add Referral Rule Error', error);
        } finally {
            setLoading(false);
        }
    }

    const UpdateReferralRuleAPI = async () => {
        try {
            const formData = new FormData();
            formData.append("master_rule_id", rule.master_rule_id);
            formData.append("status", status);
            formData.append("points", pointsAmount);
            formData.append("title", rewardTitle);
            formData.append("settings_json", JSON.stringify(settings_json));
            formData.append("expiration_days", rewardExpiration);
            formData.append("referral_setting_id", rule.referral_setting_id);
            formData.append("referral_rule_id", rule.referral_rule_id);
            formData.append("rule_type", ruleType);
            const response = await fetchData("/update-referral-rule", formData);
            console.log('Update Referral Rule Response', response);
            if (response?.status === true) {
                navigate('/loyaltyProgram', { state: { navigateTo: navigateTo } });
                shopify.toast.show(response?.message, { duration: 2000 });
            } else {
                console.error('Update Referral Rule Error', response);
                shopify.toast.show(response?.message, { duration: 2000, isError: true });
            }
        } catch (error) {
            console.error('Update Referral Rule Error', error);
        } finally {
            setLoading(false);
        }
    }

    const GetReferralRuleByIdAPI = async () => {
        try {
            const formData = new FormData();
            formData.append("referral_rule_id", rule.referral_rule_id);
            formData.append("referral_setting_id", rule.referral_setting_id);
            const response = await fetchData("/get-referral-rule-by-id", formData);
            console.log('Get Referral Rule By ID Response', response);
            if (response?.status === true) {
                setPointsAmount(response.data.points);
                setRewardTitle(response.data.title);
                setSettingsJson(response.data.rule_data);
                setRewardExpiration(response.data.expiration_days);
                setStatus(response.data.status);
                setRuleId(response.data.id);
                setRuleType(response.data.rule_type);
                // setLoading(false);
            }
        } catch (error) {
            console.error('Get Referral Rule By ID Error', error);
        } finally {
            // setLoading(false);
        }
    }

    const DeleteReferralRuleAPI = async () => {
        try {
            const formData = new FormData();
            formData.append("referral_rule_id", rule.referral_rule_id);
            formData.append("referral_setting_id", rule.referral_setting_id);
            const response = await fetchData("/delete-referral-reward", formData);
            console.log('Delete Referral Rule Response', response);
            if (response?.status === true) {
                navigate('/loyaltyProgram', { state: { navigateTo: navigateTo } });
                shopify.toast.show(response?.message, { duration: 2000 });
            }
            else {
                console.error('Delete Referral Rule Error', response);
                shopify.toast.show(response?.message, { duration: 2000, isError: true });
            }
        } catch (error) {
            console.error('Delete Referral Rule Error', error);
        } finally {
            setLoading(false);
        }
    }

    const handleStatusChange = () => {
        setStatus(prevStatus => prevStatus === true ? false : true);
    };

    return (
        <Page
            backAction={{ content: 'Back', onAction: () => navigate('/loyaltyProgram', { state: { navigateTo: navigateTo } }) }}
            title={rule?.title || "Coupon"}
            secondaryActions={edit ? <Button tone='critical' icon={DeleteIcon} onClick={() => { referralRule ? DeleteReferralRuleAPI(ruleId) : DeleteRedeemRuleAPI(ruleId) }}>Delete</Button> : ''}
            primaryAction={{ content: edit ? "Update" : "Save", onAction: () => { if (edit) { referralRule ? UpdateReferralRuleAPI() : UpdateRedeemRuleAPI() } else { localSave ? handleAddLocalData() : referralRule ? AddReferralRuleAPI() : AddRedeemRuleAPI() } } }}
        >
            <Layout>
                <Layout.Section>
                    <Grid>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 4, md: 4, lg: 8, xl: 8 }}>
                            <BlockStack gap={400}>
                                <Card>
                                    <BlockStack gap={300}>
                                        <Text variant='headingSm' as="span">Reward Title</Text>
                                        <TextField
                                            value={rewardTitle}
                                            onChange={(value) => setRewardTitle(value)}
                                            maxLength={255}
                                        />
                                    </BlockStack>
                                </Card>

                                {rule.type === "amount_discount" && (
                                    <Card>
                                        <Box style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            <Text variant='headingMd' as="span">Points Type</Text>
                                            <BlockStack>
                                                <RadioButton
                                                    label="Fixed amount of points"
                                                    checked={settings_json?.points_type === 'fixed'}
                                                    onChange={() => setSettingsJson({ ...settings_json, points_type: 'fixed' })}
                                                />
                                                <RadioButton
                                                    label="Incremented points"
                                                    checked={settings_json?.points_type === 'multiplier'}
                                                    onChange={() => setSettingsJson({ ...settings_json, points_type: 'multiplier' })}
                                                />
                                            </BlockStack>
                                        </Box>
                                    </Card>
                                )}

                                {rule.type === "free_product" && (
                                    <Card>
                                        <Box style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            <Text variant='headingMd' as="span">Product</Text>
                                            <div>
                                                <Button variant='secondary' onClick={() => { setProductModalOpen(true) }}><Text variant='bodyMd'>Select Product</Text></Button>
                                            </div>
                                            <div>
                                                <div>
                                                    {settings_json.products.map((product) => (
                                                        <div key={product.product_id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                            <Avatar source={product.img} customer />
                                                            <Text variant='bodyMd'>{product.title}</Text>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </Box>
                                    </Card>
                                )}

                                <Card>
                                    <BlockStack gap={300}>
                                        <Text variant='headingMd' as="span">Reward</Text>
                                        {(rule.type !== "store_credit") && (
                                            <>
                                                {settings_json?.points_type === 'fixed' && (
                                                    <>
                                                        <FormLayout>
                                                            <FormLayout.Group>
                                                                <TextField
                                                                    label="Points amount"
                                                                    type="number"
                                                                    value={pointsAmount}
                                                                    onChange={(value) => setPointsAmount(value)}
                                                                    autoComplete="off"
                                                                    suffix="points"
                                                                />
                                                                {rule.type !== "free_shipping" && (
                                                                    <TextField
                                                                        label="Discount"
                                                                        type="number"
                                                                        prefix={rule.type !== "percentage_discount" ? "$" : ""}
                                                                        suffix={rule.type === "percentage_discount" ? "%" : ""}
                                                                        value={settings_json.reward_value}
                                                                        onChange={(value) => setSettingsJson({ ...settings_json, reward_value: value })}
                                                                        autoComplete="off"
                                                                    />
                                                                )}
                                                            </FormLayout.Group>
                                                        </FormLayout>
                                                        {rule.type !== "free_shipping" && (
                                                            <Text variant='bodyMd' tone='subdued'>Based on your cost per point, {pointsAmount} points is equal to Rs. {settings_json.reward_value}</Text>
                                                        )}
                                                    </>
                                                )}

                                                {settings_json?.points_type === 'multiplier' && (
                                                    <>
                                                        <FormLayout>
                                                            <FormLayout.Group>
                                                                <TextField
                                                                    label="Increment points value"
                                                                    type="number"
                                                                    value={pointsAmount}
                                                                    onChange={(value) => setPointsAmount(value)}
                                                                    autoComplete="off"
                                                                    suffix="points"
                                                                />
                                                                <TextField
                                                                    label="Customer gets"
                                                                    type="number"
                                                                    prefix="$"
                                                                    value={settings_json.reward_value}
                                                                    onChange={(value) => setSettingsJson({ ...settings_json, reward_value: value })}
                                                                    autoComplete="off"
                                                                />
                                                            </FormLayout.Group>
                                                        </FormLayout>
                                                        <Text variant='bodyMd' tone='subdued'>Based on your cost per point, {pointsAmount} points is equal to Rs. {settings_json.reward_value}</Text>

                                                        <Checkbox
                                                            label="Set a minimum amount of points required to redeem this reward"
                                                            checked={settings_json.min_points_to_redeem}
                                                            onChange={() => setSettingsJson({ ...settings_json, min_points_to_redeem: !settings_json.min_points_to_redeem })}
                                                        />
                                                        {settings_json.min_points_to_redeem && (
                                                            <TextField
                                                                type="number"
                                                                value={settings_json.min_points_to_redeem_value}
                                                                onChange={(value) => setSettingsJson({ ...settings_json, min_points_to_redeem_value: value })}
                                                                suffix="points"
                                                            />
                                                        )}

                                                        <Checkbox
                                                            label="Set a maximum amount of points required to redeem this reward"
                                                            checked={settings_json.max_points_to_spend}
                                                            onChange={() => setSettingsJson({ ...settings_json, max_points_to_spend: !settings_json.max_points_to_spend })}
                                                        />
                                                        {settings_json.max_points_to_spend && (
                                                            <TextField
                                                                type="number"
                                                                value={settings_json.max_points_to_spend_value}
                                                                onChange={(value) => setSettingsJson({ ...settings_json, max_points_to_spend_value: value })}
                                                                suffix="points"
                                                            />
                                                        )}
                                                    </>
                                                )}
                                            </>
                                        )}

                                        {rule.type === "store_credit" && (
                                            <TextField
                                                label="Points amount"
                                                type="number"
                                                value={pointsAmount}
                                                onChange={(value) => setPointsAmount(value)}
                                                autoComplete="off"
                                                suffix="points"
                                            />
                                        )}



                                        {/* only for free shipping same used in amount discount  */}
                                        {rule.type === "free_shipping" && (
                                            <>
                                                <Checkbox
                                                    label="Set a maximum shipping amount this reward can be applied to"
                                                    checked={settings_json.max_points_to_spend}
                                                    onChange={() => setSettingsJson({ ...settings_json, max_points_to_spend: !settings_json.max_points_to_spend })}
                                                />
                                                {settings_json.max_points_to_spend && (
                                                    <TextField
                                                        type="number"
                                                        value={settings_json.max_points_to_spend_value}
                                                        onChange={(value) => setSettingsJson({ ...settings_json, max_points_to_spend_value: value })}
                                                        prefix="Rs."
                                                    />
                                                )}
                                            </>
                                        )}


                                    </BlockStack>
                                </Card>


                                {/* {(rule.type !== "store_credit") && (
                                    <Card>
                                        <BlockStack gap={300}>
                                            <Text variant='headingMd' as="span">Referral Reward</Text>
                                        </BlockStack>
                                    </Card>
                                )} */}


                                {(rule.type === "amount_discount" || rule.type === "percentage_discount") && (
                                    <Card>
                                        <Box style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            <Text variant='headingMd' as="span">Apply to</Text>
                                            <BlockStack>
                                                <RadioButton
                                                    label="Entire order"
                                                    checked={settings_json?.applies_to === 'entire'}
                                                    onChange={() => setSettingsJson({ ...settings_json, applies_to: 'entire' })}
                                                />
                                                <RadioButton
                                                    label="Collection"
                                                    checked={settings_json?.applies_to === 'collection'}
                                                    onChange={() => { setSettingsJson({ ...settings_json, applies_to: 'collection' }) }}
                                                    onFocus={() => {
                                                        setCollectionModalOpen(true);
                                                    }}
                                                />
                                                {settings_json?.applies_to === 'collection' && (
                                                    settings_json?.collections?.length > 0 && (
                                                        <>                                            {
                                                            settings_json?.collections.map((col) => (
                                                                <div key={col.collection_id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 3 }}>
                                                                    <Avatar source={col.image} customer />
                                                                    <Text>{col.name}</Text>
                                                                </div>
                                                            ))
                                                        }
                                                        </>
                                                    ))}
                                            </BlockStack>
                                        </Box>
                                    </Card>
                                )}

                                {(rule.type !== "store_credit") && (
                                    <Card>
                                        <Box style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            <Text variant='headingMd' as="span">Purchase Type (optional)</Text>
                                            <BlockStack>
                                                <Text>Additional settings for stores that have installed any "subscription" app</Text>
                                                <RadioButton
                                                    label="One-time Purchase"
                                                    checked={settings_json?.purchase_type === 'one_time'}
                                                    onChange={() => setSettingsJson({ ...settings_json, purchase_type: 'one_time' })}
                                                />
                                                <RadioButton
                                                    label="Subscription"
                                                    checked={settings_json?.purchase_type === 'subscription'}
                                                    onChange={() => setSettingsJson({ ...settings_json, purchase_type: 'subscription' })}
                                                />
                                                <RadioButton
                                                    label="Both"
                                                    checked={settings_json?.purchase_type === 'both'}
                                                    onChange={() => setSettingsJson({ ...settings_json, purchase_type: 'both' })}
                                                />
                                            </BlockStack>
                                        </Box>
                                    </Card>
                                )}

                                {(settings_json?.purchase_type === 'subscription' || settings_json?.purchase_type === 'both') && (
                                    <>
                                        <Card>
                                            <BlockStack gap={300}>
                                                <Text variant='headingSm' as="span">Recurring Payment Options</Text>
                                                <TextField
                                                    type="number"
                                                    value={settings_json?.number_of_times_on_recurring_purchases}
                                                    onChange={(value) => setSettingsJson({ ...settings_json, number_of_times_on_recurring_purchases: value })}
                                                    helpText='The number of times a discount applies on recurring purchases. For example, if you set this field to 3, then the discount only applies to the first three billing cycles of a subscription. If you specify 0, then the discount applies indefinitely.'
                                                />
                                            </BlockStack>
                                        </Card>
                                    </>
                                )}

                                {(rule.type !== "store_credit") && (
                                    <Card>
                                        <BlockStack gap={300}>
                                            <Text variant='headingMd' >Reward Expiration</Text>
                                            <TextField
                                                type="number"
                                                helpText="The number of days after which the reward expires"
                                                value={rewardExpiration}
                                                onChange={(value) => setRewardExpiration(value)}
                                                autoComplete="off"
                                                suffix="Days"
                                            />
                                        </BlockStack>
                                    </Card>
                                )}

                            </BlockStack>
                        </Grid.Cell>

                        <Grid.Cell columnSpan={{ xs: 6, sm: 2, md: 2, lg: 4, xl: 4 }}>
                            <BlockStack gap={300}>
                                <Card>
                                    <Text variant='headingMd' as="span">Reward Summary</Text>
                                    <ul style={{ listStyle: 'inherit', paddingInline: 20 }}>
                                        <li><p>Applies to all orders</p></li>
                                    </ul>
                                </Card>

                                <Card>
                                    <BlockStack gap={300}>
                                        <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <Text variant='headingMd' as="span">Status</Text>
                                            <Badge tone="critical">
                                                active
                                            </Badge>
                                        </Box>
                                        <Box>
                                            <div className="toggle-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <label className="switch">
                                                    <input
                                                        type="checkbox"
                                                        checked={status === true}
                                                        onChange={handleStatusChange}
                                                    />
                                                    <span className="slider"></span>
                                                </label>
                                            </div>
                                        </Box>
                                    </BlockStack>
                                </Card>
                            </BlockStack>
                        </Grid.Cell>
                    </Grid>
                </Layout.Section>
            </Layout>

            <CollectionModal
                open={collectionModalOpen}
                onClose={() => setCollectionModalOpen(false)}
                initialSelectedCollections={settings_json?.collections}
                onSave={(selected) => {
                    console.log('selected ll', selected)
                    setSettingsJson({
                        ...settings_json,
                        collections: selected,
                    });
                    setCollectionModalOpen(false);
                }}
            />

            <ProductModal
                open={productModalOpen}
                onClose={() => setProductModalOpen(false)}
                selectedProducts={settings_json?.products}
                onSave={(selected) => {
                    console.log('selected product12', selected)
                    setSettingsJson({
                        ...settings_json,
                        products: selected,
                    })
                }}
            />
        </Page>
    )
}

export default CouponPage

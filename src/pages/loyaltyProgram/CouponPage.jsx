import { Avatar, Badge, BlockStack, Box, Button, Card, Checkbox, FormLayout, Grid, Layout, Page, RadioButton, Text, TextField } from '@shopify/polaris'
import { DeleteIcon } from '@shopify/polaris-icons';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CollectionModal from '../../components/CollectionModal';
import { fetchData } from '../../action';
import ProductModal from '../../components/ProductModal';
import { useDispatch, useSelector } from 'react-redux';
import { addData, DeleteData, UpdateData } from '../../redux/action';

const CouponPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { rule, edit, referralRule, navigateTo, localSave, isTierRewardEdit } = location.state || {};

    // Logic to determine if we should show Points inputs
    // If it is LocalSave (VIP Tier) or ReferralRule, we hide points logic.
    const showPointsSystem = !localSave && !referralRule;

    console.log('localSave', localSave)
    console.log('navigateTo coupons', navigateTo)
    console.log('rule local', rule)

    const [rewardTitle, setRewardTitle] = useState('');
    const [pointsAmount, setPointsAmount] = useState(100);
    const [rewardExpiration, setRewardExpiration] = useState(1);
    const [collectionModalOpen, setCollectionModalOpen] = useState(false);
    const [productModalOpen, setProductModalOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [loading, setLoading] = useState(true);
    const [ruleId, setRuleId] = useState('');
    const [ruleType, setRuleType] = useState('');
    const [clientId, setClientId] = useState(null);
    const [validationError, setValidationError] = useState();
    const Data = useSelector((state) => state.merchantSettings.Data);
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
        // --- LOCAL EDIT MODE ---
        if (edit && isTierRewardEdit && rule) {
            setRewardTitle(rule.title || '');
            setPointsAmount(rule.points || 100);
            setRewardExpiration(rule.expiration_days || 0);
            setStatus(rule.status === true);
            setSettingsJson(rule.settings_json || {});
            setClientId(rule.clientId);
            setRuleType(rule.type);
            setLoading(false);
            return;
        }

        // --- API-BASED EDIT MODE ---
        if (edit) {
            setLoading(true);
            if (referralRule) {
                GetReferralRuleByIdAPI();
            } else {
                GetRedeemRuleByIdAPI();
            }
        } else {
            setLoading(false);
        }
    }, [edit, rule, referralRule, isTierRewardEdit]);

    // Helper to clean settings_json for payload
    const getCleanSettings = () => {
        const cleanSettings = { ...settings_json };
        // If we are in Referral or VIP mode, we don't need points_type
        if (!showPointsSystem) {
            delete cleanSettings.points_type;
        }
        return cleanSettings;
    }

    const handleAddLocalData = () => {
        if (handleValidation()) {
            return;
        }

        // Construct Payload
        const payload = {
            master_rule_id: rule.master_rule_id,
            icon: rule.icon,
            status: status,
            title: rewardTitle,
            settings_json: getCleanSettings(),
            expiration_days: rewardExpiration,
            type: rule.type,
        };

        // Only add points if we are in standard mode
        if (showPointsSystem) {
            payload.points = pointsAmount;
        }

        const addDatas = [payload];

        dispatch(addData(addDatas));
        navigate('/loyaltyProgram/tierview', { state: { navigateTo: navigateTo } });
    }

    const handleUpdateLocalData = () => {
        if (handleValidation()) {
            return;
        }

        const updatedData = {
            ...rule,
            clientId: clientId,
            status: status,
            title: rewardTitle,
            settings_json: getCleanSettings(),
            expiration_days: rewardExpiration,
        };

        if (showPointsSystem) {
            updatedData.points = pointsAmount;
        }

        dispatch(UpdateData(updatedData));
        navigate('/loyaltyProgram/tierview', { state: { navigateTo: navigateTo } });
    };

    const handleDeleteLocalData = () => {
        dispatch(DeleteData(rule.clientId));
        navigate('/loyaltyProgram/tierview', { state: { navigateTo: navigateTo } });
    };

    // Redeem API
    const AddRedeemRuleAPI = async () => {
        if (handleValidation()) {
            return;
        }
        const formData = new FormData();
        formData.append("master_rule_id", rule.master_rule_id);
        formData.append("status", status);
        formData.append("points", pointsAmount);
        formData.append("title", rewardTitle);
        formData.append("settings_json", JSON.stringify(settings_json));
        formData.append("expiration_days", rewardExpiration);
        const response = await fetchData("/add-merchant-redeeming-rules", formData);

        if (response?.status === true) {
            navigate('/loyaltyProgram');
            shopify.toast.show(response?.message, { duration: 2000 });
        } else {
            shopify.toast.show(response?.message, { duration: 2000, isError: true });
        }
    }

    const UpdateRedeemRuleAPI = async () => {
        if (handleValidation()) {
            return;
        }
        const formData = new FormData();
        formData.append("rule_id", ruleId);
        formData.append("status", status);
        formData.append("points", pointsAmount);
        formData.append("title", rewardTitle);
        formData.append("settings_json", JSON.stringify(settings_json));
        formData.append("expiration_days", rewardExpiration);
        const response = await fetchData("/update-merchant-redeeming-rules", formData);

        if (response?.status === true) {
            navigate('/loyaltyProgram');
            shopify.toast.show(response?.message, { duration: 2000 });
        } else {
            shopify.toast.show(response?.message, { duration: 2000, isError: true });
        }
    }

    const DeleteRedeemRuleAPI = async (id) => {
        const formData = new FormData();
        formData.append("rule_id", id);
        const response = await fetchData("/delete-merchant-redeeming-rules", formData);
        if (response?.status === true) {
            navigate('/loyaltyProgram');
            shopify.toast.show(response?.message, { duration: 2000 });
        } else {
            shopify.toast.show(response?.message, { duration: 2000, isError: true });
        }
    }

    const GetRedeemRuleByIdAPI = async () => {
        setLoading(true);
        const formData = new FormData();
        formData.append("rule_id", rule.id);
        const response = await fetchData("/get-merchant-redeeming-rules-by-id", formData);
        if (response?.status === true) {
            setSettingsJson(response.data.settings_json);
            setRewardTitle(response.data.title);
            setPointsAmount(response.data.points);
            setRewardExpiration(response.data.expiration_days);
            setStatus(response.data.status);
            setRuleId(response.data.id);
            setLoading(false);
        } else {
            shopify.toast.show(response?.message, { duration: 2000, isError: true });
            setLoading(false);
        }
    }

    // Referrals API
    const AddReferralRuleAPI = async () => {
        if (handleValidation()) {
            return;
        }
        try {
            const formData = new FormData();
            formData.append("master_rule_id", rule.master_rule_id);
            formData.append("status", status);
            // formData.append("points", pointsAmount);
            formData.append("title", rewardTitle);
            formData.append("settings_json", JSON.stringify(getCleanSettings()));
            formData.append("expiration_days", rewardExpiration);
            formData.append("referral_setting_id", rule.referral_setting_id);
            formData.append("rule_type", rule.rule_type);
            const response = await fetchData("/add-referral-rule", formData);
            if (response?.status === true) {
                navigate('/loyaltyProgram', { state: { navigateTo: navigateTo } });
                shopify.toast.show(response?.message, { duration: 2000 });
            } else {
                shopify.toast.show(response?.message, { duration: 2000, isError: true });
            }
        } catch (error) {
            console.error('Add Referral Rule Error', error);
        } finally {
            setLoading(false);
        }
    }

    const UpdateReferralRuleAPI = async () => {
        if (handleValidation()) {
            return;
        }
        try {
            const formData = new FormData();
            formData.append("master_rule_id", rule.master_rule_id);
            formData.append("status", status);
            // formData.append("points", pointsAmount);
            formData.append("title", rewardTitle);
            formData.append("settings_json", JSON.stringify(getCleanSettings()));
            formData.append("expiration_days", rewardExpiration);
            formData.append("referral_setting_id", rule.referral_setting_id);
            formData.append("referral_rule_id", rule.referral_rule_id);
            formData.append("rule_type", ruleType);
            const response = await fetchData("/update-referral-rule", formData);
            if (response?.status === true) {
                navigate('/loyaltyProgram', { state: { navigateTo: navigateTo } });
                shopify.toast.show(response?.message, { duration: 2000 });
            } else {
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
            if (response?.status === true) {
                setPointsAmount(response.data.points);
                setRewardTitle(response.data.title);
                setSettingsJson(response.data.rule_data);
                setRewardExpiration(response.data.expiration_days);
                setStatus(response.data.status);
                setRuleId(response.data.id);
                setRuleType(response.data.rule_type);
            }
        } catch (error) {
            console.error('Get Referral Rule By ID Error', error);
        }
    }

    const DeleteReferralRuleAPI = async () => {
        try {
            const formData = new FormData();
            formData.append("referral_rule_id", rule.referral_rule_id);
            formData.append("referral_setting_id", rule.referral_setting_id);
            const response = await fetchData("/delete-referral-reward", formData);
            if (response?.status === true) {
                navigate('/loyaltyProgram', { state: { navigateTo: navigateTo } });
                shopify.toast.show(response?.message, { duration: 2000 });
            }
            else {
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

    const handleValidation = () => {
        const newErrors = {
            rewardTitle: '',
            pointsAmount: '',
            rewardValue: '',
        };
        let isError = false;

        if (localSave) {
            if (Data.find(item => item.title === rewardTitle)) {
                newErrors.rewardTitle = "Reward title already exists";
                isError = true;
            }
        }

        if (rewardTitle.replace(/\s+/g, " ").trim() === "") {
            newErrors.rewardTitle = "Reward title is required";
            isError = true;
        }

        // Only validate points if we are showing the points system (Standard Mode)
        if (showPointsSystem) {
            if (pointsAmount === '' || pointsAmount === null || Number(pointsAmount) <= 0) {
                newErrors.pointsAmount = "Points must be a number greater than 0";
                isError = true;
            }
        }

        if (settings_json.reward_value === '' || settings_json.reward_value === null || Number(settings_json.reward_value) <= 0) {
            newErrors.rewardValue = "Discount value must be a number greater than 0";
            isError = true;
        }

        if (showPointsSystem && settings_json?.points_type === 'multiplier') {
            if (settings_json.min_points_to_redeem === true) {
                if (settings_json.min_points_to_redeem_value === '' || settings_json.min_points_to_redeem_value === null || Number(settings_json.min_points_to_redeem_value) <= 0) {
                    newErrors.minPointsToRedeemValue = "Minimum points to redeem value must be a number greater than 0";
                    isError = true;
                }
            }
            if (settings_json.max_points_to_spend === true) {
                if (settings_json.max_points_to_spend_value === '' || settings_json.max_points_to_spend_value === null || Number(settings_json.max_points_to_spend_value) <= 0) {
                    newErrors.maxPointsToSpendValue = "Maximum points to spend value must be a number greater than 0";
                    isError = true;
                }
            }
        }

        if (rule.type === "amount_discount" || rule.type === "percentage_discount") {
            if (settings_json?.applies_to === 'collection') {
                if (settings_json.collections.length < 1) {
                    newErrors.collections = "Collection is required";
                    isError = true;
                }
            }
        }

        if (settings_json.min_requirement === 'min_purchase_amount') {
            if (settings_json.min_order_value_in_cents === '' || settings_json.min_order_value_in_cents === null || Number(settings_json.min_order_value_in_cents) <= 0) {
                newErrors.minOrderValueInCents = "Minimum order value in cents must be a number greater than 0";
                isError = true;
            }
        }

        if (settings_json?.purchase_type === 'subscription' || settings_json?.purchase_type === 'both') {
            if (settings_json.number_of_times_on_recurring_purchases === '' || settings_json.number_of_times_on_recurring_purchases === null || Number(settings_json.number_of_times_on_recurring_purchases) < 0) {
                newErrors.numberOfTimesOnRecurringPurchases = "Number of times on recurring purchases must be a number greater than or equal to 0";
                isError = true;
            }
        }

        if (rule.type === "free_product") {
            if (settings_json.products.length < 1) {
                newErrors.products = "Product is required";
                isError = true;
            }
        }

        if (rule.type === "free_shipping") {
            // UPDATED: Always validate this if checked, because it is monetary limit, not points limit
            if (settings_json.max_points_to_spend === true) {
                if (settings_json.max_points_to_spend_value === '' || settings_json.max_points_to_spend_value === null || Number(settings_json.max_points_to_spend_value) <= 0) {
                    newErrors.maxPointsToSpendValue = "Maximum shipping amount value must be a number greater than 0";
                    isError = true;
                }
            }
        }

        if (rule.type !== "store_credit") {
            if (rewardExpiration === '' || rewardExpiration === null || Number(rewardExpiration) <= 0 || Number(rewardExpiration) > 365) {
                newErrors.rewardExpiration = "Reward expiration must be a number greater than 0 and less than 365";
                isError = true;
            }
        }

        setValidationError(newErrors);
        return isError;
    };

    return (
        <Page
            backAction={{ content: 'Back', onAction: () => navigate(localSave ? '/loyaltyProgram/tierview' : '/loyaltyProgram', { state: { navigateTo: navigateTo } }) }}
            title={
                <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                    <Text as='h1' variant='headingLg'>{rule?.title || "Coupon"}</Text>
                    <Badge tone={status === true ? "success" : "critical"}>
                        {status === true ? "Active" : "Inactive"}
                    </Badge>
                </Box>
            }
            secondaryActions={edit ?
                <Button
                    tone='critical'
                    icon={DeleteIcon}
                    onClick={() => {
                        if (isTierRewardEdit) {
                            handleDeleteLocalData();
                        } else {
                            referralRule ? DeleteReferralRuleAPI(ruleId) : DeleteRedeemRuleAPI(ruleId);
                        }
                    }}
                >Delete
                </Button>
                : ''}
            primaryAction={{
                content: edit ? "Update" : "Save",
                onAction: () => {
                    if (edit && isTierRewardEdit) {
                        handleUpdateLocalData();
                    } else if (edit) {
                        referralRule ? UpdateReferralRuleAPI() : UpdateRedeemRuleAPI();
                    } else {
                        localSave ? handleAddLocalData() : referralRule ? AddReferralRuleAPI() : AddRedeemRuleAPI();
                    }
                }
            }}
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
                                            onChange={(value) => { setRewardTitle(value); setValidationError({ ...validationError, rewardTitle: '' }) }}
                                            maxLength={255}
                                            error={validationError?.rewardTitle}
                                        />
                                    </BlockStack>
                                </Card>

                                {rule.type === "amount_discount" && showPointsSystem && (
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
                                                {validationError?.products && (
                                                    <Text variant='bodyMd' tone='critical'>{validationError?.products}</Text>
                                                )}
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
                                                {(settings_json?.points_type === 'fixed' || !showPointsSystem) && (
                                                    <>
                                                        <FormLayout>
                                                            <FormLayout.Group>
                                                                {showPointsSystem && (
                                                                    <TextField
                                                                        label="Points amount"
                                                                        type="number"
                                                                        value={pointsAmount}
                                                                        onChange={(value) => {
                                                                            setPointsAmount(value);
                                                                            setValidationError({ ...validationError, pointsAmount: '' })
                                                                        }}
                                                                        error={validationError?.pointsAmount}
                                                                        autoComplete="off"
                                                                        suffix="points"
                                                                    />
                                                                )}

                                                                {rule.type !== "free_shipping" && (
                                                                    <TextField
                                                                        label="Discount"
                                                                        type="number"
                                                                        prefix={rule.type !== "percentage_discount" ? "$" : ""}
                                                                        suffix={rule.type === "percentage_discount" ? "%" : ""}
                                                                        value={settings_json.reward_value}
                                                                        onChange={(value) => {
                                                                            setSettingsJson({ ...settings_json, reward_value: value });
                                                                            setValidationError({ ...validationError, rewardValue: '' })
                                                                        }}
                                                                        error={validationError?.rewardValue}
                                                                        autoComplete="off"
                                                                    />
                                                                )}
                                                            </FormLayout.Group>
                                                        </FormLayout>
                                                        {rule.type !== "free_shipping" && showPointsSystem && (
                                                            <Text variant='bodyMd' tone='subdued'>Based on your cost per point, {pointsAmount} points is equal to Rs. {settings_json.reward_value}</Text>
                                                        )}
                                                    </>
                                                )}

                                                {showPointsSystem && settings_json?.points_type === 'multiplier' && (
                                                    <>
                                                        <FormLayout>
                                                            <FormLayout.Group>
                                                                <TextField
                                                                    label="Increment points value"
                                                                    type="number"
                                                                    value={pointsAmount}
                                                                    onChange={(value) => {
                                                                        setPointsAmount(value);
                                                                        setValidationError({ ...validationError, pointsAmount: '' })
                                                                    }}
                                                                    error={validationError?.pointsAmount}
                                                                    autoComplete="off"
                                                                    suffix="points"
                                                                />
                                                                <TextField
                                                                    label="Customer gets"
                                                                    type="number"
                                                                    prefix="$"
                                                                    value={settings_json.reward_value}
                                                                    onChange={(value) => {
                                                                        setSettingsJson({ ...settings_json, reward_value: value });
                                                                        setValidationError({ ...validationError, rewardValue: '' })
                                                                    }}
                                                                    error={validationError?.rewardValue}
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
                                                                onChange={(value) => {
                                                                    setSettingsJson({ ...settings_json, min_points_to_redeem_value: value });
                                                                    setValidationError({ ...validationError, minPointsToRedeemValue: '' })
                                                                }}
                                                                error={validationError?.minPointsToRedeemValue}
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
                                                                onChange={(value) => {
                                                                    setSettingsJson({ ...settings_json, max_points_to_spend_value: value });
                                                                    setValidationError({ ...validationError, maxPointsToSpendValue: '' })
                                                                }}
                                                                error={validationError?.maxPointsToSpendValue}
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
                                                onChange={(value) => {
                                                    setPointsAmount(value);
                                                    setValidationError({ ...validationError, pointsAmount: '' })
                                                }}
                                                error={validationError?.pointsAmount}
                                                autoComplete="off"
                                                suffix="points"
                                            />
                                        )}

                                        {/* UPDATED: Free Shipping Checkbox is now always visible regardless of showPointsSystem */}
                                        {rule.type === "free_shipping" && (
                                            <span style={{ display: 'flex', marginTop: '-20px', gap: '7px', flexDirection: 'column' }}>
                                                <Checkbox
                                                    label="Set a maximum shipping amount this reward can be applied to"
                                                    checked={settings_json.max_points_to_spend}
                                                    onChange={() => setSettingsJson({ ...settings_json, max_points_to_spend: !settings_json.max_points_to_spend })}
                                                />

                                                {settings_json.max_points_to_spend && (
                                                    <TextField
                                                        type="number"
                                                        value={settings_json.max_points_to_spend_value}
                                                        onChange={(value) => {
                                                            setSettingsJson({ ...settings_json, max_points_to_spend_value: value });
                                                            setValidationError({ ...validationError, maxPointsToSpendValue: '' })
                                                        }}
                                                        error={validationError?.maxPointsToSpendValue}
                                                        prefix="Rs."
                                                    />
                                                )}
                                            </span>
                                        )}
                                    </BlockStack>
                                </Card>

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
                                                    onChange={() => {
                                                        setSettingsJson({ ...settings_json, applies_to: 'collection' });
                                                        setValidationError({ ...validationError, collections: '' })
                                                    }}
                                                    onFocus={() => {
                                                        setCollectionModalOpen(true);
                                                    }}
                                                />
                                                {validationError?.collections && (
                                                    <Text variant='bodyMd' tone='critical'>{validationError?.collections}</Text>
                                                )}
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

                                <Card>
                                    <Box style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        <Text variant='headingMd' as="span">Minimum Cart Requirement</Text>
                                        <BlockStack gap={10}>
                                            <RadioButton
                                                label="None"
                                                checked={settings_json.min_requirement === 'none'}
                                                onChange={() => setSettingsJson({ ...settings_json, min_requirement: 'none' })}
                                            />
                                            <RadioButton
                                                label="Minimum cart Requirement"
                                                checked={settings_json.min_requirement === 'min_purchase_amount'}
                                                onChange={() => setSettingsJson({ ...settings_json, min_requirement: 'min_purchase_amount' })}
                                            />
                                            {settings_json.min_requirement === 'min_purchase_amount' && (
                                                <span style={{ marginTop: 5 }}>
                                                    <TextField
                                                        type="number"
                                                        value={settings_json.min_order_value_in_cents}
                                                        onChange={(value) => {
                                                            setSettingsJson({ ...settings_json, min_order_value_in_cents: value });
                                                            setValidationError({ ...validationError, minOrderValueInCents: '' })
                                                        }}
                                                        error={validationError?.minOrderValueInCents}
                                                        helpText="Value in cents. Eg: $20 = 2000"
                                                    />
                                                </span>
                                            )}
                                        </BlockStack>
                                    </Box>
                                </Card>

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
                                                    onChange={(value) => {
                                                        setSettingsJson({ ...settings_json, number_of_times_on_recurring_purchases: value });
                                                        setValidationError({ ...validationError, numberOfTimesOnRecurringPurchases: '' })
                                                    }}
                                                    error={validationError?.numberOfTimesOnRecurringPurchases}
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
                                                onChange={(value) => {
                                                    setRewardExpiration(value);
                                                    setValidationError({ ...validationError, rewardExpiration: '' })
                                                }}
                                                error={validationError?.rewardExpiration}
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
                                            <Text variant='headingMd'>Status</Text>
                                            <Badge tone={status === true ? "success" : "critical"}>
                                                {status === true ? "Active" : "Inactive"}
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
            </Layout >

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
        </Page >
    )
}

export default CouponPage
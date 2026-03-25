import { Avatar, Badge, BlockStack, Box, Button, Card, Checkbox, FormLayout, Grid, InlineGrid, Layout, Page, RadioButton, SkeletonBodyText, SkeletonDisplayText, SkeletonPage, Text, TextField } from '@shopify/polaris'
import { DeleteIcon } from '@shopify/polaris-icons';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// Removed: import CollectionModal from '../../components/CollectionModal'; 
import { fetchData } from '../../action';
// Removed: import ProductModal from '../../components/ProductModal';
import { useDispatch, useSelector } from 'react-redux';
import { addData, DeleteData, UpdateData } from '../../redux/action';
import { LimitText, NoLeadingZero, sanitizeNumberWithDecimal, SingleLeadingZero } from '../../utils';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useLoyaltyData } from '../../context/LoyaltyDataContext';

const CouponPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { addRedeemingRule, updateRedeemingRule, deleteRedeemingRule, addReferralRule, updateReferralRule, deleteReferralRule, fetchReferralData } = useLoyaltyData();

    // --- FIX START: Persist State Logic ---
    // Initialize state from location.state (if navigating) or localStorage (if reloading)
    const [pageState] = useState(() => {
        if (location.state) {
            // If we have state from navigation, save it to storage
            localStorage.setItem('couponPageData', JSON.stringify(location.state));
            return location.state;
        } else {
            // If reload (no state), try to load from storage
            const stored = localStorage.getItem('couponPageData');
            return stored ? JSON.parse(stored) : {};
        }
    });

    // Destructure from our persistent pageState instead of location.state directly
    const { rule, edit, referralRule, navigateTo, localSave, isTierRewardEdit } = pageState || {};
    // --- FIX END ---

    // Logic to determine if we should show Points inputs
    // If it is LocalSave (Reward Tier) or ReferralRule, we hide points logic.
    const showPointsSystem = !localSave && !referralRule;
    console.log('location.state', location.state);
    console.log('localSave', localSave)
    console.log('navigateTo coupons', navigateTo)
    console.log('rule local', rule)

    const [rewardTitle, setRewardTitle] = useState('');
    const [pointsAmount, setPointsAmount] = useState(100);
    const [rewardExpiration, setRewardExpiration] = useState(1);
    // Removed: const [collectionModalOpen, setCollectionModalOpen] = useState(false);
    // Removed: const [productModalOpen, setProductModalOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [ruleId, setRuleId] = useState('');
    const [ruleType, setRuleType] = useState('');
    const [clientId, setClientId] = useState(null);
    const [validationError, setValidationError] = useState({
        rewardTitle: '',
        pointsAmount: '',
        rewardValue: '',
        points: '',
        reward_value: '',
        minPointsToRedeemValue: '',
        maxPointsToSpendValue: '',
        collections: '',
        products: '',
        minOrderValueInCents: '',
        numberOfTimesOnRecurringPurchases: '',
        rewardExpiration: '',
    });
    const [totalProductPrice, setTotalProductPrice] = useState(0);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [rewardExpirationStatus, setRewardExpirationStatus] = useState(false);
    const Data = useSelector((state) => state.merchantSettings.Data);
    const currencySymbol = useSelector((state) => state?.merchantSettings?.defaultData?.currency);
    const dispatch = useDispatch();

    const [settings_json, setSettingsJson] = useState({
        points: '',
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

    // --- COLLECTION PICKER LOGIC ---
    const openCollectionPicker = async () => {
        // 1. Prepare IDs for the picker (must be GIDs)
        // If we saved them as integers, we need to convert them back to GID strings for the picker to recognize them
        const currentIds = settings_json.collections.map(c => ({
            id: c.collection_id.toString().includes('gid://')
                ? c.collection_id
                : `gid://shopify/Collection/${c.collection_id}`
        }));

        const selected = await shopify.resourcePicker({
            type: "collection",
            multiple: true,
            selectionIds: currentIds,
        });

        if (!selected) return;

        // 2. Process selection (Convert GID back to Integer)
        const leanCollections = selected.map((c) => {
            // Extract the numeric ID from "gid://shopify/Collection/12345"
            // .split('/').pop() takes the last part of the URL-like string
            const numericId = c.id.split('/').pop();

            return {
                collection_id: numericId,
                name: c.title,
                handle: c.handle,
                image: c.image?.originalSrc || c.image?.src || "",
            };
        });

        setSettingsJson(prev => ({
            ...prev,
            collections: leanCollections
        }));
        setValidationError({ ...validationError, collections: '' });
    };

    // --- NEW PRODUCT PICKER LOGIC ---
    const openProductPicker = async () => {
        // 1. Reconstruct selectionIds for the picker (handling Products and Variants)
        const initialSelectionIds = [];
        const groups = {};

        settings_json.products.forEach(p => {
            // Use parent_product_id if available (for variants), else assume product_id is the parent (legacy)
            const parentId = p.parent_product_id || p.product_id;
            const isVariant = !!p.parent_product_id;

            const parentGid = parentId.toString().includes('gid://')
                ? parentId
                : `gid://shopify/Product/${parentId}`;

            if (!groups[parentGid]) {
                groups[parentGid] = { id: parentGid, variants: [] };
                initialSelectionIds.push(groups[parentGid]);
            }

            if (isVariant) {
                const variantGid = p.product_id.toString().includes('gid://')
                    ? p.product_id
                    : `gid://shopify/ProductVariant/${p.product_id}`;
                groups[parentGid].variants.push({ id: variantGid });
            }
        });

        const selected = await shopify.resourcePicker({
            type: "product",
            multiple: false,
            showVariants: true,
            selectionIds: initialSelectionIds,
        });

        if (!selected) return;

        // 2. Process selection (Calculate Price & Flatten Variants)
        let calculatedPrice = 0;
        const leanProducts = [];

        selected.forEach(product => {
            product.variants.forEach(variant => {
                const price = parseFloat(variant.price) || 0;
                calculatedPrice += price;

                const variantIds = variant.id.split('/').pop();
                const productIds = product.id.split('/').pop();

                leanProducts.push({
                    product_id: productIds,          // ✅ exact key backend expects
                    variant_ids: [variantIds],
                    title: variant.title === 'Default Title' ? product.title : `${product.title} - ${variant.title}`,
                    img: variant.image?.originalSrc || product.images?.[0]?.originalSrc || "",
                    price: price
                });
            });
        });

        // 3. Update State
        setTotalProductPrice(calculatedPrice);
        setSettingsJson(prev => ({
            ...prev,
            products: leanProducts,
            // Auto-set reward value to total price if > 0
            reward_value: calculatedPrice > 0 ? String(calculatedPrice) : prev.reward_value
        }));

        setValidationError(prev => {
            const next = { ...prev, products: '' };
            if (calculatedPrice > 0) next.rewardValue = '';
            return next;
        });
    };
    // --------------------------------

    useEffect(() => {
        // Safe check: if no rule exists (e.g. storage cleared), stop execution
        if (!rule) return;

        // --- LOCAL EDIT MODE (Tier Rewards) ---
        if (edit && isTierRewardEdit && rule) {
            setRewardExpirationStatus(rule.expiration_status === 1 || rule.expiration_status === true);
            setRewardTitle(rule.title || '');
            setPointsAmount(rule.points || 100);
            setRewardExpiration(rule.expiration_days || 1);
            setStatus(rule.status === true);
            setSettingsJson(rule.settings_json || { points_type: 'fixed' });
            setClientId(rule.clientId);
            setRuleType(rule.type);
            setLoading(false);
            return;
        }

        // --- EDIT MODE ---
        if (edit) {
            if (referralRule) {
                // Referral rules: use location.state data if available, otherwise fetch from API
                if (location.state?.rule) {
                    const ruleData = location.state.rule;
                    setRewardExpirationStatus(ruleData.expiration_status === 1);
                    setPointsAmount(ruleData.points || 100);
                    setRewardTitle(ruleData.title || '');
                    setSettingsJson(ruleData.rule_data || ruleData.settings_json || { points_type: 'fixed' });
                    setRewardExpiration(ruleData.expiration_days || 1);
                    setStatus(ruleData.status);
                    setRuleId(ruleData.id);
                    setRuleType(ruleData.rule_type || ruleData.type);
                    setLoading(false);
                } else {
                    setLoading(true);
                    GetReferralRuleByIdAPI();
                }
            } else if (location.state?.rule) {
                // Redeem rule: use data from navigation state (skip API)
                const ruleData = location.state.rule;
                setRewardExpirationStatus(ruleData.expiration_status === 1);
                setSettingsJson(ruleData.settings_json || { points_type: 'fixed' });
                setRewardTitle(ruleData.title || '');
                setPointsAmount(ruleData.points || 100);
                setRewardExpiration(ruleData.expiration_days || 1);
                setStatus(ruleData.status === true);
                setRuleId(ruleData.id);
                setLoading(false);
            } else {
                // Hard reload: no location state, must fetch from API
                setLoading(true);
                GetRedeemRuleByIdAPI();
            }
        } else {
            setLoading(false);
        }
    }, [edit, rule, referralRule, isTierRewardEdit]);

    const getCleanSettings = () => {
        const cleanSettings = { ...settings_json };
        // FIX: Ensure points_type is preserved for earn_points even if showPointsSystem is false
        if (!showPointsSystem && rule?.type !== "earn_points") {
            delete cleanSettings.points_type;
        }
        if (rule?.type === "earn_points") {
            delete cleanSettings.products;
            delete cleanSettings.applies_to;
            delete cleanSettings.collections
            delete cleanSettings.purchase_type;
            delete cleanSettings.expiration_days;
            delete cleanSettings.min_order_quantity;
            delete cleanSettings.max_points_to_spend;
            delete cleanSettings.min_points_to_redeem;
            delete cleanSettings.max_points_to_spend_value;
            delete cleanSettings.min_points_to_redeem_value;
            delete cleanSettings.min_order_value_excludes_free_product;
            delete cleanSettings.number_of_times_on_recurring_purchases;
        }
        return cleanSettings;
    }

    const handleAddLocalData = () => {
        if (handleValidation()) {
            return;
        }

        const payload = {
            expiration_status: rewardExpirationStatus ? 1 : 0,
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

        // Clear storage on successful navigate away
        localStorage.removeItem('couponPageData');
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

        localStorage.removeItem('couponPageData');
        dispatch(UpdateData(updatedData));
        navigate('/loyaltyProgram/tierview', { state: { navigateTo: navigateTo } });
    };

    const handleDeleteLocalData = () => {
        localStorage.removeItem('couponPageData');
        dispatch(DeleteData(rule.clientId));
        navigate('/loyaltyProgram/tierview', { state: { navigateTo: navigateTo } });
    };

    // Redeem API
    const AddRedeemRuleAPI = async () => {
        if (handleValidation()) {
            return;
        }
        setSubmitLoading(true);
        try {
            const formData = new FormData();
            formData.append("expiration_status", rewardExpirationStatus ? 1 : 0);
            formData.append("master_rule_id", rule.master_rule_id);
            formData.append("status", status);
            formData.append("points", pointsAmount);
            formData.append("title", rewardTitle);
            formData.append("settings_json", JSON.stringify(settings_json));
            formData.append("expiration_days", rewardExpiration);
            const response = await fetchData("/add-merchant-redeeming-rules", formData);

            if (response?.status === true) {
                // Update context locally with new redeem rule
                const newRule = {
                    master_rule_id: rule.master_rule_id,
                    title: rewardTitle,
                    type: rule.type,
                    points: pointsAmount,
                    status: status === true,
                    icon: rule.icon,
                    settings_json: settings_json,
                    expiration_days: rewardExpiration,
                    expiration_status: rewardExpirationStatus ? 1 : 0,
                    ...(response.data || {}),
                    // Ensure id is always set (placed AFTER spread so it won't be overwritten)
                    id: response.data?.id || response.data?.rule_id || response.id || response.rule_id,
                };
                addRedeemingRule(newRule);

                localStorage.removeItem('couponPageData');
                navigate('/loyaltyProgram');
                shopify.toast.show(response?.message, { duration: 2000 });
            } else {
                shopify.toast.show(response?.message, { duration: 2000, isError: true });
            }
        } catch (error) {
            console.error('Add Redeem Rule Error', error);
        } finally {
            setSubmitLoading(false);
        }
    }

    const UpdateRedeemRuleAPI = async () => {
        if (handleValidation()) {
            return;
        }
        setSubmitLoading(true);
        try {
            const formData = new FormData();
            formData.append("expiration_status", rewardExpirationStatus ? 1 : 0);
            formData.append("rule_id", ruleId);
            formData.append("status", status);
            formData.append("points", pointsAmount);
            formData.append("title", rewardTitle);
            formData.append("settings_json", JSON.stringify(settings_json));
            formData.append("expiration_days", rewardExpiration);
            const response = await fetchData("/update-merchant-redeeming-rules", formData);

            if (response?.status === true) {
                // Update context locally
                updateRedeemingRule(ruleId, {
                    title: rewardTitle,
                    points: pointsAmount,
                    status: status === true,
                    settings_json: settings_json,
                    expiration_days: rewardExpiration,
                    expiration_status: rewardExpirationStatus ? 1 : 0,
                });

                localStorage.removeItem('couponPageData');
                navigate('/loyaltyProgram');
                shopify.toast.show(response?.message, { duration: 2000 });
            } else {
                shopify.toast.show(response?.message, { duration: 2000, isError: true });
            }
        } catch (error) {
            console.error('Update Redeem Rule Error', error);
        } finally {
            setSubmitLoading(false);
        }
    }

    const DeleteRedeemRuleAPI = async (id) => {
        setDeleteLoading(true);
        const formData = new FormData();
        formData.append("rule_id", id);
        const response = await fetchData("/delete-merchant-redeeming-rules", formData);
        if (response?.status === true) {
            // Update context locally
            deleteRedeemingRule(id);

            localStorage.removeItem('couponPageData');
            navigate('/loyaltyProgram');
            shopify.toast.show(response?.message, { duration: 2000 });
        } else {
            shopify.toast.show(response?.message, { duration: 2000, isError: true });
        }
        setDeleteLoading(false);
    }

    const GetRedeemRuleByIdAPI = async () => {
        setLoading(true);
        const formData = new FormData();
        formData.append("rule_id", rule.id);
        const response = await fetchData("/get-merchant-redeeming-rules-by-id", formData);
        if (response?.status === true) {
            setRewardExpirationStatus(response.data.expiration_status === 1);
            setSettingsJson(response.data.settings_json);
            setRewardTitle(response.data.title);
            setPointsAmount(response.data.points);
            setRewardExpiration(response.data.expiration_days || 1);
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
        setSubmitLoading(true);
        try {
            const formData = new FormData();
            formData.append("expiration_status", rewardExpirationStatus ? 1 : 0);
            formData.append("master_rule_id", rule.master_rule_id);
            formData.append("status", status);
            formData.append("title", rewardTitle);
            formData.append("settings_json", JSON.stringify(getCleanSettings()));
            formData.append("expiration_days", rewardExpiration);
            formData.append("referral_setting_id", rule.referral_setting_id);
            formData.append("rule_type", rule.rule_type);
            const response = await fetchData("/add-referral-rule", formData);
            if (response?.status === true) {
                // Update context locally
                const newRule = {
                    referral_rule_id: response.data?.referral_rule_id || response.referral_rule_id || response.added_fields.referral_rule_id,
                    referral_setting_id: rule.referral_setting_id,
                    master_rule_id: rule.master_rule_id,
                    title: rewardTitle,
                    type: rule.type || rule.rule_type,
                    points: parseInt(pointsAmount) || 0,
                    status: status === true,
                    rule_type: rule.rule_type,
                    icon: rule.icon,
                    settings_json: getCleanSettings(),
                    expiration_days: rewardExpiration,
                    expiration_status: rewardExpirationStatus ? 1 : 0,
                    ...(response.data || {}),
                };
                // Advocate rules have rule_type that indicates which group
                const isAdvocate = rule.rule_type === 'advocate' || rule.isAdvocate;
                addReferralRule(newRule, isAdvocate);

                localStorage.removeItem('couponPageData');
                navigate('/loyaltyProgram', { state: { navigateTo: navigateTo } });
                shopify.toast.show(response?.message, { duration: 2000 });
            } else {
                shopify.toast.show(response?.message, { duration: 2000, isError: true });
            }
        } catch (error) {
            console.error('Add Referral Rule Error', error);
        } finally {
            setSubmitLoading(false);
        }
    }

    const UpdateReferralRuleAPI = async () => {
        if (handleValidation()) {
            return;
        }
        setSubmitLoading(true);
        try {
            const formData = new FormData();
            formData.append("expiration_status", rewardExpirationStatus ? 1 : 0);
            formData.append("master_rule_id", rule.master_rule_id);
            formData.append("status", status);
            formData.append("title", rewardTitle);
            formData.append("settings_json", JSON.stringify(getCleanSettings()));
            formData.append("expiration_days", rewardExpiration);
            formData.append("referral_setting_id", rule.referral_setting_id);
            formData.append("referral_rule_id", rule.referral_rule_id);
            formData.append("rule_type", rule.rule_type);
            const response = await fetchData("/update-referral-rule", formData);
            if (response?.status === true) {
                // Update context locally
                updateReferralRule(rule.referral_rule_id, {
                    title: rewardTitle,
                    type: rule.type || rule.rule_type,
                    points: parseInt(pointsAmount) || 0,
                    status: status === true,
                    settings_json: getCleanSettings(),
                    rule_data: getCleanSettings(),
                    rule_type: rule.rule_type,
                    expiration_days: rewardExpiration,
                    expiration_status: rewardExpirationStatus ? 1 : 0,
                });

                localStorage.removeItem('couponPageData');
                navigate('/loyaltyProgram', { state: { navigateTo: navigateTo } });
                shopify.toast.show(response?.message, { duration: 2000 });
            } else {
                shopify.toast.show(response?.message, { duration: 2000, isError: true });
            }
        } catch (error) {
            console.error('Update Referral Rule Error', error);
        } finally {
            setSubmitLoading(false);
        }
    }

    const GetReferralRuleByIdAPI = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("referral_rule_id", rule.referral_rule_id);
            formData.append("referral_setting_id", rule.referral_setting_id);
            const response = await fetchData("/get-referral-rule-by-id", formData);
            if (response?.status === true) {
                setRewardExpirationStatus(response.data.expiration_status === 1);
                setPointsAmount(response.data.points);
                setRewardTitle(response.data.title);
                setSettingsJson(response.data.rule_data);
                setRewardExpiration(response.data.expiration_days || 1);
                setStatus(response.data.status);
                setRuleId(response.data.id);
                setRuleType(response.data.rule_type);
            }
        } catch (error) {
            console.error('Get Referral Rule By ID Error', error);
        } finally {
            setLoading(false);
        }
    }

    const DeleteReferralRuleAPI = async () => {
        setDeleteLoading(true);
        try {
            const formData = new FormData();
            formData.append("referral_rule_id", rule.referral_rule_id);
            formData.append("referral_setting_id", rule.referral_setting_id);
            const response = await fetchData("/delete-referral-reward", formData);
            if (response?.status === true) {
                // Pass rule so context can restore it to advocate available
                // Using response rule data if available to get the original API title, alternatively the context relies on fetchReferralData.
                let deletedRuleWithTitle = { ...rule };
                if (response.data && response.data.title) {
                    deletedRuleWithTitle.title = response.data.title;
                }

                deleteReferralRule(rule.referral_rule_id, deletedRuleWithTitle);

                // Fetch referral data to properly restore API state
                // fetchReferralData();

                localStorage.removeItem('couponPageData');
                navigate('/loyaltyProgram', { state: { navigateTo: navigateTo } });
                shopify.toast.show(response?.message, { duration: 2000 });
            }
            else {
                shopify.toast.show(response?.message, { duration: 2000, isError: true });
            }
        } catch (error) {
            console.error('Delete Referral Rule Error', error);
        } finally {
            setDeleteLoading(false);
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
            points: '',
            reward_value: '',
            minPointsToRedeemValue: '',
            maxPointsToSpendValue: '',
            collections: '',
            products: '',
            minOrderValueInCents: '',
            numberOfTimesOnRecurringPurchases: '',
            rewardExpiration: '',
        };
        let isError = false;

        // Helper: treats '', null, undefined, NaN as blank
        const isBlank = (v) => v === '' || v === null || v === undefined || (typeof v === 'string' && v.trim() === '') || Number.isNaN(Number(v));
        const isZeroOrLess = (v) => isBlank(v) || Number(v) <= 0;

        if (localSave) {
            const isDuplicate = Data?.some(item => {
                const hasSameTitle = item.title.trim().toLowerCase() === rewardTitle.trim().toLowerCase();
                if (edit && isTierRewardEdit) {
                    return hasSameTitle && item.clientId !== clientId;
                }
                return hasSameTitle;
            });
            if (isDuplicate) {
                newErrors.rewardTitle = "Reward title already exists";
                isError = true;
            }
        }

        // Reward title
        if (!rewardTitle || rewardTitle.replace(/\s+/g, " ").trim() === "") {
            newErrors.rewardTitle = "Reward title is required";
            isError = true;
        }

        // Points amount (only for non-referral, non-tier modes)
        if (showPointsSystem) {
            if (isZeroOrLess(pointsAmount)) {
                newErrors.pointsAmount = "Points must be a number greater than 0";
                isError = true;
            }
        }

        if (rule?.type === "earn_points") {
            if (settings_json.points_type === 'fixed') {
                if (isZeroOrLess(settings_json.points)) {
                    newErrors.points = "Points amount must be greater than 0";
                    isError = true;
                }
            } else {
                // Percentage validation
                if (isBlank(settings_json.reward_value) || Number(settings_json.reward_value) <= 0 || Number(settings_json.reward_value) > 100) {
                    newErrors.reward_value = "Percentage value must be greater than 0 and less than or equal to 100";
                    isError = true;
                }
            }
        } else {
            // Non earn_points: validate pointsAmount only for showPointsSystem (re-check here for clarity)
            if (showPointsSystem && isZeroOrLess(pointsAmount)) {
                newErrors.pointsAmount = "Points must be greater than 0";
                isError = true;
            }
            // Validate reward_value for all types that use it (including referral)
            if (!["free_shipping", "free_product"].includes(rule?.type) && !["free_shipping", "free_product"].includes(ruleType) && isZeroOrLess(settings_json.reward_value)) {
                newErrors.rewardValue = "Discount value must be greater than 0";
                isError = true;
            }
        }


        if (rule?.type === "free_product" && totalProductPrice > 0 && Number(settings_json.reward_value) < totalProductPrice) {
            newErrors.rewardValue = `Discount value cannot be less than the total product price (${currencySymbol?.symbol} ${totalProductPrice.toFixed(2)})`;
            isError = true;
        }

        if (showPointsSystem && settings_json?.points_type === 'multiplier') {
            if (settings_json.min_points_to_redeem) {
                if (isZeroOrLess(settings_json.min_points_to_redeem_value)) {
                    newErrors.minPointsToRedeemValue = "Minimum points to redeem value must be a number greater than 0";
                    isError = true;
                }
            }
            if (settings_json.max_points_to_spend) {
                if (isZeroOrLess(settings_json.max_points_to_spend_value)) {
                    newErrors.maxPointsToSpendValue = "Maximum points to spend value must be a number greater than 0";
                    isError = true;
                }
            }
        }

        // FIX: Added optional chaining rule?.type just in case
        if (rule?.type === "amount_discount" || rule?.type === "percentage_discount") {
            if (settings_json?.applies_to === 'collection') {
                if (settings_json.collections.length < 1) {
                    newErrors.collections = "Collection is required";
                    isError = true;
                }
            }
        }

        if (settings_json.min_requirement === 'min_purchase_amount') {
            if (settings_json.min_order_value_in_cents === '' || settings_json.min_order_value_in_cents === null || Number(settings_json.min_order_value_in_cents) <= 0) {
                newErrors.minOrderValueInCents = "Minimum order value must be a number greater than 0";
                isError = true;
            }
        }

        if (settings_json?.purchase_type === 'subscription' || settings_json?.purchase_type === 'both') {
            if (settings_json.number_of_times_on_recurring_purchases === '' || settings_json.number_of_times_on_recurring_purchases === null || Number(settings_json.number_of_times_on_recurring_purchases) < 0) {
                newErrors.numberOfTimesOnRecurringPurchases = "Number of times on recurring purchases must be a number greater than or equal to 0";
                isError = true;
            }
        }

        // FIX: Added optional chaining
        if (rule?.type === "free_product") {
            if (settings_json.products.length < 1) {
                newErrors.products = "Product is required";
                isError = true;
            }
        }

        // FIX: Added optional chaining
        if (rule?.type === "free_shipping" || ruleType === "free_shipping") {
            if (settings_json.max_points_to_spend) {
                if (isZeroOrLess(settings_json.max_points_to_spend_value)) {
                    newErrors.maxPointsToSpendValue = "Maximum shipping amount value must be a number greater than 0";
                    isError = true;
                }
            }
        }

        // Only validate expiration days when the toggle is ON and the field is visible
        if (rule?.type !== "earn_points" && rewardExpirationStatus) {
            if (rewardExpiration === '' || rewardExpiration === null || Number(rewardExpiration) < 1 || Number(rewardExpiration) > 365) {
                newErrors.rewardExpiration = "Expiration days must be between 1 and 365";
                isError = true;
            }
        }

        setValidationError(newErrors);
        return isError;
    };

    // If rule is undefined (e.g. fresh clear of localstorage and no state), return null or loader
    if (!rule) {
        return <Page><Layout><Card><Text>Loading or No Rule Selected. Please go back.</Text></Card></Layout></Page>;
    }

    return (
        <>
            {loading ?
                (
                    <SkeletonPage
                        primaryAction={{ content: <SkeletonDisplayText size="small" /> }}
                    >

                        <InlineGrid columns={['twoThirds', 'oneThird']} gap={400} >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <Card><SkeletonBodyText lines={4} /></Card>
                                <Card><SkeletonBodyText lines={3} /></Card>
                                <Card><SkeletonBodyText lines={8} /></Card>
                                <Card><SkeletonBodyText lines={8} /></Card>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <Card><SkeletonBodyText lines={4} /></Card>
                                <Card><SkeletonBodyText lines={4} /></Card>
                            </div>
                        </InlineGrid>

                    </SkeletonPage>
                ) : (
                    <Page
                        backAction={{
                            content: 'Back',
                            onAction: () => {
                                // Clear storage when manually going back
                                localStorage.removeItem('couponPageData');
                                navigate(localSave ? '/loyaltyProgram/tierview' : '/loyaltyProgram', { state: { navigateTo: navigateTo } });
                            }
                        }}
                        title={
                            <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                                <Text as='h1' variant='headingLg'>{rule?.title || "Coupon"}</Text>
                                <Badge tone={status === true ? "success" : "critical"}>
                                    {status === true ? "Active" : "Inactive"}
                                </Badge>
                            </Box>
                        }
                        secondaryActions={edit ?
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={status === true}
                                        onChange={handleStatusChange}
                                    />
                                    <span className="slider"></span>
                                </label>
                                <Button
                                    tone='critical'
                                    icon={DeleteIcon}
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    loading={deleteLoading}
                                >Delete
                                </Button>
                            </div>
                            :
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={status === true}
                                    onChange={handleStatusChange}
                                />
                                <span className="slider"></span>
                            </label>}
                        primaryAction={{
                            content: edit ? "Update" : "Save",
                            loading: submitLoading,
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
                                                        onChange={(value) => { setRewardTitle(LimitText(value, 60)); setValidationError({ ...validationError, rewardTitle: '' }) }}
                                                        maxLength={255}
                                                        error={validationError?.rewardTitle}
                                                    />
                                                </BlockStack>
                                            </Card>

                                            {(rule?.type === "earn_points" || ruleType === "earn_points") ? (
                                                <Card>
                                                    <Box style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                        <Text variant='headingMd' as="span">Points Calculation Method</Text>
                                                        <BlockStack>
                                                            <RadioButton
                                                                label="Fixed amount of points"
                                                                checked={settings_json?.points_type === 'fixed'}
                                                                onChange={() => setSettingsJson({ ...settings_json, points_type: 'fixed' })}
                                                            />
                                                            <RadioButton
                                                                label="Percentage of order value"
                                                                checked={settings_json?.points_type === 'percentage'}
                                                                onChange={() => setSettingsJson({ ...settings_json, points_type: 'percentage' })}
                                                            />
                                                        </BlockStack>
                                                    </Box>
                                                </Card>
                                            ) : (
                                                (rule?.type === "amount_discount" || ruleType === "amount_discount") && showPointsSystem && (
                                                    <Card>
                                                        <Box style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                            <Text variant='headingMd' as="span">Points Calculation Method</Text>
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
                                                )
                                            )}

                                            {rule?.type === "free_product" && (
                                                <Card>
                                                    <Box style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                        <Text variant='headingMd' as="span">Product</Text>
                                                        <div>
                                                            <Button variant='secondary' onClick={openProductPicker}><Text variant='bodyMd'>Select Product</Text></Button>
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

                                            {/* reward card */}
                                            <Card>
                                                <BlockStack gap={200}>
                                                    <Text variant='headingMd' as="span">Reward</Text>
                                                    <BlockStack gap={100}>
                                                        {(rule?.type !== "earn_points") && (
                                                            <>
                                                                {(settings_json?.points_type === 'fixed' || !showPointsSystem) && (
                                                                    <>
                                                                        <FormLayout>
                                                                            <FormLayout.Group>
                                                                                {showPointsSystem && (
                                                                                    <TextField
                                                                                        label="Points Amount"
                                                                                        type="text"
                                                                                        value={pointsAmount}
                                                                                        onChange={(value) => {
                                                                                            setPointsAmount(NoLeadingZero(value));
                                                                                            setValidationError({ ...validationError, pointsAmount: '' })
                                                                                        }}
                                                                                        error={validationError?.pointsAmount}
                                                                                        autoComplete="off"
                                                                                        suffix="Points"
                                                                                    />
                                                                                )}

                                                                                {(rule?.type !== "free_shipping" && ruleType !== "free_shipping") && (
                                                                                    <TextField
                                                                                        label="Discount"
                                                                                        type="text"
                                                                                        prefix={rule?.type !== "percentage_discount" ? `${currencySymbol?.symbol}` : ""}
                                                                                        suffix={rule?.type === "percentage_discount" ? "%" : ""}
                                                                                        value={sanitizeNumberWithDecimal(settings_json.reward_value)}
                                                                                        onChange={(value) => {
                                                                                            const floatValue = parseFloat(value);
                                                                                            const isPercentage = rule?.type === "percentage_discount";
                                                                                            if (
                                                                                                value === '' ||
                                                                                                (isPercentage && !value.includes('.') && floatValue >= 1 && floatValue <= 100) ||
                                                                                                (!isPercentage && floatValue >= 1)
                                                                                            ) {
                                                                                                setSettingsJson({ ...settings_json, reward_value: sanitizeNumberWithDecimal(value) });
                                                                                                setValidationError({ ...validationError, rewardValue: '' });
                                                                                            }
                                                                                        }}
                                                                                        error={validationError?.rewardValue ? validationError?.rewardValue : undefined}
                                                                                        autoComplete="off"
                                                                                    />
                                                                                )}
                                                                            </FormLayout.Group>
                                                                        </FormLayout>
                                                                        {(rule?.type !== "free_shipping" && ruleType !== "free_shipping") && (rule?.type === "percentage_discount" || ruleType === "percentage_discount") && showPointsSystem && (
                                                                            <Text variant='bodyMd' tone='subdued'>Based on your cost per point, {pointsAmount} points is equal to {sanitizeNumberWithDecimal(settings_json?.reward_value)} % off</Text>
                                                                        )}
                                                                        {(rule?.type !== "free_shipping" && ruleType !== "free_shipping") && (rule?.type !== "percentage_discount" && ruleType !== "percentage_discount") && showPointsSystem && (
                                                                            <Text variant='bodyMd' tone='subdued'>Based on your cost per point, {pointsAmount} points is equal to {sanitizeNumberWithDecimal(settings_json?.reward_value)} {currencySymbol?.code}.</Text>
                                                                        )}
                                                                    </>
                                                                )}

                                                                {showPointsSystem && settings_json?.points_type === 'multiplier' && (
                                                                    <>
                                                                        <FormLayout>
                                                                            <FormLayout.Group>
                                                                                <TextField
                                                                                    label="Increment points value"
                                                                                    type="text"
                                                                                    value={pointsAmount}
                                                                                    onChange={(value) => {
                                                                                        setPointsAmount(NoLeadingZero(value));
                                                                                        setValidationError({ ...validationError, pointsAmount: '' })
                                                                                    }}
                                                                                    error={validationError?.pointsAmount}
                                                                                    autoComplete="off"
                                                                                    suffix="Points"
                                                                                />
                                                                                <TextField
                                                                                    label="Customer gets"
                                                                                    type="text"
                                                                                    prefix={currencySymbol?.symbol}
                                                                                    value={settings_json.reward_value}
                                                                                    onChange={(value) => {
                                                                                        setSettingsJson({ ...settings_json, reward_value: NoLeadingZero(value) });
                                                                                        setValidationError({ ...validationError, rewardValue: '' })
                                                                                    }}
                                                                                    error={validationError?.rewardValue}
                                                                                    autoComplete="off"
                                                                                />
                                                                            </FormLayout.Group>
                                                                        </FormLayout>
                                                                        <Text variant='bodyMd' tone='subdued'>Based on your cost per point, {pointsAmount} points is equal to {currencySymbol?.code} {settings_json.reward_value}</Text>

                                                                        <Checkbox
                                                                            label="Set a minimum amount of points required to redeem this reward"
                                                                            checked={settings_json.min_points_to_redeem}
                                                                            onChange={() => setSettingsJson({ ...settings_json, min_points_to_redeem: !settings_json.min_points_to_redeem })}
                                                                        />

                                                                        {settings_json.min_points_to_redeem && (
                                                                            <TextField
                                                                                type="text"
                                                                                value={settings_json.min_points_to_redeem_value}
                                                                                onChange={(value) => {
                                                                                    setSettingsJson({ ...settings_json, min_points_to_redeem_value: NoLeadingZero(value) });
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
                                                                                type="text"
                                                                                value={settings_json.max_points_to_spend_value}
                                                                                onChange={(value) => {
                                                                                    setSettingsJson({ ...settings_json, max_points_to_spend_value: NoLeadingZero(value) });
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

                                                        {rule?.type === "earn_points" && (
                                                            <>
                                                                {settings_json?.points_type === 'percentage' && (
                                                                    <>
                                                                        <FormLayout>
                                                                            <FormLayout.Group>
                                                                                <TextField
                                                                                    label="Points Percentage"
                                                                                    type="text"
                                                                                    value={settings_json.reward_value}
                                                                                    onChange={(v) => {
                                                                                        setSettingsJson({ ...settings_json, reward_value: NoLeadingZero(v) });
                                                                                        setValidationError({ ...validationError, reward_value: '' })
                                                                                    }}
                                                                                    error={validationError?.reward_value}
                                                                                    suffix="%" />
                                                                            </FormLayout.Group>
                                                                        </FormLayout>
                                                                        <Text variant='bodyMd' tone='subdued'>If set to 10%, a {currencySymbol?.symbol}1000 order will earn 100 points and that amount of points will be credited in customer's account</Text>
                                                                    </>
                                                                )}

                                                                {settings_json?.points_type === "fixed" && (
                                                                    <TextField
                                                                        label="Points amount"
                                                                        type="text"
                                                                        value={settings_json?.points}
                                                                        onChange={(v) => {
                                                                            setSettingsJson((prev) => ({ ...prev, points: NoLeadingZero(v) }));
                                                                            setValidationError((prev) => ({ ...prev, points: "" })); // ✅ same key
                                                                        }}
                                                                        error={validationError?.points} // ✅ same key
                                                                        autoComplete="off"
                                                                        suffix="Points"
                                                                    />
                                                                )}
                                                            </>
                                                        )}

                                                        {(rule?.type === "free_shipping" || ruleType === "free_shipping") && (
                                                            <span style={{ display: 'flex', gap: '7px', flexDirection: 'column' }}>
                                                                <Checkbox
                                                                    label="Set a maximum shipping amount this reward can be applied to"
                                                                    checked={settings_json.max_points_to_spend}
                                                                    onChange={() => setSettingsJson({ ...settings_json, max_points_to_spend: !settings_json.max_points_to_spend })}
                                                                />

                                                                {settings_json.max_points_to_spend && (
                                                                    <TextField
                                                                        type="text"
                                                                        value={settings_json.max_points_to_spend_value}
                                                                        onChange={(value) => {
                                                                            setSettingsJson({ ...settings_json, max_points_to_spend_value: NoLeadingZero(value) });
                                                                            setValidationError({ ...validationError, maxPointsToSpendValue: '' })
                                                                        }}
                                                                        error={validationError?.maxPointsToSpendValue}
                                                                        prefix={currencySymbol?.symbol}
                                                                    />
                                                                )}
                                                            </span>
                                                        )}
                                                    </BlockStack>
                                                </BlockStack>
                                            </Card>

                                            {(rule?.type === "amount_discount" || rule?.type === "percentage_discount") && (
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
                                                                onFocus={openCollectionPicker}
                                                            />
                                                            {validationError?.collections && (
                                                                <Text variant='bodyMd' tone='critical'>{validationError?.collections}</Text>
                                                            )}
                                                            {settings_json?.applies_to === 'collection' && (
                                                                settings_json?.collections?.length > 0 && (
                                                                    <>{
                                                                        settings_json?.collections.map((col) => (
                                                                            <div key={col.collection_id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 3 }}>
                                                                                <Avatar source={col.image} customer />
                                                                                <Text>{col.name}</Text>
                                                                            </div>
                                                                        ))
                                                                    }</>
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
                                                                    prefix={currencySymbol?.symbol}
                                                                    type="text"
                                                                    value={settings_json.min_order_value_in_cents}
                                                                    onChange={(value) => {
                                                                        setSettingsJson({ ...settings_json, min_order_value_in_cents: NoLeadingZero(value) });
                                                                        setValidationError({ ...validationError, minOrderValueInCents: '' })
                                                                    }}
                                                                    error={validationError?.minOrderValueInCents}
                                                                // helpText="Value in cents. Eg: $20 = 2000"
                                                                />
                                                            </span>
                                                        )}
                                                    </BlockStack>
                                                </Box>
                                            </Card>

                                            {/* removeed for now */}
                                            {/* {(rule?.type !== "earn_points") && (
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
                                            )} */}

                                            {(settings_json?.purchase_type === 'subscription' || settings_json?.purchase_type === 'both') && (
                                                <>
                                                    <Card>
                                                        <BlockStack gap={300}>
                                                            <Text variant='headingSm' as="span">Recurring Payment Options</Text>
                                                            <TextField
                                                                type="text"
                                                                value={settings_json?.number_of_times_on_recurring_purchases}
                                                                onChange={(value) => {
                                                                    setSettingsJson({ ...settings_json, number_of_times_on_recurring_purchases: SingleLeadingZero(value) });
                                                                    setValidationError({ ...validationError, numberOfTimesOnRecurringPurchases: '' })
                                                                }}
                                                                error={validationError?.numberOfTimesOnRecurringPurchases}
                                                                helpText='The number of times a discount applies on recurring purchases. For example, if you set this field to 3, then the discount only applies to the first three billing cycles of a subscription. If you specify 0, then the discount applies indefinitely.'
                                                            />
                                                        </BlockStack>
                                                    </Card>
                                                </>
                                            )}

                                            {(rule?.type !== "earn_points") && (
                                                <Card>
                                                    <BlockStack gap={300}>
                                                        <Box style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                                            <Text variant='headingMd' >Reward Expiration</Text>
                                                            <div
                                                                className="toggle-container"
                                                                style={{ display: "flex", alignItems: "center", gap: "8px" }}
                                                            >
                                                                <label className="switch">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={rewardExpirationStatus}
                                                                        onChange={(e) => {
                                                                            const isChecked = e.target.checked;

                                                                            setRewardExpirationStatus(isChecked);

                                                                            if (!isChecked) {
                                                                                setRewardExpiration(1);
                                                                            } else if (rewardExpiration === 0) {
                                                                                setRewardExpiration(1);
                                                                            }
                                                                        }}
                                                                    />
                                                                    <span className="slider"></span>
                                                                </label>
                                                            </div>
                                                        </Box>
                                                        {rewardExpirationStatus && (
                                                            <TextField
                                                                label="Expiration Days"
                                                                type="text"
                                                                helpText="The number of days after which the reward expires."
                                                                value={rewardExpiration}
                                                                onChange={(value) => {
                                                                    setRewardExpiration(NoLeadingZero(value));
                                                                    setValidationError({ ...validationError, rewardExpiration: '' });
                                                                }}
                                                                error={validationError?.rewardExpiration}
                                                                autoComplete="off"
                                                                suffix="Days"
                                                            />
                                                        )}

                                                        {!rewardExpirationStatus && (
                                                            <Text variant="bodyMd" tone="subdued">This reward will never expire.</Text>
                                                        )}
                                                    </BlockStack>
                                                </Card>
                                            )}
                                        </BlockStack>
                                    </Grid.Cell>

                                    <Grid.Cell columnSpan={{ xs: 6, sm: 2, md: 2, lg: 4, xl: 4 }}>
                                        <BlockStack gap={300}>
                                            <Card>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                    <Text variant='headingMd' as="span">Reward Summary</Text>
                                                    {/* <ul style={{ listStyle: 'inherit', paddingInline: 20 }}>
                                                    <li><p>Applies to all orders</p></li>
                                                </ul> */}
                                                    {rule?.type === "amount_discount" && (
                                                        <div>
                                                            <Text>Customer spends a set number of points.</Text>
                                                            <Text>They get a fixed amount off (e.g., 100 points = {currencySymbol?.symbol}1 off).</Text>
                                                            <Text>Discount can apply to the entire order or a specific collection.</Text>
                                                            <Text>Optional minimum cart value can be set.</Text>
                                                        </div>
                                                    )}
                                                    {rule?.type === "percentage_discount" && (
                                                        <div>
                                                            <Text>Customer spends points to get a % off (e.g., 100 points = 1% off).</Text>
                                                            <Text>Discount applies to the entire order or a selected collection.</Text>
                                                            <Text>Optional minimum cart requirement can be added.</Text>
                                                        </div>
                                                    )}
                                                    {(rule?.type === "free_shipping" || ruleType === "free_shipping") && (
                                                        <div>
                                                            <Text>Customer spends a set number of points.</Text>
                                                            <Text>They get free shipping on their order.</Text>
                                                            <Text>Optional maximum shipping amount and minimum cart value can be set.</Text>
                                                        </div>
                                                    )}
                                                    {rule?.type === "free_product" && (
                                                        <div>
                                                            <Text>Customer redeems points for a selected product.</Text>
                                                            <Text>Product is added to the cart at no cost.</Text>
                                                            <Text>Can be limited by availability, cart rules, or collections.</Text>
                                                        </div>
                                                    )}
                                                    {rule?.type === "earn_points" && (
                                                        <div>
                                                            <Text>Reward can be a fixed amount or a percentage of the first order value.</Text>
                                                            <Text>Points are automatically credited after the qualifying purchase.</Text>
                                                            <Text>Rewards can be restricted by minimum cart value.</Text>
                                                        </div>
                                                    )}
                                                </div>
                                            </Card>

                                            {/* <Card>
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
                                            </Card> */}
                                        </BlockStack>
                                    </Grid.Cell>
                                </Grid>
                            </Layout.Section>
                        </Layout >


                        {/* removed CollectionModal */}
                        {/* <CollectionModal
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
                        /> */}

                        {/* removed productModal */}
                        {/* <ProductModal
                            open={productModalOpen}
                            onClose={() => setProductModalOpen(false)}
                            selectedProducts={settings_json?.products}
                            onSave={(selected, totalPrice) => {
                                console.log('selected product12', selected)
                                const numericTotal = parseFloat(totalPrice) || 0;
                                setTotalProductPrice(numericTotal);
                                setSettingsJson({
                                    ...settings_json,
                                    products: selected,
                                    reward_value: numericTotal > 0 ? String(numericTotal) : settings_json.reward_value
                                });
                                if (numericTotal > 0) {
                                    setValidationError(prev => ({ ...prev, rewardValue: '' }));
                                }
                            }}
                        /> */}

                        <ConfirmationModal
                            isOpen={isDeleteModalOpen}
                            setIsOpen={setIsDeleteModalOpen}
                            text={'Are you sure you want to delete this rule?'}
                            title={'Delete Rule'}
                            buttonText={'Delete'}
                            buttonAction={() => {
                                if (isTierRewardEdit) {
                                    handleDeleteLocalData();
                                } else {
                                    referralRule ? DeleteReferralRuleAPI(ruleId) : DeleteRedeemRuleAPI(ruleId);
                                }
                            }}
                            destructive={true}
                            buttonLoader={deleteLoading}
                        />
                    </Page >
                )
            }
        </>

    )
}

export default CouponPage
export const MERCHANT_SETTINGS_ID = "MERCHANT_SETTINGS_ID";

export const setMerchantSettingsId = (id) => ({
    type: MERCHANT_SETTINGS_ID,
    payload: id,
});
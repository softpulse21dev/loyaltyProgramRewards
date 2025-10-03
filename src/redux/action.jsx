export const MERCHANT_SETTINGS_ID = "MERCHANT_SETTINGS_ID";
export const ADD_DATA = "ADD_DATA";
export const REMOVE_DATA = "REMOVE_DATA";
export const setMerchantSettingsId = (id) => ({
    type: MERCHANT_SETTINGS_ID,
    payload: id,
});

export const addData = (data) => ({
    type: ADD_DATA,
    payload: data,
});

export const removeData = () => ({
    type: REMOVE_DATA,
});
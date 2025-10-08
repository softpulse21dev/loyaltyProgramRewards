export const ADD_DATA = "ADD_DATA";
export const REMOVE_DATA = "REMOVE_DATA";
export const MASTER_REWARDS_LIST = "MASTER_REWARDS_LIST";
export const GET_VIP_TIER_DATA = "GET_VIP_TIER_DATA";
export const TIER_ID = "TIER_ID";
export const UPDATE_TIER_FORM_DATA = "UPDATE_TIER_FORM_DATA";
export const CLEAR_TIER_FORM_DATA = "CLEAR_TIER_FORM_DATA";
export const SET_DATA = "SET_DATA";
export const REMOVE_TIER_ID = "REMOVE_TIER_ID";
export const UPDATE_DATA = "UPDATE_DATA";


export const SetData = (data) => ({
    type: SET_DATA,
    payload: data,
});

export const addData = (data) => ({
    type: ADD_DATA,
    payload: data,
});

export const UpdateData = (data) => ({
    type: UPDATE_DATA,
    payload: data,
});

export const removeData = () => ({
    type: REMOVE_DATA,
});

export const MasterRewardsList = (data) => ({
    type: MASTER_REWARDS_LIST,
    payload: data,
});

export const GetVipTierData = (data) => ({
    type: GET_VIP_TIER_DATA,
    payload: data,
});

export const TierId = (data) => ({
    type: TIER_ID,
    payload: data,
});

export const RemoveTierId = () => ({
    type: REMOVE_TIER_ID,
});

export const UpdateTierFormData = (data) => ({
    type: UPDATE_TIER_FORM_DATA,
    payload: data,
});

export const ClearTierFormData = () => ({
    type: CLEAR_TIER_FORM_DATA,
});
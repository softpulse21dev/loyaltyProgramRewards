import { MERCHANT_SETTINGS_ID } from "./action"

const initialState = {
    merchantSettingsId: null,
}

export const merchantSettingsIdReducer = (state = initialState, action) => {
    switch (action.type) {
        case MERCHANT_SETTINGS_ID:
            return {
                ...state,
                merchantSettingsId: action.payload
            }
        default:
            return state;
    }
}

export default merchantSettingsIdReducer;
import { ADD_DATA, MERCHANT_SETTINGS_ID, REMOVE_DATA } from "./action"

const initialState = {
    merchantSettingsId: null,
    Data: null,
}

export const merchantSettingsIdReducer = (state = initialState, action) => {
    switch (action.type) {
        case MERCHANT_SETTINGS_ID:
            return {
                ...state,
                merchantSettingsId: action.payload
            }
        case ADD_DATA:
            return {
                ...state,
                Data: action.payload
            }
        case REMOVE_DATA:
            return {
                ...state,
                Data: null
            }
        default:
            return state;
    }
}

export default merchantSettingsIdReducer;
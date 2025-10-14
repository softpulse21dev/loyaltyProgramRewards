import { ADD_DATA, CLEAR_TIER_FORM_DATA, DELETE_DATA, GET_VIP_TIER_DATA, MASTER_REWARDS_LIST, REMOVE_DATA, REMOVE_TIER_ID, SET_DATA, TIER_ID, UPDATE_DATA, UPDATE_TIER_FORM_DATA } from "./action"

const initialTierFormState = {
    uid: null,
    tierName: '',
    goalValue: '',
    pointsMultiplier: '',
    selectedIcon: 'default',
    files: [],
    status: false,
};


const initialState = {
    Data: null,
    masterRewardsList: null,
    vipTierData: null,
    tierId: null,
    tierFormData: initialTierFormState,
}

export const merchantSettingsIdReducer = (state = initialState, action) => {
    switch (action.type) {
        case MASTER_REWARDS_LIST:
            return {
                ...state,
                masterRewardsList: action.payload
            }
        case GET_VIP_TIER_DATA:
            return {
                ...state,
                vipTierData: action.payload
            }
        case TIER_ID:
            return {
                ...state,
                tierId: action.payload
            }
        case REMOVE_TIER_ID:
            return {
                ...state,
                tierId: null
            }
        case DELETE_DATA:
            return {
                ...state,
                Data: state.Data.filter(item => item.clientId !== action.payload),
            };
        case SET_DATA: {
            const dataWithClientIds = action.payload.map(item => ({
                ...item,
                clientId: `client-${Date.now()}-${Math.random()}`
            }));
            return {
                ...state,
                Data: dataWithClientIds
            }
        }
        case ADD_DATA: {
            const currentData = Array.isArray(state.Data) ? state.Data : [];
            return {
                ...state,
                Data: [...currentData, ...action.payload],
            };
        }
        case UPDATE_DATA: {
            if (!Array.isArray(state.Data)) return state; // Safety check
            return {
                ...state,
                Data: state.Data.map(item =>
                    // Match by our new clientId instead of a non-existent 'id'
                    item.clientId === action.payload.clientId ? action.payload : item
                ),
            };
        }
        case REMOVE_DATA:
            return {
                ...state,
                Data: []
            }
        case UPDATE_TIER_FORM_DATA:
            return {
                ...state,
                tierFormData: action.payload
            }
        case CLEAR_TIER_FORM_DATA:
            return {
                ...state,
                tierFormData: initialTierFormState,
                Data: []
            }
        default:
            return state;
    }
}

export default merchantSettingsIdReducer;
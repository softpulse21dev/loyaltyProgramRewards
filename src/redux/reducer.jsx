import { ADD_DATA, CLEAR_TIER_FORM_DATA, DEFAULT_DATA, DELETE_DATA, GET_VIP_TIER_DATA, MASTER_REWARDS_LIST, REMOVE_DATA, REMOVE_TIER_ID, SET_DATA, TIER_ID, UPDATE_DATA, UPDATE_TIER_FORM_DATA } from "./action"

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
    defaultData: null,
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
            // Generate clientId only for items that don't already have one
            const dataWithClientIds = action.payload.map((item, index) => ({
                ...item,
                clientId: item.clientId || `client-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`
            }));
            return {
                ...state,
                Data: dataWithClientIds
            }
        }
        case ADD_DATA: {
            const currentData = Array.isArray(state.Data) ? state.Data : [];
            // Generate clientId for new items being added
            const newDataWithClientIds = action.payload.map((item, index) => ({
                ...item,
                clientId: item.clientId || `client-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`
            }));
            return {
                ...state,
                Data: [...currentData, ...newDataWithClientIds],
            };
        }
        case UPDATE_DATA: {
            if (!Array.isArray(state.Data)) {
                return state;
            }
            return {
                ...state,
                Data: state.Data.map(item => {
                    if (item.clientId === action.payload.clientId) {
                        // Preserve the original clientId, update other fields
                        const updatedItem = {
                            ...action.payload,
                            clientId: item.clientId // Ensure clientId is preserved
                        };
                        return updatedItem;
                    }
                    return item;
                }),
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
        case DEFAULT_DATA:
            return {
                ...state,
                defaultData: action.payload
            }
            
        default:
            return state;
    }
}

export default merchantSettingsIdReducer;
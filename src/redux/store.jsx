import { createStore, combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import merchantSettingsIdReducer from './reducer';

// We only want to persist the defaultData field in merchantSettings
const merchantSettingsPersistConfig = {
    key: 'merchantSettings',
    storage,
    whitelist: ['defaultData']
};

const rootReducer = combineReducers({
    merchantSettings: persistReducer(merchantSettingsPersistConfig, merchantSettingsIdReducer),
    // other reducers can go here
});

const store = createStore(rootReducer);
const persistor = persistStore(store);

export { store, persistor };
export default store;

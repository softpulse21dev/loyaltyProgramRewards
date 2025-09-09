import { createStore, combineReducers } from 'redux';
import merchantSettingsIdReducer from './reducer';

const rootReducer = combineReducers({
    merchantSettings: merchantSettingsIdReducer,
    // other reducers can go here
});

const store = createStore(rootReducer);

export default store;

import { createStore } from "redux";
import merchantSettingsIdReducer from "./reducer";

const store = createStore({
    reducer: merchantSettingsIdReducer,
})

export default store;
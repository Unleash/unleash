import { combineReducers } from 'redux';
import features from './features';

const unleashStore = combineReducers({
    features,
});

export default unleashStore;

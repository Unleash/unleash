import { combineReducers } from 'redux';
import features from './feature-store';

const unleashStore = combineReducers({
    features,
});

export default unleashStore;

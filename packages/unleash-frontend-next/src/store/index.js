import { combineReducers } from 'redux';
import features from './feature-store';
import strategies from './strategy-store';

const unleashStore = combineReducers({
    features,
    strategies,
});

export default unleashStore;

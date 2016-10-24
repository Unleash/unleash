import { combineReducers } from 'redux';
import features from './feature-store';
import strategies from './strategy-store';
import input from './input-store';

const unleashStore = combineReducers({
    features,
    strategies,
    input,
});

export default unleashStore;

import { combineReducers } from 'redux';
import features from './feature-toggle';
import error from './error';
import apiCalls from './api-calls';

const unleashStore = combineReducers({
    features,
    error,
    apiCalls,
});

export default unleashStore;

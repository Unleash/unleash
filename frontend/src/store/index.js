import { combineReducers } from 'redux';
import features from './feature-toggle';
import strategies from './strategy';
import error from './error';
import applications from './application';
import apiCalls from './api-calls';

const unleashStore = combineReducers({
    features,
    strategies,
    error,
    applications,
    apiCalls,
});

export default unleashStore;

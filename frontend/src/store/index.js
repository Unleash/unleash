import { combineReducers } from 'redux';
import features from './feature-toggle';
import strategies from './strategy';
import error from './error';
import applications from './application';
import projects from './project';
import apiCalls from './api-calls';

const unleashStore = combineReducers({
    features,
    strategies,
    error,
    applications,
    projects,
    apiCalls,
});

export default unleashStore;

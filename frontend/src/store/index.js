import { combineReducers } from 'redux';
import features from './feature-toggle';
import strategies from './strategy';
import error from './error';
import user from './user';
import applications from './application';
import projects from './project';
import addons from './addons';
import apiCalls from './api-calls';

const unleashStore = combineReducers({
    features,
    strategies,
    error,
    user,
    applications,
    projects,
    addons,
    apiCalls,
});

export default unleashStore;

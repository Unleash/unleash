import { combineReducers } from 'redux';
import features from './feature-toggle';
import featureMetrics from './feature-metrics';
import featureTags from './feature-tags';
import tagTypes from './tag-type';
import tags from './tag';
import strategies from './strategy';
import error from './error';
import user from './user';
import applications from './application';
import projects from './project';
import addons from './addons';
import apiCalls from './api-calls';

const unleashStore = combineReducers({
    features,
    featureMetrics,
    strategies,
    tagTypes,
    tags,
    featureTags,
    error,
    user,
    applications,
    projects,
    addons,
    apiCalls,
});

export default unleashStore;

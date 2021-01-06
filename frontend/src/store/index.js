import { combineReducers } from 'redux';
import features from './feature-store';
import featureTypes from './feature-type';
import featureMetrics from './feature-metrics-store';
import strategies from './strategy';
import history from './history-store'; // eslint-disable-line
import archive from './archive-store';
import error from './error-store';
import clientInstances from './client-instance-store';
import settings from './settings';
import user from './user';
import applications from './application';
import uiConfig from './ui-config';
import context from './context';
import projects from './project';

const unleashStore = combineReducers({
    features,
    featureTypes,
    featureMetrics,
    strategies,
    history,
    archive,
    error,
    clientInstances,
    settings,
    user,
    applications,
    uiConfig,
    context,
    projects,
});

export default unleashStore;

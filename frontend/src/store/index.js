import { combineReducers } from 'redux';
import features from './feature-store';
import featureMetrics from './feature-metrics-store';
import strategies from './strategy';
import input from './input-store';
import history from './history-store'; // eslint-disable-line
import archive from './archive-store';
import error from './error-store';
import clientInstances from './client-instance-store';
import settings from './settings';
import user from './user';
import api from './api';
import applications from './application';
import uiConfig from './ui-config';

const unleashStore = combineReducers({
    features,
    featureMetrics,
    strategies,
    input,
    history,
    archive,
    error,
    clientInstances,
    settings,
    user,
    applications,
    uiConfig,
    api,
});

export default unleashStore;

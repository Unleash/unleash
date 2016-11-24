import { combineReducers } from 'redux';
import features from './feature-store';
import featureMetrics from './feature-metrics-store';
import strategies from './strategy-store';
import input from './input-store';
import history from './history-store'; // eslint-disable-line
import archive from './archive-store';
import error from './error-store';
import metrics from './metrics-store';
import clientStrategies from './client-strategy-store';
import clientInstances from './client-instance-store';
import settings from './settings';
import user from './user';

const unleashStore = combineReducers({
    features,
    featureMetrics,
    strategies,
    input,
    history,
    archive,
    error,
    metrics,
    clientStrategies,
    clientInstances,
    settings,
    user,
});

export default unleashStore;

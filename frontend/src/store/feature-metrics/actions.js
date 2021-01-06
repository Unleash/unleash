import api from './api';

export const START_FETCH_FEATURE_METRICS = 'START_FETCH_FEATURE_METRICS';
export const RECEIVE_FEATURE_METRICS = 'RECEIVE_FEATURE_METRICS';
export const ERROR_FETCH_FEATURE_TOGGLES = 'ERROR_FETCH_FEATURE_TOGGLES';

export const START_FETCH_SEEN_APP = 'START_FETCH_SEEN_APP';
export const RECEIVE_SEEN_APPS = 'RECEIVE_SEEN_APPS';
export const ERROR_FETCH_SEEN_APP = 'ERROR_FETCH_SEEN_APP';

function receiveFeatureMetrics(json) {
    return {
        type: RECEIVE_FEATURE_METRICS,
        value: json,
        receivedAt: Date.now(),
    };
}

function receiveSeenApps(json) {
    return {
        type: RECEIVE_SEEN_APPS,
        value: json,
        receivedAt: Date.now(),
    };
}

function dispatchAndThrow(dispatch, type) {
    return error => {
        dispatch({ type, error, receivedAt: Date.now() });
        // throw error;
    };
}

export function fetchFeatureMetrics() {
    return dispatch => {
        dispatch({ type: START_FETCH_SEEN_APP });

        return api
            .fetchFeatureMetrics()
            .then(json => dispatch(receiveFeatureMetrics(json)))
            .catch(dispatchAndThrow(dispatch, ERROR_FETCH_SEEN_APP));
    };
}

export function fetchSeenApps() {
    return dispatch => {
        dispatch({ type: START_FETCH_FEATURE_METRICS });

        return api
            .fetchSeenApps()
            .then(json => dispatch(receiveSeenApps(json)))
            .catch(dispatchAndThrow(dispatch, ERROR_FETCH_FEATURE_TOGGLES));
    };
}

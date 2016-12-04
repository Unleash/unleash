import api from '../data/feature-metrics-api';

export const START_FETCH_FEATURE_METRICS    = 'START_FETCH_FEATURE_METRICS';
export const RECEIVE_FEATURE_METRICS        = 'RECEIVE_FEATURE_METRICS';
export const ERROR_FETCH_FEATURE_TOGGLES    = 'ERROR_FETCH_FEATURE_TOGGLES';

function receiveFeatureMetrics (json) {
    return {
        type: RECEIVE_FEATURE_METRICS,
        metrics: json,
        receivedAt: Date.now(),
    };
}

function dispatchAndThrow (dispatch, type) {
    return (error) => {
        dispatch({ type, error, receivedAt: Date.now() });
        throw error;
    };
}

export function fetchFeatureMetrics () {
    return dispatch => {
        dispatch({ type: START_FETCH_FEATURE_METRICS });

        return api.fetchFeatureMetrics()
            .then(json => dispatch(receiveFeatureMetrics(json)))
            .catch(dispatchAndThrow(dispatch, ERROR_FETCH_FEATURE_TOGGLES));
    };
}

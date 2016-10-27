import api from '../data/metrics-api';

export const RECEIVE_METRICS        = 'RECEIVE_METRICS';
export const ERROR_RECEIVE_METRICS  = 'ERROR_RECEIVE_METRICS';

const receiveMetrics = (json) => ({
    type: RECEIVE_METRICS,
    value: json,
});

const errorReceiveMetrics = (statusCode) => ({
    type: ERROR_RECEIVE_METRICS,
    statusCode,
});

export function fetchMetrics () {
    return dispatch => api.fetchAll()
        .then(json => dispatch(receiveMetrics(json)))
        .catch(error => dispatch(errorReceiveMetrics(error)));
}

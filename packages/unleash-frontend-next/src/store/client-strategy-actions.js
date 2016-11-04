import api from '../data/client-strategy-api';

export const RECEIVE_CLIENT_STRATEGIES = 'RECEIVE_CLIENT_STRATEGIES';
export const ERROR_RECEIVE_CLIENT_STRATEGIES = 'ERROR_RECEIVE_CLIENT_STRATEGIES';

const receiveMetrics = (json) => ({
    type: RECEIVE_CLIENT_STRATEGIES,
    value: json,
});

const errorReceiveMetrics = (statusCode) => ({
    type: RECEIVE_CLIENT_STRATEGIES,
    statusCode,
});

export function fetchClientStrategies () {
    return dispatch => api.fetchAll()
        .then(json => dispatch(receiveMetrics(json)))
        .catch(error => dispatch(errorReceiveMetrics(error)));
}

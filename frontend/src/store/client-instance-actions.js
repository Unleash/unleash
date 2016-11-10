import api from '../data/client-instance-api';

export const RECEIVE_CLIENT_INSTANCES = 'RECEIVE_CLIENT_INSTANCES';
export const ERROR_RECEIVE_CLIENT_INSTANCES = 'ERROR_RECEIVE_CLIENT_INSTANCES';

const receiveClientInstances = (json) => ({
    type: RECEIVE_CLIENT_INSTANCES,
    value: json,
});

const errorReceiveClientInstances = (statusCode) => ({
    type: RECEIVE_CLIENT_INSTANCES,
    statusCode,
});

export function fetchClientInstances () {
    return dispatch => api.fetchAll()
        .then(json => dispatch(receiveClientInstances(json)))
        .catch(error => dispatch(errorReceiveClientInstances(error)));
}

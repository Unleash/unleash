import api from '../../data/applications-api';

export const RECEIVE_APPLICATINS = 'RECEIVE_APPLICATINS';
export const ERROR_RECEIVE_APPLICATINS = 'ERROR_RECEIVE_APPLICATINS';

const recieveApplications = (json) => ({
    type: RECEIVE_APPLICATINS,
    value: json,
});

const errorReceiveApplications = (statusCode) => ({
    type: ERROR_RECEIVE_APPLICATINS,
    statusCode,
});

export function fetchApplications () {
    return dispatch => api.fetchAll()
        .then(json => dispatch(recieveApplications(json)))
        .catch(error => dispatch(errorReceiveApplications(error)));
}

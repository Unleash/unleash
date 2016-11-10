import api from '../data/history-api';

export const RECEIVE_HISTORY        = 'RECEIVE_HISTORY';
export const ERROR_RECEIVE_HISTORY  = 'ERROR_RECEIVE_HISTORY';

const receiveHistory = (json) => ({
    type: RECEIVE_HISTORY,
    value: json.events,
});

const errorReceiveHistory = (statusCode) => ({
    type: ERROR_RECEIVE_HISTORY,
    statusCode,
});

export function fetchHistory () {
    return dispatch => api.fetchAll()
        .then(json => dispatch(receiveHistory(json)))
        .catch(error => dispatch(errorReceiveHistory(error)));
}

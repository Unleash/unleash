import api from '../data/history-api';

export const RECEIVE_HISTORY        = 'RECEIVE_HISTORY';
export const ERROR_RECEIVE_HISTORY  = 'ERROR_RECEIVE_HISTORY';

export const RECEIVE_HISTORY_FOR_TOGGLE        = 'RECEIVE_HISTORY_FOR_TOGGLE';

const receiveHistory = (json) => ({
    type: RECEIVE_HISTORY,
    value: json.events,
});

const receiveHistoryforToggle = (json) => ({
    type: RECEIVE_HISTORY_FOR_TOGGLE,
    value: json,
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


export function fetchHistoryForToggle (toggleName) {
    return dispatch => api.fetchHistoryForToggle(toggleName)
        .then(json => dispatch(receiveHistoryforToggle(json)))
        .catch(error => dispatch(errorReceiveHistory(error)));
}

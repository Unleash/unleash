import api from '../../data/api';

export const RECIEVE_API_DETAILS = 'RECIEVE_API_DETAILS';
export const ERROR_RECIEVE_API_DETAILS = 'ERROR_RECIEVE_API_DETAILS';

export const RECEIVE_APPLICATION = 'RECEIVE_APPLICATION';

const recieveApiDetails = json => ({
    type: RECIEVE_API_DETAILS,
    value: json,
});

const errorRecieveApiDetails = (statusCode, type = ERROR_RECIEVE_API_DETAILS) => ({
    type,
    statusCode,
});

export function fetchAll() {
    return dispatch =>
        api
            .fetchAll()
            .then(json => dispatch(recieveApiDetails(json)))
            .catch(error => dispatch(errorRecieveApiDetails(error)));
}

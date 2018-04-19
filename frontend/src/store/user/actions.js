import api from '../../data/user-api';
import { dispatchAndThrow } from '../util';
export const UPDATE_USER = 'UPDATE_USER';
export const START_FETCH_USER = 'START_FETCH_USER';
export const ERROR_FETCH_USER = 'ERROR_FETCH_USER';
const debug = require('debug')('unleash:user-actions');

const updateUser = value => ({
    type: UPDATE_USER,
    value,
});

function handleError(error) {
    debug(error);
}

export function fetchUser() {
    debug('Start fetching user');
    return dispatch => {
        dispatch({ type: START_FETCH_USER });

        return api
            .fetchUser()
            .then(json => dispatch(updateUser(json)))
            .catch(dispatchAndThrow(dispatch, ERROR_FETCH_USER));
    };
}

export function unsecureLogin(path, user) {
    return dispatch => {
        dispatch({ type: START_FETCH_USER });

        return api
            .unsecureLogin(path, user)
            .then(json => dispatch(updateUser(json)))
            .catch(handleError);
    };
}

export function logoutUser() {
    return () => api.logoutUser().catch(handleError);
}

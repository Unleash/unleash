import api from './api';
import { dispatchAndThrow } from '../util';
export const USER_CHANGE_CURRENT = 'USER_CHANGE_CURRENT';
export const USER_LOGOUT = 'USER_LOGOUT';
export const USER_LOGIN = 'USER_LOGIN';
export const START_FETCH_USER = 'START_FETCH_USER';
export const ERROR_FETCH_USER = 'ERROR_FETCH_USER';
const debug = require('debug')('unleash:user-actions');

const updateUser = value => ({
    type: USER_CHANGE_CURRENT,
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

export function insecureLogin(path, user) {
    return dispatch => {
        dispatch({ type: START_FETCH_USER });

        return api
            .insecureLogin(path, user)
            .then(json => dispatch(updateUser(json)))
            .catch(handleError);
    };
}

export function passwordLogin(path, user) {
    return dispatch => {
        dispatch({ type: START_FETCH_USER });

        return api
            .passwordLogin(path, user)
            .then(json => dispatch(updateUser(json)))
            .then(() => dispatch({ type: USER_LOGIN }));
    };
}

export function logoutUser() {
    return dispatch => {
        dispatch({ type: USER_LOGOUT });
        window.location = 'logout';
    };
}

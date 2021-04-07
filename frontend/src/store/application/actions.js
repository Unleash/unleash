import api from './api';
import { dispatchError } from '../util';
import { MUTE_ERROR } from '../error/actions';

export const RECEIVE_ALL_APPLICATIONS = 'RECEIVE_ALL_APPLICATIONS';
export const ERROR_RECEIVE_ALL_APPLICATIONS = 'ERROR_RECEIVE_ALL_APPLICATIONS';
export const ERROR_UPDATING_APPLICATION_DATA = 'ERROR_UPDATING_APPLICATION_DATA';

export const RECEIVE_APPLICATION = 'RECEIVE_APPLICATION';
export const UPDATE_APPLICATION_FIELD = 'UPDATE_APPLICATION_FIELD';
export const DELETE_APPLICATION = 'DELETE_APPLICATION';
export const ERROR_DELETE_APPLICATION = 'ERROR_DELETE_APPLICATION';

const recieveAllApplications = json => ({
    type: RECEIVE_ALL_APPLICATIONS,
    value: json,
});

const recieveApplication = json => ({
    type: RECEIVE_APPLICATION,
    value: json,
});

export function fetchAll() {
    return dispatch =>
        api
            .fetchAll()
            .then(json => dispatch(recieveAllApplications(json)))
            .catch(dispatchError(dispatch, ERROR_RECEIVE_ALL_APPLICATIONS));
}

export function storeApplicationMetaData(appName, key, value) {
    return dispatch =>
        api
            .storeApplicationMetaData(appName, key, value)
            .then(() => {
                const info = `${appName} successfully updated!`;
                setTimeout(() => dispatch({ type: MUTE_ERROR, error: info }), 1000);
                dispatch({ type: UPDATE_APPLICATION_FIELD, appName, key, value, info });
            })
            .catch(dispatchError(dispatch, ERROR_UPDATING_APPLICATION_DATA));
}

export function fetchApplication(appName) {
    return dispatch =>
        api
            .fetchApplication(appName)
            .then(json => dispatch(recieveApplication(json)))
            .catch(dispatchError(dispatch, ERROR_RECEIVE_ALL_APPLICATIONS));
}

export function deleteApplication(appName) {
    return dispatch =>
        api
            .deleteApplication(appName)
            .then(() => dispatch({ type: DELETE_APPLICATION, appName }))
            .catch(dispatchError(dispatch, ERROR_DELETE_APPLICATION));
}

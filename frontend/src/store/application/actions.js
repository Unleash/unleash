import api from '../../data/applications-api';
import { dispatchAndThrow } from '../util';

export const RECEIVE_ALL_APPLICATIONS = 'RECEIVE_ALL_APPLICATIONS';
export const ERROR_RECEIVE_ALL_APPLICATIONS = 'ERROR_RECEIVE_ALL_APPLICATIONS';
export const ERROR_UPDATING_APPLICATION_DATA = 'ERROR_UPDATING_APPLICATION_DATA';

export const RECEIVE_APPLICATION = 'RECEIVE_APPLICATION';

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
            .catch(dispatchAndThrow(dispatch, ERROR_RECEIVE_ALL_APPLICATIONS));
}

export function storeApplicationMetaData(appName, key, value) {
    return dispatch =>
        api
            .storeApplicationMetaData(appName, key, value)
            .catch(dispatchAndThrow(dispatch, ERROR_UPDATING_APPLICATION_DATA));
}

export function fetchApplication(appName) {
    return dispatch =>
        api
            .fetchApplication(appName)
            .then(json => dispatch(recieveApplication(json)))
            .catch(dispatchAndThrow(dispatch, ERROR_RECEIVE_ALL_APPLICATIONS));
}

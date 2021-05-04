import api from './api';
import { dispatchError } from '../util';

export const RECEIVE_CONTEXT = 'RECEIVE_CONTEXT';
export const ERROR_RECEIVE_CONTEXT = 'ERROR_RECEIVE_CONTEXT';
export const REMOVE_CONTEXT = 'REMOVE_CONTEXT';
export const ERROR_REMOVING_CONTEXT = 'ERROR_REMOVING_CONTEXT';
export const ADD_CONTEXT_FIELD = 'ADD_CONTEXT_FIELD';
export const ERROR_ADD_CONTEXT_FIELD = 'ERROR_ADD_CONTEXT_FIELD';
export const UPDATE_CONTEXT_FIELD = 'UPDATE_CONTEXT_FIELD';
export const ERROR_UPDATE_CONTEXT_FIELD = 'ERROR_UPDATE_CONTEXT_FIELD';

export const receiveContext = value => ({ type: RECEIVE_CONTEXT, value });
const addContextField = context => ({ type: ADD_CONTEXT_FIELD, context });
const upContextField = context => ({ type: UPDATE_CONTEXT_FIELD, context });
const createRemoveContext = context => ({ type: REMOVE_CONTEXT, context });

export function fetchContext() {
    return dispatch =>
        api
            .fetchAll()
            .then(json => {
                json.sort((a, b) => a.sortOrder - b.sortOrder);
                dispatch(receiveContext(json));
            })
            .catch(dispatchError(dispatch, ERROR_RECEIVE_CONTEXT));
}

export function removeContextField(context) {
    return dispatch =>
        api
            .remove(context)
            .then(() => dispatch(createRemoveContext(context)))
            .catch(dispatchError(dispatch, ERROR_REMOVING_CONTEXT));
}

export function createContextField(context) {
    return dispatch =>
        api
            .create(context)
            .then(() => dispatch(addContextField(context)))
            .catch(e => {
                dispatchError(dispatch, ERROR_ADD_CONTEXT_FIELD);
                throw e;
            });
}

export function updateContextField(context) {
    return dispatch =>
        api
            .update(context)
            .then(() => dispatch(upContextField(context)))
            .catch(dispatchError(dispatch, ERROR_UPDATE_CONTEXT_FIELD));
}

export function validateName(name) {
    return api.validate({ name });
}

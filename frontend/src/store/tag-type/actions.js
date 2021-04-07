import api from './api';
import { dispatchError } from '../util';

export const START_FETCH_TAG_TYPES = 'START_FETCH_TAG_TYPES';
export const RECEIVE_TAG_TYPES = 'RECEIVE_TAG_TYPES';
export const ERROR_FETCH_TAG_TYPES = 'ERROR_FETCH_TAG_TYPES';
export const START_CREATE_TAG_TYPE = 'START_CREATE_TAG_TYPE';
export const ADD_TAG_TYPE = 'ADD_TAG_TYPE';
export const ERROR_CREATE_TAG_TYPE = 'ERROR_CREATE_TAG_TYPE';
export const START_DELETE_TAG_TYPE = 'START_DELETE_TAG_TYPE';
export const DELETE_TAG_TYPE = 'DELETE_TAG_TYPE';
export const ERROR_DELETE_TAG_TYPE = 'ERROR_DELETE_TAG_TYPE';
export const START_UPDATE_TAG_TYPE = 'START_UPDATE_TAG_TYPE';
export const UPDATE_TAG_TYPE = 'UPDATE_TAG_TYPE';
export const ERROR_UPDATE_TAG_TYPE = 'ERROR_UPDATE_TAG_TYPE';

function receiveTagTypes(json) {
    return {
        type: RECEIVE_TAG_TYPES,
        value: json,
        receivedAt: Date.now(),
    };
}

export function fetchTagTypes() {
    return dispatch => {
        dispatch({ type: START_FETCH_TAG_TYPES });
        return api
            .fetchTagTypes()
            .then(json => dispatch(receiveTagTypes(json)))
            .catch(dispatchError(dispatch, ERROR_FETCH_TAG_TYPES));
    };
}

export function createTagType({ name, description, icon }) {
    return dispatch => {
        dispatch({ type: START_CREATE_TAG_TYPE });
        return api
            .create({ name, description, icon })
            .then(() => dispatch({ type: ADD_TAG_TYPE, tagType: { name, description, icon } }))
            .catch(dispatchError(dispatch, ERROR_CREATE_TAG_TYPE));
    };
}

export function updateTagType({ name, description, icon }) {
    return dispatch => {
        dispatch({ type: START_UPDATE_TAG_TYPE });
        return api
            .update({ name, description, icon })
            .then(() => dispatch({ type: UPDATE_TAG_TYPE, tagType: { name, description, icon } }))
            .catch(dispatchError(dispatch, ERROR_UPDATE_TAG_TYPE));
    };
}

export function removeTagType(name) {
    return dispatch => {
        dispatch({ type: START_DELETE_TAG_TYPE });
        return api
            .deleteTagType(name)
            .then(() => dispatch({ type: DELETE_TAG_TYPE, tagType: { name } }))
            .catch(dispatchError(dispatch, ERROR_DELETE_TAG_TYPE));
    };
}

export function validateName(name) {
    return api.validateTagType({ name });
}

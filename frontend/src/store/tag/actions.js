import api from './api';
import { dispatchAndThrow } from '../util';

export const START_FETCH_TAGS = 'START_FETCH_TAGS';
export const RECEIVE_TAGS = 'RECEIVE_TAGS';
export const ERROR_FETCH_TAGS = 'ERROR_FETCH_TAGS';
export const START_CREATE_TAG = 'START_CREATE_TAG';
export const ADD_TAG = 'ADD_TAG';
export const ERROR_CREATE_TAG = 'ERROR_CREATE_TAG';
export const START_DELETE_TAG = 'START_DELETE_TAG';
export const DELETE_TAG = 'DELETE_TAG';
export const ERROR_DELETE_TAG = 'ERROR_DELETE_TAG';

function receiveTags(json) {
    return {
        type: RECEIVE_TAGS,
        value: json,
        receivedAt: Date.now(),
    };
}

export function fetchTags() {
    return dispatch => {
        dispatch({ type: START_FETCH_TAGS });
        return api
            .fetchTags()
            .then(json => dispatch(receiveTags(json)))
            .catch(dispatchAndThrow(dispatch, ERROR_FETCH_TAGS));
    };
}

export function create({ type, value }) {
    return dispatch => {
        dispatch({ type: START_CREATE_TAG });
        return api
            .create({ type, value })
            .then(() => dispatch({ type: ADD_TAG, tag: { type, value } }))
            .catch(dispatchAndThrow(dispatch, ERROR_CREATE_TAG));
    };
}

export function removeTag(tag) {
    return dispatch => {
        dispatch({ type: START_DELETE_TAG });
        return api
            .deleteTag(tag)
            .then(() => dispatch({ type: DELETE_TAG, tag }))
            .catch(dispatchAndThrow(dispatch, ERROR_DELETE_TAG));
    };
}

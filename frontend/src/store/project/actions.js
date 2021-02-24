import api from './api';
import { dispatchAndThrow } from '../util';

export const RECEIVE_PROJECT = 'RECEIVE_PROJECT';
export const ERROR_RECEIVE_PROJECT = 'ERROR_RECEIVE_PROJECT';
export const REMOVE_PROJECT = 'REMOVE_PROJECT';
export const ERROR_REMOVING_PROJECT = 'ERROR_REMOVING_PROJECT';
export const ADD_PROJECT = 'ADD_PROJECT';
export const ERROR_ADD_PROJECT = 'ERROR_ADD_PROJECT';
export const UPDATE_PROJECT = 'UPDATE_PROJECT';
export const ERROR_UPDATE_PROJECT = 'ERROR_UPDATE_PROJECT';

const addProject = project => ({ type: ADD_PROJECT, project });
const upProject = project => ({ type: UPDATE_PROJECT, project });
const delProject = project => ({ type: REMOVE_PROJECT, project });

export function fetchProjects() {
    const receiveProjects = value => ({ type: RECEIVE_PROJECT, value });
    return dispatch =>
        api
            .fetchAll()
            .then(json => {
                dispatch(receiveProjects(json.projects));
            })
            .catch(dispatchAndThrow(dispatch, ERROR_RECEIVE_PROJECT));
}

export function removeProject(project) {
    return dispatch =>
        api
            .remove(project)
            .then(() => dispatch(delProject(project)))
            .catch(dispatchAndThrow(dispatch, ERROR_REMOVING_PROJECT));
}

export function createProject(project) {
    return dispatch =>
        api
            .create(project)
            .then(() => dispatch(addProject(project)))
            .catch(dispatchAndThrow(dispatch, ERROR_ADD_PROJECT));
}

export function updateProject(project) {
    return dispatch =>
        api
            .update(project)
            .then(() => dispatch(upProject(project)))
            .catch(dispatchAndThrow(dispatch, ERROR_UPDATE_PROJECT));
}

export function validateId(id) {
    return api.validate({ id });
}

import api from './feature-api';
const debug = require('debug')('unleash:feature-actions');

export const ADD_FEATURE_TOGGLE             = 'ADD_FEATURE_TOGGLE';
export const UPDATE_FEATURE_TOGGLE          = 'UPDATE_FEATURE_TOGGLE';
export const TOGGLE_FEATURE_TOGGLE          = 'TOGGLE_FEATURE_TOGGLE';
export const REQUEST_FEATURE_TOGGLES        = 'REQUEST_FEATURE_TOGGLES';
export const START_UPDATE_FEATURE_TOGGLE    = 'START_UPDATE_FEATURE_TOGGLE';
export const START_CREATE_FEATURE_TOGGLE    = 'START_CREATE_FEATURE_TOGGLE';
export const RECEIVE_FEATURE_TOGGLES        = 'RECEIVE_FEATURE_TOGGLES';
export const ERROR_RECEIVE_FEATURE_TOGGLES  = 'ERROR_RECEIVE_FEATURE_TOGGLES';
export const ERROR_CREATING_FEATURE_TOGGLE  = 'ERROR_CREATING_FEATURE_TOGGLE';
export const ERROR_UPDATING_FEATURE_TOGGLE  = 'ERROR_UPDATING_FEATURE_TOGGLE';

function addFeatureToggle (featureToggle) {
    return {
        type: ADD_FEATURE_TOGGLE,
        featureToggle,
    };
};

function updateFeatureToggle (featureToggle) {
    return {
        type: UPDATE_FEATURE_TOGGLE,
        featureToggle,
    };
};

function errorCreatingFeatureToggle (statusCode) {
    return {
        type: ERROR_CREATING_FEATURE_TOGGLE,
        statusCode,
        receivedAt: Date.now(),
    };
}

function errorUpdatingFeatureToggle (statusCode) {
    return {
        type: ERROR_UPDATING_FEATURE_TOGGLE,
        statusCode,
        receivedAt: Date.now(),
    };
}

export function toggleFeature (featureToggle) {
    debug('Toggle feature toggle ', featureToggle);
    return dispatch => {
        const newValue = Object.assign({}, featureToggle, { enabled: !featureToggle.enabled });
        dispatch(requestUpdateFeatureToggle(newValue));
    };
};

export function editFeatureToggle (featureToggle) {
    debug('Update feature toggle ', featureToggle);
    return dispatch => {
        dispatch(requestUpdateFeatureToggle(featureToggle));
    };
};

function requestFeatureToggles () {
    return {
        type: REQUEST_FEATURE_TOGGLES,
    };
}

function receiveFeatureToggles (json) {
    debug('reviced feature toggles', json);
    return {
        type: RECEIVE_FEATURE_TOGGLES,
        featureToggles: json.features.map(features => features),
        receivedAt: Date.now(),
    };
}

function startUpdateFeatureToggle () {
    return {
        type: START_UPDATE_FEATURE_TOGGLE,
    };
}

function startCreateFeatureToggle () {
    return {
        type: START_CREATE_FEATURE_TOGGLE,
    };
}

function errorReceiveFeatureToggles (statusCode) {
    return {
        type: ERROR_RECEIVE_FEATURE_TOGGLES,
        statusCode,
        receivedAt: Date.now(),
    };
}

export function fetchFeatureToggles () {
    debug('Start fetching feature toggles');
    return dispatch => {
        dispatch(requestFeatureToggles());

        return api.fetchAll()
            .then(json => dispatch(receiveFeatureToggles(json)))
            .catch(error => dispatch(errorReceiveFeatureToggles(error)));
    };
}

export function createFeatureToggles (featureToggle) {
    return dispatch => {
        dispatch(startCreateFeatureToggle());

        return api.create(featureToggle)
            .then(() => dispatch(addFeatureToggle(featureToggle)))
            .catch(error => dispatch(errorCreatingFeatureToggle(error)));
    };
}

export function requestUpdateFeatureToggle (featureToggle) {
    return dispatch => {
        dispatch(startUpdateFeatureToggle());

        return api.update(featureToggle)
            .then(() => dispatch(updateFeatureToggle(featureToggle)))
            .catch(error => dispatch(errorUpdatingFeatureToggle(error)));
    };
}


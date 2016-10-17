import { urls } from './urls';

export const ADD_FEATURE_TOGGLE             = 'ADD_FEATURE_TOGGLE';
export const UPDATE_FEATURE_TOGGLE          = 'UPDATE_FEATURE_TOGGLE';
export const TOGGLE_FEATURE_TOGGLE          = 'TOGGLE_FEATURE_TOGGLE';
export const REQUEST_FEATURE_TOGGLES        = 'REQUEST_FEATURE_TOGGLES';
export const REQUEST_UPDATE_FEATURE_TOGGLES = 'REQUEST_UPDATE_FEATURE_TOGGLES';
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
    return dispatch => {
        const newValue = Object.assign({}, featureToggle, { enabled: !featureToggle.enabled });
        dispatch(requestUpdateFeatureToggle(newValue));
    };
};


function requestFeatureToggles () {
    return {
        type: REQUEST_FEATURE_TOGGLES,
    };
}

function receiveFeatureToggles (json) {
    return {
        type: RECEIVE_FEATURE_TOGGLES,
        featureToggles: json.features.map(features => features),
        receivedAt: Date.now(),
    };
}

function requestUpdateFeatureToggles () {
    return {
        type: REQUEST_UPDATE_FEATURE_TOGGLES,
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
    return dispatch => {
        dispatch(requestFeatureToggles());
        return fetch(urls.features)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    let error = new Error('failed fetching');
                    error.status = response.status;
                    throw error;
                }
            })
            .then(json => dispatch(receiveFeatureToggles(json)))
            .catch(error => dispatch(errorReceiveFeatureToggles(error)));
    };
}

const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
};

export function createFeatureToggles (featureToggle) {
    return dispatch => {
        dispatch(requestUpdateFeatureToggles());
        return fetch(urls.features, {
            method: 'POST',
            headers,
            body: JSON.stringify(featureToggle),
        })
        .then(response => {
            if (!response.ok) {
                let error = new Error('failed fetching');
                error.status = response.status;
                throw error;
            }
        })
        .then(() => dispatch(addFeatureToggle(featureToggle)))
        .catch(error => dispatch(errorCreatingFeatureToggle(error)));
    };
}

export function requestUpdateFeatureToggle (featureToggle) {
    return dispatch => {
        dispatch(requestUpdateFeatureToggles());
        return fetch(`${urls.features}/${featureToggle.name}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(featureToggle),
        })
        .then(response => {
            if (!response.ok) {
                let error = new Error('failed fetching');
                error.status = response.status;
                throw error;
            }
        })
        .then(() => dispatch(updateFeatureToggle(featureToggle)))
        .catch(error => dispatch(errorUpdatingFeatureToggle(error)));
    };
}


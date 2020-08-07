import api from '../data/feature-api';
const debug = require('debug')('unleash:feature-actions');
import { dispatchAndThrow } from './util';
import { MUTE_ERROR } from './error-actions';

export const ADD_FEATURE_TOGGLE = 'ADD_FEATURE_TOGGLE';
export const COPY_FEATURE_TOGGLE = 'COPY_FEATURE_TOGGLE';
export const REMOVE_FEATURE_TOGGLE = 'REMOVE_FEATURE_TOGGLE';
export const UPDATE_FEATURE_TOGGLE = 'UPDATE_FEATURE_TOGGLE';
export const TOGGLE_FEATURE_TOGGLE = 'TOGGLE_FEATURE_TOGGLE';
export const START_FETCH_FEATURE_TOGGLES = 'START_FETCH_FEATURE_TOGGLES';
export const START_UPDATE_FEATURE_TOGGLE = 'START_UPDATE_FEATURE_TOGGLE';
export const START_CREATE_FEATURE_TOGGLE = 'START_CREATE_FEATURE_TOGGLE';
export const START_REMOVE_FEATURE_TOGGLE = 'START_REMOVE_FEATURE_TOGGLE';
export const RECEIVE_FEATURE_TOGGLES = 'RECEIVE_FEATURE_TOGGLES';
export const ERROR_FETCH_FEATURE_TOGGLES = 'ERROR_FETCH_FEATURE_TOGGLES';
export const ERROR_CREATING_FEATURE_TOGGLE = 'ERROR_CREATING_FEATURE_TOGGLE';
export const ERROR_UPDATE_FEATURE_TOGGLE = 'ERROR_UPDATE_FEATURE_TOGGLE';
export const ERROR_REMOVE_FEATURE_TOGGLE = 'ERROR_REMOVE_FEATURE_TOGGLE';
export const UPDATE_FEATURE_TOGGLE_STRATEGIES = 'UPDATE_FEATURE_TOGGLE_STRATEGIES';

export function toggleFeature(enable, name) {
    debug('Toggle feature toggle ', name);
    return dispatch => {
        dispatch(requestToggleFeatureToggle(enable, name));
    };
}

export function setStale(stale, name) {
    debug('Set stale property on feature toggle ', name);
    return dispatch => {
        dispatch(requestSetStaleFeatureToggle(stale, name));
    };
}

export function editFeatureToggle(featureToggle) {
    debug('Update feature toggle ', featureToggle);
    return dispatch => {
        dispatch(requestUpdateFeatureToggle(featureToggle));
    };
}

function receiveFeatureToggles(json) {
    debug('reviced feature toggles', json);
    return {
        type: RECEIVE_FEATURE_TOGGLES,
        featureToggles: json.features.map(features => features),
        receivedAt: Date.now(),
    };
}

export function fetchFeatureToggles() {
    debug('Start fetching feature toggles');
    return dispatch => {
        dispatch({ type: START_FETCH_FEATURE_TOGGLES });

        return api
            .fetchAll()
            .then(json => dispatch(receiveFeatureToggles(json)))
            .catch(dispatchAndThrow(dispatch, ERROR_FETCH_FEATURE_TOGGLES));
    };
}

export function createFeatureToggles(featureToggle) {
    return dispatch => {
        dispatch({ type: START_CREATE_FEATURE_TOGGLE });

        return api
            .create(featureToggle)
            .then(() => dispatch({ type: ADD_FEATURE_TOGGLE, featureToggle }))
            .catch(dispatchAndThrow(dispatch, ERROR_CREATING_FEATURE_TOGGLE));
    };
}

export function requestToggleFeatureToggle(enable, name) {
    return dispatch => {
        dispatch({ type: START_UPDATE_FEATURE_TOGGLE });

        return api
            .toggle(enable, name)
            .then(() => dispatch({ type: TOGGLE_FEATURE_TOGGLE, name }))
            .catch(dispatchAndThrow(dispatch, ERROR_UPDATE_FEATURE_TOGGLE));
    };
}

export function requestSetStaleFeatureToggle(stale, name) {
    return dispatch => {
        dispatch({ type: START_UPDATE_FEATURE_TOGGLE });

        return api
            .setStale(stale, name)
            .then(featureToggle => {
                const info = `${name} marked as ${stale ? 'Stale' : 'Active'}.`;
                setTimeout(() => dispatch({ type: MUTE_ERROR, error: info }), 1000);
                dispatch({ type: UPDATE_FEATURE_TOGGLE, featureToggle, info });
            })
            .catch(dispatchAndThrow(dispatch, ERROR_UPDATE_FEATURE_TOGGLE));
    };
}

export function requestUpdateFeatureToggle(featureToggle) {
    return dispatch => {
        dispatch({ type: START_UPDATE_FEATURE_TOGGLE });

        return api
            .update(featureToggle)
            .then(() => {
                const info = `${featureToggle.name} successfully updated!`;
                setTimeout(() => dispatch({ type: MUTE_ERROR, error: info }), 1000);
                dispatch({ type: UPDATE_FEATURE_TOGGLE, featureToggle, info });
            })
            .catch(dispatchAndThrow(dispatch, ERROR_UPDATE_FEATURE_TOGGLE));
    };
}

export function requestUpdateFeatureToggleStrategies(featureToggle, newStrategies) {
    return dispatch => {
        featureToggle.strategies = newStrategies;
        dispatch({ type: START_UPDATE_FEATURE_TOGGLE });

        return api
            .update(featureToggle)
            .then(() => {
                const info = `${featureToggle.name} successfully updated!`;
                setTimeout(() => dispatch({ type: MUTE_ERROR, error: info }), 1000);
                return dispatch({ type: UPDATE_FEATURE_TOGGLE_STRATEGIES, featureToggle, info });
            })
            .catch(dispatchAndThrow(dispatch, ERROR_UPDATE_FEATURE_TOGGLE));
    };
}

export function requestUpdateFeatureToggleVariants(featureToggle, newVariants) {
    return dispatch => {
        featureToggle.variants = newVariants;
        dispatch({ type: START_UPDATE_FEATURE_TOGGLE });

        return api
            .update(featureToggle)
            .then(() => {
                const info = `${featureToggle.name} successfully updated!`;
                setTimeout(() => dispatch({ type: MUTE_ERROR, error: info }), 1000);
                return dispatch({ type: UPDATE_FEATURE_TOGGLE_STRATEGIES, featureToggle, info });
            })
            .catch(dispatchAndThrow(dispatch, ERROR_UPDATE_FEATURE_TOGGLE));
    };
}

export function removeFeatureToggle(featureToggleName) {
    return dispatch => {
        dispatch({ type: START_REMOVE_FEATURE_TOGGLE });

        return api
            .remove(featureToggleName)
            .then(() => dispatch({ type: REMOVE_FEATURE_TOGGLE, featureToggleName }))
            .catch(dispatchAndThrow(dispatch, ERROR_REMOVE_FEATURE_TOGGLE));
    };
}

export function validateName(featureToggleName) {
    return api.validate({ name: featureToggleName });
}

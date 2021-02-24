import api from './api';
import { dispatchAndThrow } from '../util';
export const RECIEVE_GOOGLE_CONFIG = 'RECIEVE_GOOGLE_CONFIG';
export const RECIEVE_GOOGLE_CONFIG_ERROR = 'RECIEVE_GOOGLE_CONFIG_ERROR';
export const UPDATE_GOOGLE_AUTH = 'UPDATE_GOOGLE_AUTH';
export const UPDATE_GOOGLE_AUTH_ERROR = 'UPDATE_GOOGLE_AUTH_ERROR';
export const RECIEVE_SAML_CONFIG = 'RECIEVE_SAML_CONFIG';
export const RECIEVE_SAML_CONFIG_ERROR = 'RECIEVE_SAML_CONFIG_ERROR';
export const UPDATE_SAML_AUTH = 'UPDATE_SAML_AUTH';
export const UPDATE_SAML_AUTH_ERROR = 'UPDATE_SAML_AUTH_ERROR';

const debug = require('debug')('unleash:e-admin-auth-actions');

export function getGoogleConfig() {
    debug('Start fetching google-auth config');
    return dispatch =>
        api
            .getGoogleConfig()
            .then(config =>
                dispatch({
                    type: RECIEVE_GOOGLE_CONFIG,
                    config,
                })
            )
            .catch(dispatchAndThrow(dispatch, RECIEVE_GOOGLE_CONFIG_ERROR));
}

export function updateGoogleConfig(data) {
    return dispatch =>
        api
            .updateGoogleConfig(data)
            .then(config => dispatch({ type: UPDATE_GOOGLE_AUTH, config }))
            .catch(dispatchAndThrow(dispatch, UPDATE_GOOGLE_AUTH_ERROR));
}

export function getSamlConfig() {
    debug('Start fetching Saml-auth config');
    return dispatch =>
        api
            .getSamlConfig()
            .then(config =>
                dispatch({
                    type: RECIEVE_SAML_CONFIG,
                    config,
                })
            )
            .catch(dispatchAndThrow(dispatch, RECIEVE_SAML_CONFIG_ERROR));
}

export function updateSamlConfig(data) {
    return dispatch =>
        api
            .updateSamlConfig(data)
            .then(config => dispatch({ type: UPDATE_SAML_AUTH, config }))
            .catch(dispatchAndThrow(dispatch, UPDATE_SAML_AUTH_ERROR));
}

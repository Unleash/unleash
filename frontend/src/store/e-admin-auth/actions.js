import api from './api';
import { dispatchError } from '../util';
export const RECIEVE_GOOGLE_CONFIG = 'RECIEVE_GOOGLE_CONFIG';
export const RECIEVE_GOOGLE_CONFIG_ERROR = 'RECIEVE_GOOGLE_CONFIG_ERROR';
export const UPDATE_GOOGLE_AUTH = 'UPDATE_GOOGLE_AUTH';
export const UPDATE_GOOGLE_AUTH_ERROR = 'UPDATE_GOOGLE_AUTH_ERROR';
export const RECIEVE_SAML_CONFIG = 'RECIEVE_SAML_CONFIG';
export const RECIEVE_SAML_CONFIG_ERROR = 'RECIEVE_SAML_CONFIG_ERROR';
export const UPDATE_SAML_AUTH = 'UPDATE_SAML_AUTH';
export const UPDATE_SAML_AUTH_ERROR = 'UPDATE_SAML_AUTH_ERROR';
export const RECIEVE_OIDC_CONFIG = 'RECIEVE_OIDC_CONFIG';
export const RECIEVE_OIDC_CONFIG_ERROR = 'RECIEVE_OIDC_CONFIG_ERROR';
export const UPDATE_OIDC_AUTH = 'UPDATE_OIDC_AUTH';
export const UPDATE_OIDC_AUTH_ERROR = 'UPDATE_OIDC_AUTH_ERROR';

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
            .catch(dispatchError(dispatch, RECIEVE_GOOGLE_CONFIG_ERROR));
}

export function updateGoogleConfig(data) {
    return dispatch =>
        api
            .updateGoogleConfig(data)
            .then(config => dispatch({ type: UPDATE_GOOGLE_AUTH, config }))
            .catch(e => {
                dispatchError(dispatch, UPDATE_GOOGLE_AUTH_ERROR)(e);
                throw e;
            });
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
            .catch(dispatchError(dispatch, RECIEVE_SAML_CONFIG_ERROR));
}

export function updateSamlConfig(data) {
    return dispatch =>
        api
            .updateSamlConfig(data)
            .then(config => dispatch({ type: UPDATE_SAML_AUTH, config }))
            .catch(e => {
                dispatchError(dispatch, UPDATE_SAML_AUTH_ERROR)(e);
                throw e;
            });
}

export function getOidcConfig() {
    debug('Start fetching OIDC-auth config');
    return dispatch =>
        api
            .getOidcConfig()
            .then(config =>
                dispatch({
                    type: RECIEVE_OIDC_CONFIG,
                    config,
                })
            )
            .catch(dispatchError(dispatch, RECIEVE_OIDC_CONFIG_ERROR));
}

export function updateOidcConfig(data) {
    return dispatch =>
        api
            .updateOidcConfig(data)
            .then(config => dispatch({ type: UPDATE_OIDC_AUTH, config }))
            .catch(e => {
                dispatchError(dispatch, UPDATE_OIDC_AUTH_ERROR)(e);
                throw e;
            });
}
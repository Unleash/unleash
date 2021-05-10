import { throwIfNotSuccess, headers } from '../api-helper';
import { formatApiPath } from '../../utils/format-path';

const GOOGLE_URI = formatApiPath('api/admin/auth/google/settings');
const SAML_URI = formatApiPath('api/admin/auth/saml/settings');
const OIDC_URI = formatApiPath('api/admin/auth/oidc/settings');

function getGoogleConfig() {
    return fetch(GOOGLE_URI, { headers, credentials: 'include' })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

function updateGoogleConfig(data) {
    return fetch(GOOGLE_URI, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
        credentials: 'include',
    })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

function getSamlConfig() {
    return fetch(SAML_URI, { headers, credentials: 'include' })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

function updateSamlConfig(data) {
    return fetch(SAML_URI, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
        credentials: 'include',
    })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

function getOidcConfig() {
    return fetch(OIDC_URI, { headers, credentials: 'include' })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

function updateOidcConfig(data) {
    return fetch(OIDC_URI, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
        credentials: 'include',
    })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

export default {
    getGoogleConfig,
    updateGoogleConfig,
    getSamlConfig,
    updateSamlConfig,
    getOidcConfig,
    updateOidcConfig,
};

import { throwIfNotSuccess, headers } from '../api-helper';

const GOOGLE_URI = 'api/admin/auth/google/settings';
const SAML_URI = 'api/admin/auth/saml/settings';

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

export default {
    getGoogleConfig,
    updateGoogleConfig,
    getSamlConfig,
    updateSamlConfig,
};

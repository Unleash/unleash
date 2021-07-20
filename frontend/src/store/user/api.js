import { formatApiPath } from '../../utils/format-path';
import { throwIfNotSuccess, headers } from '../api-helper';

const URI = formatApiPath('api/admin/user');

function fetchUser() {
    return fetch(URI, { credentials: 'include' })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

function insecureLogin(path, user) {
    return fetch(path, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(user),
    })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

function demoLogin(path, user) {
    return fetch(path, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(user),
    })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

function passwordLogin(path, data) {
    return fetch(path, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(data),
    })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

const api = {
    fetchUser,
    insecureLogin,
    demoLogin,
    passwordLogin,
};

export default api;

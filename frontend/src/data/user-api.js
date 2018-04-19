import { throwIfNotSuccess, headers } from './helper';

const URI = 'api/admin/user';

function logoutUser() {
    return fetch(`${URI}/logout`, { method: 'GET', credentials: 'include' })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

function fetchUser() {
    return fetch(URI, { credentials: 'include' })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

function unsecureLogin(path, user) {
    return fetch(path, { method: 'POST', credentials: 'include', headers, body: JSON.stringify(user) })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

export default {
    fetchUser,
    unsecureLogin,
    logoutUser,
};

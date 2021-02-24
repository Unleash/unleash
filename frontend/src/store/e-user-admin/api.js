import { throwIfNotSuccess, headers } from '../api-helper';

const URI = 'api/admin/user-admin';

function fetchAll() {
    return fetch(URI, { headers, credentials: 'include' })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

function create(user) {
    return fetch(URI, {
        method: 'POST',
        headers,
        body: JSON.stringify(user),
        credentials: 'include',
    })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

function update(user) {
    return fetch(`${URI}/${user.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(user),
        credentials: 'include',
    })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

function changePassword(user, newPassword) {
    return fetch(`${URI}/${user.id}/change-password`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ password: newPassword }),
        credentials: 'include',
    }).then(throwIfNotSuccess);
}

function validatePassword(password) {
    return fetch(`${URI}/validate-password`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ password }),
        credentials: 'include',
    }).then(throwIfNotSuccess);
}

function remove(user) {
    return fetch(`${URI}/${user.id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
    }).then(throwIfNotSuccess);
}

export default {
    fetchAll,
    create,
    update,
    changePassword,
    validatePassword,
    remove,
};

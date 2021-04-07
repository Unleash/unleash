import { throwIfNotSuccess, headers } from '../api-helper';

const URI = 'api/admin/addons';

function fetchAll() {
    return fetch(URI, { credentials: 'include' })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

function create(addonConfig) {
    return fetch(URI, {
        method: 'POST',
        headers,
        body: JSON.stringify(addonConfig),
        credentials: 'include',
    }).then(throwIfNotSuccess);
}

function update(addonConfig) {
    return fetch(`${URI}/${addonConfig.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(addonConfig),
        credentials: 'include',
    }).then(throwIfNotSuccess);
}

function remove(addonConfig) {
    return fetch(`${URI}/${addonConfig.id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
    }).then(throwIfNotSuccess);
}

const api = {
    fetchAll,
    create,
    update,
    remove,
};
export default api;

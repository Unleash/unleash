import { formatApiPath } from '../../utils/format-path';
import { throwIfNotSuccess, headers } from '../api-helper';

const URI = formatApiPath('api/admin/api-tokens');

function fetchAll() {
    return fetch(URI, { headers, credentials: 'include' })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

function create(data) {
    return fetch(URI, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
        credentials: 'include',
    })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

function remove(key) {
    return fetch(`${URI}/${key}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
    }).then(throwIfNotSuccess);
}

export default {
    fetchAll,
    create,
    remove,
};

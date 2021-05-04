import { formatApiPath } from '../../utils/format-path';
import { throwIfNotSuccess, headers } from '../api-helper';

const URI = formatApiPath('api/admin/strategies');

function fetchAll() {
    return fetch(URI, { credentials: 'include' })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

function create(strategy) {
    return fetch(URI, {
        method: 'POST',
        headers,
        body: JSON.stringify(strategy),
        credentials: 'include',
    }).then(throwIfNotSuccess);
}

function update(strategy) {
    return fetch(`${URI}/${strategy.name}`, {
        method: 'put',
        headers,
        body: JSON.stringify(strategy),
        credentials: 'include',
    }).then(throwIfNotSuccess);
}

function remove(strategy) {
    return fetch(`${URI}/${strategy.name}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
    }).then(throwIfNotSuccess);
}

function deprecate(strategy) {
    return fetch(`${URI}/${strategy.name}/deprecate`, {
        method: 'POST',
        headers,
        credentials: 'include',
    }).then(throwIfNotSuccess);
}

function reactivate(strategy) {
    return fetch(`${URI}/${strategy.name}/reactivate`, {
        method: 'POST',
        headers,
        credentials: 'include',
    }).then(throwIfNotSuccess);
}

export default {
    fetchAll,
    create,
    update,
    remove,
    deprecate,
    reactivate,
};

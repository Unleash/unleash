import { throwIfNotSuccess, headers } from './helper';

const URI = 'api/admin/strategies';

function fetchAll () {
    return fetch(URI, { credentials: 'include' })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

function create (strategy) {
    return fetch(URI, {
        method: 'POST',
        headers,
        body: JSON.stringify(strategy),
        credentials: 'include',
    }).then(throwIfNotSuccess);
}

function update (strategy) {
    return fetch(`${URI}/${strategy.name}`, {
        method: 'put',
        headers,
        body: JSON.stringify(strategy),
        credentials: 'include',
    }).then(throwIfNotSuccess);
}

function remove (strategy) {
    return fetch(`${URI}/${strategy.name}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
    }).then(throwIfNotSuccess);
}

module.exports = {
    fetchAll,
    create,
    update,
    remove,
};

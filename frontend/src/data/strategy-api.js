import { throwIfNotSuccess, headers } from './helper';

const URI = '/api/strategies';

function fetchAll () {
    return fetch(URI)
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

function create (strategy) {
    return fetch(URI, {
        method: 'POST',
        headers,
        body: JSON.stringify(strategy),
    }).then(throwIfNotSuccess);
}

function remove (strategy) {
    return fetch(`${URI}/${strategy.name}`, {
        method: 'DELETE',
        headers,
    }).then(throwIfNotSuccess);
}

module.exports = {
    fetchAll,
    create,
    remove,
};

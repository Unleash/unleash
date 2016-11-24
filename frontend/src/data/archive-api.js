import { throwIfNotSuccess, headers } from './helper';

const URI = '/api/archive';

function fetchAll () {
    return fetch(`${URI}/features`)
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

function revive (feature) {
    return fetch(`${URI}/revive`, {
        method: 'POST',
        headers,
        body: JSON.stringify(feature),
        credentials: 'include',
    }).then(throwIfNotSuccess);
}


module.exports = {
    fetchAll,
    revive,
};


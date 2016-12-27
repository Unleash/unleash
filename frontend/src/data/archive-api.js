import { throwIfNotSuccess, headers } from './helper';

const URI = 'api/archive';

function fetchAll () {
    return fetch(`${URI}/features`)
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

function revive (featureName) {
    return fetch(`${URI}/revive/${featureName}`, {
        method: 'POST',
        headers,
        credentials: 'include',
    }).then(throwIfNotSuccess);
}


module.exports = {
    fetchAll,
    revive,
};


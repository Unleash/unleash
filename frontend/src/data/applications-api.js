import { throwIfNotSuccess, headers } from './helper';

const URI = '/api/client/applications';

function fetchAll () {
    return fetch(URI, { headers })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

module.exports = {
    fetchAll,
};

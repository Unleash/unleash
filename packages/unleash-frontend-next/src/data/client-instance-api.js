import { throwIfNotSuccess, headers } from './helper';

const URI = '/client/instances';

function fetchAll () {
    return fetch(URI, { headers })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

module.exports = {
    fetchAll,
};

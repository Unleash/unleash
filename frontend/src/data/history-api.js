import { throwIfNotSuccess } from './helper';

const URI = '/api/api/events';

function fetchAll () {
    return fetch(URI)
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

module.exports = {
    fetchAll,
};

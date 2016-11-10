import { throwIfNotSuccess } from './helper';

const URI = '/metrics';

function fetchAll () {
    return fetch(URI)
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

module.exports = {
    fetchAll,
};

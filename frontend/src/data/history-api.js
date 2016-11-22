import { throwIfNotSuccess } from './helper';

const URI = '/api/events';

function fetchAll () {
    return fetch(URI)
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

function fetchHistoryForToggle (toggleName) {
    return fetch(`${URI}/${toggleName}`)
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

module.exports = {
    fetchAll,
    fetchHistoryForToggle,
};

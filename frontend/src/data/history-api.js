import { throwIfNotSuccess } from './helper';

const URI = 'api/admin/events';

function fetchAll () {
    return fetch(URI, { credentials: 'include' })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

function fetchHistoryForToggle (toggleName) {
    return fetch(`${URI}/${toggleName}`, { credentials: 'include' })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

export default {
    fetchAll,
    fetchHistoryForToggle,
};

import { throwIfNotSuccess, headers } from './helper';

const URI = 'api';

function fetchAll() {
    return fetch(URI, { headers, credentials: 'include' })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

export default {
    fetchAll,
};

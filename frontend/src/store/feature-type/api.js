import { throwIfNotSuccess } from '../api-helper';

const URI = 'api/admin/feature-types';

function fetchAll() {
    return fetch(URI, { credentials: 'include' })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

export default {
    fetchAll,
};

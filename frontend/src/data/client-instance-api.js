import { throwIfNotSuccess, headers } from './helper';

const URI = 'api/admin/metrics/instances';

function fetchAll () {
    return fetch(URI, { headers, credentials: 'include' })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

export default {
    fetchAll,
};

import { throwIfNotSuccess } from '../api-helper';

const URI = 'api/admin/ui-config';

function fetchConfig() {
    return fetch(URI, { credentials: 'include' })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

export default {
    fetchConfig,
};

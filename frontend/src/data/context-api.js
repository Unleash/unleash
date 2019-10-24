import { throwIfNotSuccess } from './helper';

const URI = 'api/admin/context';

function fetchContext() {
    return fetch(URI, { credentials: 'include' })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

export default {
    fetchContext,
};

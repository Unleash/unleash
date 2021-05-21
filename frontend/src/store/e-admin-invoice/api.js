import { formatApiPath } from '../../utils/format-path';
import { throwIfNotSuccess, headers } from '../api-helper';

const URI = formatApiPath('api/admin/invoices');

function fetchAll() {
    return fetch(URI, { headers, credentials: 'include' })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

export default {
    fetchAll
};

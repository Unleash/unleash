import { formatApiPath } from '../../utils/format-path';
import { throwIfNotSuccess } from '../api-helper';

const URI = formatApiPath('api/admin/feature-types');

function fetchAll() {
    return fetch(URI, { credentials: 'include' })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

export default {
    fetchAll,
};

import { formatApiPath } from '../../utils/format-path';
import { throwIfNotSuccess } from '../api-helper';

const URI = formatApiPath('api/admin/ui-config');

function fetchConfig() {
    return fetch(URI, { credentials: 'include' })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

export default {
    fetchConfig,
};

import { formatApiPath } from '../../utils/format-path';
import { throwIfNotSuccess } from '../api-helper';

const URI = formatApiPath('api/admin/events');

function fetchAll() {
    return fetch(URI, { credentials: 'include' })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

function fetchHistoryForToggle(toggleName) {
    return fetch(`${URI}/${toggleName}`, { credentials: 'include' })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

export default {
    fetchAll,
    fetchHistoryForToggle,
};

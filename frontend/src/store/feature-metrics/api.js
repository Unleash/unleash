import { formatApiPath } from '../../utils/format-path';
import { throwIfNotSuccess } from '../api-helper';

const URI = formatApiPath('api/admin/metrics/feature-toggles');

function fetchFeatureMetrics() {
    return fetch(URI, { credentials: 'include' })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

const seenURI = formatApiPath('api/admin/metrics/seen-apps');

function fetchSeenApps() {
    return fetch(seenURI, { credentials: 'include' })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

export default {
    fetchFeatureMetrics,
    fetchSeenApps,
};

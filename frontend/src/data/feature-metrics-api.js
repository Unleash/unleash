const { throwIfNotSuccess } = require('./helper');

const URI = 'api/admin/metrics/feature-toggles';

function fetchFeatureMetrics () {
    return fetch(URI, { credentials: 'include' })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

const seenURI = 'api/admin/metrics/seen-apps';

function fetchSeenApps () {
    return fetch(seenURI, { credentials: 'include' })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

module.exports = {
    fetchFeatureMetrics,
    fetchSeenApps,
};

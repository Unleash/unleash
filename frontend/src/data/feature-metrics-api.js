const { throwIfNotSuccess } = require('./helper');

const URI = 'api/client/metrics/feature-toggles';

function fetchFeatureMetrics () {
    return fetch(URI)
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

const seenURI = 'api/client/seen-apps';

function fetchSeenApps () {
    return fetch(seenURI)
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

module.exports = {
    fetchFeatureMetrics,
    fetchSeenApps,
};

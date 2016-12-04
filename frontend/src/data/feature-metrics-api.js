const { throwIfNotSuccess } = require('./helper');

const URI = '/api/client/metrics/feature-toggles';

function fetchFeatureMetrics () {
    return fetch(URI)
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

module.exports = {
    fetchFeatureMetrics,
};

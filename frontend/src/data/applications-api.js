import { throwIfNotSuccess, headers } from './helper';

const URI = '/api/client/applications';

function fetchAll () {
    return fetch(URI, { headers })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

function fetchApplication (appName) {
    return fetch(`${URI}/${appName}`, { headers })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

function fetchApplicationsWithStrategyName (strategyName) {
    return fetch(`${URI}?strategyName=${strategyName}`, { headers })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

module.exports = {
    fetchApplication,
    fetchAll,
    fetchApplicationsWithStrategyName,
};

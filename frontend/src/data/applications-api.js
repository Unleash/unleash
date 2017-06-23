import { throwIfNotSuccess, headers } from './helper';

const URI = 'api/admin/metrics/applications';

function fetchAll () {
    return fetch(URI, { headers, credentials: 'include' })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

function fetchApplication (appName) {
    return fetch(`${URI}/${appName}`, { headers, credentials: 'include' })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

function fetchApplicationsWithStrategyName (strategyName) {
    return fetch(`${URI}?strategyName=${strategyName}`, {
        headers,
        credentials: 'include',
    })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

function storeApplicationMetaData (appName, key, value) {
    const data = {};
    data[key] = value;
    return fetch(`${URI}/${appName}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
        credentials: 'include',
    }).then(throwIfNotSuccess);
}

module.exports = {
    fetchApplication,
    fetchAll,
    fetchApplicationsWithStrategyName,
    storeApplicationMetaData,
};

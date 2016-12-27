import { throwIfNotSuccess, headers } from './helper';

const URI = 'api/client/applications';

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

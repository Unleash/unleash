const URI = '/features';

const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
};

function throwIfNotSuccess (response) {
    if (!response.ok) {
        let error = new Error('API call failed');
        error.status = response.status;
        throw error;
    }
    return response;
}

function fetchAll () {
    return fetch(URI)
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

function create (featureToggle) {
    return fetch(URI, {
        method: 'POST',
        headers,
        body: JSON.stringify(featureToggle),
    }).then(throwIfNotSuccess);
}

function update (featureToggle) {
    return fetch(`${URI}/${featureToggle.name}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(featureToggle),
    }).then(throwIfNotSuccess);
}

function remove (featureToggleName) {
    return fetch(`${URI}/${featureToggleName}`, {
        method: 'DELETE',
    }).then(throwIfNotSuccess);
}

module.exports = {
    fetchAll,
    create,
    update,
    remove,
};

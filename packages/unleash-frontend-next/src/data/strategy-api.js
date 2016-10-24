const URI = '/strategies';

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

function create (strategy) {
    return fetch(URI, {
        method: 'POST',
        headers,
        body: JSON.stringify(strategy),
    }).then(throwIfNotSuccess);
}

function remove (strategy) {
    return fetch(`${URI}/${strategy.name}`, {
        method: 'DELETE',
        headers,
    }).then(throwIfNotSuccess);
}

module.exports = {
    fetchAll,
    create,
    remove,
};

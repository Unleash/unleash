const URI = '/archive';

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
    return fetch(`${URI}/features`)
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

function revive (feature) {
    return fetch(`${URI}/revive`, {
        method: 'POST',
        headers,
        body: JSON.stringify(feature),
    }).then(throwIfNotSuccess);
}


module.exports = {
    fetchAll,
    revive,
};


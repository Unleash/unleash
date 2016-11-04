const URI = '/client/strategies';

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

module.exports = {
    fetchAll,
};

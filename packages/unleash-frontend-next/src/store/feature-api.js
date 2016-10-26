const URI = '/features';

const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
};

function throwIfNotSuccess (response) {
    if (!response.ok) {
        if (response.status > 400 && response.status < 404) {
            return new Promise((resolve, reject) => {
                response.json().then(body => {
                    const errorMsg = body && body.length > 0 ? body[0].msg : 'API call failed';
                    let error = new Error(errorMsg);
                    error.statusCode = response.status;
                    reject(error);
                });
            });
        } else {
            return Promise.reject(new Error(response.statusText));
        }
    }
    return Promise.resolve(response);
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

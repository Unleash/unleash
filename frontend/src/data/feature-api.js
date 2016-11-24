import { throwIfNotSuccess, headers } from './helper';

const URI = '/api/features';
const URI_VALIDATE = '/api/features-validate';

function validateToggle (featureToggle) {
    return new Promise((resolve, reject) => {
        if (!featureToggle.strategies || featureToggle.strategies.length === 0) {
            reject(new Error('You must add at least one activation strategy'));
        } else {
            resolve(featureToggle);
        }
    });
}

function fetchAll () {
    return fetch(URI)
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

function create (featureToggle) {
    return validateToggle(featureToggle)
        .then(() => fetch(URI, {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify(featureToggle),
        }))
        .then(throwIfNotSuccess);
}

function validate (featureToggle) {
    return fetch(URI_VALIDATE, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(featureToggle),
    }).then(throwIfNotSuccess);
}

function update (featureToggle) {
    return validateToggle(featureToggle)
        .then(() => fetch(`${URI}/${featureToggle.name}`, {
            method: 'PUT',
            headers,
            credentials: 'include',
            body: JSON.stringify(featureToggle),
        }))
        .then(throwIfNotSuccess);
}

function remove (featureToggleName) {
    return fetch(`${URI}/${featureToggleName}`, {
        method: 'DELETE',
        credentials: 'include',
    }).then(throwIfNotSuccess);
}

module.exports = {
    fetchAll,
    create,
    validate,
    update,
    remove,
};

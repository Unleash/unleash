import { throwIfNotSuccess, headers } from './helper';

const URI = 'api/admin/features';

function validateToggle(featureToggle) {
    return new Promise((resolve, reject) => {
        if (!featureToggle.strategies || featureToggle.strategies.length === 0) {
            reject(new Error('You must add at least one activation strategy'));
        } else {
            resolve(featureToggle);
        }
    });
}

function fetchAll() {
    return fetch(URI, { credentials: 'include' })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

function create(featureToggle) {
    return validateToggle(featureToggle)
        .then(() =>
            fetch(URI, {
                method: 'POST',
                headers,
                credentials: 'include',
                body: JSON.stringify(featureToggle),
            })
        )
        .then(throwIfNotSuccess);
}

function validate(featureToggle) {
    return fetch(`${URI}/validate`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(featureToggle),
    }).then(throwIfNotSuccess);
}

function update(featureToggle) {
    return validateToggle(featureToggle)
        .then(() =>
            fetch(`${URI}/${featureToggle.name}`, {
                method: 'PUT',
                headers,
                credentials: 'include',
                body: JSON.stringify(featureToggle),
            })
        )
        .then(throwIfNotSuccess);
}

function toggle(enable, name) {
    const action = enable ? 'on' : 'off';
    return fetch(`${URI}/${name}/toggle/${action}`, {
        method: 'POST',
        headers,
        credentials: 'include',
    }).then(throwIfNotSuccess);
}

function setStale(isStale, name) {
    const action = isStale ? 'on' : 'off';
    return fetch(`${URI}/${name}/stale/${action}`, {
        method: 'POST',
        headers,
        credentials: 'include',
    })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

function remove(featureToggleName) {
    return fetch(`${URI}/${featureToggleName}`, {
        method: 'DELETE',
        credentials: 'include',
    }).then(throwIfNotSuccess);
}

export default {
    fetchAll,
    create,
    validate,
    update,
    toggle,
    setStale,
    remove,
};

import { throwIfNotSuccess, headers } from '../api-helper';

const URI = 'api/admin/tag-types';

function fetchTagTypes() {
    return fetch(URI, { credentials: 'include' })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

function validateTagType(tagType) {
    return fetch(`${URI}/validate`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(tagType),
    }).then(throwIfNotSuccess);
}

function create(tagType) {
    return validateTagType(tagType)
        .then(() =>
            fetch(URI, {
                method: 'POST',
                headers,
                credentials: 'include',
                body: JSON.stringify(tagType),
            })
        )
        .then(throwIfNotSuccess);
}

function update(tagType) {
    return validateTagType(tagType)
        .then(() =>
            fetch(`${URI}/${tagType.name}`, {
                method: 'PUT',
                headers,
                credentials: 'include',
                body: JSON.stringify(tagType),
            })
        )
        .then(throwIfNotSuccess);
}

function deleteTagType(tagTypeName) {
    return fetch(`${URI}/${tagTypeName}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
    }).then(throwIfNotSuccess);
}

export default {
    fetchTagTypes,
    create,
    update,
    deleteTagType,
    validateTagType,
};

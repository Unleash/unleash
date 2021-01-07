import { throwIfNotSuccess, headers } from '../api-helper';

const URI = 'api/admin/tags';

function fetchTags() {
    return fetch(URI, { credentials: 'include' })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

function create(tag) {
    return fetch(URI, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(tag),
    }).then(throwIfNotSuccess);
}

function deleteTag(tag) {
    return fetch(`${URI}/${tag.type}/${tag.value}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
    }).then(throwIfNotSuccess);
}

export default {
    fetchTags,
    deleteTag,
    create,
};

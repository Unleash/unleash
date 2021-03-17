import { throwIfNotSuccess, headers } from '../api-helper';

const URI = 'api/admin/features';

function tagFeature(featureToggle, tag) {
    return fetch(`${URI}/${featureToggle}/tags`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(tag),
    })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

function untagFeature(featureToggle, tag) {
    return fetch(`${URI}/${featureToggle}/tags/${tag.type}/${encodeURIComponent(tag.value)}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
    }).then(throwIfNotSuccess);
}

function fetchFeatureToggleTags(featureToggle) {
    return fetch(`${URI}/${featureToggle}/tags`, {
        method: 'GET',
        headers,
        credentials: 'include',
    })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

export default {
    tagFeature,
    untagFeature,
    fetchFeatureToggleTags,
};

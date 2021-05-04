import { formatApiPath } from '../../utils/format-path';
import { throwIfNotSuccess, headers } from '../api-helper';

const URI = formatApiPath('api/admin/projects');

function fetchAll() {
    return fetch(URI, { credentials: 'include' })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

function fetchAccess(projectId) {
    return fetch(`${URI}/${projectId}/users`, { credentials: 'include' })
        .then(throwIfNotSuccess)
        .then(response => response.json());
}

function addUserToRole(projectId, roleId, userId) {
    return fetch(`${URI}/${projectId}/users/${userId}/roles/${roleId}`, {
        method: 'POST',
        headers,
        credentials: 'include',
    }).then(throwIfNotSuccess);
}

function removeUserFromRole(projectId, roleId, userId) {
    return fetch(`${URI}/${projectId}/users/${userId}/roles/${roleId}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
    }).then(throwIfNotSuccess);
}

function create(project) {
    return fetch(URI, {
        method: 'POST',
        headers,
        body: JSON.stringify(project),
        credentials: 'include',
    }).then(throwIfNotSuccess);
}

function update(project) {
    return fetch(`${URI}/${project.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(project),
        credentials: 'include',
    }).then(throwIfNotSuccess);
}

function remove(project) {
    return fetch(`${URI}/${project.id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
    }).then(throwIfNotSuccess);
}

function validate(id) {
    return fetch(`${URI}/validate`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(id),
    }).then(throwIfNotSuccess);
}

export default {
    fetchAll,
    create,
    update,
    remove,
    validate,
    fetchAccess,
    addUserToRole,
    removeUserFromRole,
};

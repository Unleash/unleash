// TODO: pre-v4
const p = require('../permissions');

const PERMISSIONS_ADMIN = [p.ADMIN];

const PERMISSIONS_READ = [];

const PERMISSIONS_USER = [
    p.CREATE_FEATURE,
    p.UPDATE_FEATURE,
    p.DELETE_FEATURE,
    p.CREATE_STRATEGY,
    p.UPDATE_STRATEGY,
    p.DELETE_STRATEGY,
    p.UPDATE_APPLICATION,
    p.CREATE_CONTEXT_FIELD,
    p.UPDATE_CONTEXT_FIELD,
    p.DELETE_CONTEXT_FIELD,
    p.CREATE_PROJECT,
    p.UPDATE_PROJECT,
    p.DELETE_PROJECT,
];

function resolvePermissions(role) {
    if (role === 'Admin') {
        return PERMISSIONS_ADMIN;
    }
    if (role === 'Regular') {
        return PERMISSIONS_USER;
    }
    return PERMISSIONS_READ;
}

function shouldPatchProjectAccess(permissions = []) {
    return (
        permissions.includes(p.CREATE_FEATURE) &&
        !permissions.includes(p.CREATE_PROJECT)
    );
}

module.exports = {
    resolvePermissions,
    shouldPatchProjectAccess,
};

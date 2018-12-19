'use strict';

const MissingPermission = require('./missing-permission');

const ADMIN = 'ADMIN';
const CREATE_FEATURE = 'CREATE_FEATURE';
const UPDATE_FEATURE = 'UPDATE_FEATURE';
const DELETE_FEATURE = 'DELETE_FEATURE';
const CREATE_STRATEGY = 'CREATE_STRATEGY';
const UPDATE_STRATEGY = 'UPDATE_STRATEGY';
const DELETE_STRATEGY = 'DELETE_STRATEGY';
const UPDATE_APPLICATION = 'UPDATE_APPLICATION';

function requirePermission(permission) {
    return (req, res, next) => {
        if (
            req.user &&
            req.user.permissions &&
            (req.user.permissions.indexOf(ADMIN) !== -1 ||
                req.user.permissions.indexOf(permission) !== -1)
        ) {
            return next();
        }
        return res
            .status(403)
            .json(
                new MissingPermission({
                    permission,
                    message: `You require ${permission} to perform this action`,
                })
            )
            .end();
    };
}

module.exports = {
    requirePermission,
    ADMIN,
    CREATE_FEATURE,
    UPDATE_FEATURE,
    DELETE_FEATURE,
    CREATE_STRATEGY,
    UPDATE_STRATEGY,
    DELETE_STRATEGY,
    UPDATE_APPLICATION,
};

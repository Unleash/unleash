'use strict';

const ADMIN = 'ADMIN';
const CREATE_FEATURE = 'CREATE_FEATURE';
const UPDATE_FEATURE = 'UPDATE_FEATURE';
const DELETE_FEATURE = 'DELETE_FEATURE';
const CREATE_STRATEGY = 'CREATE_STRATEGY';
const UPDATE_STRATEGY = 'UPDATE_STRATEGY';
const DELETE_STRATEGY = 'DELETE_STRATEGY';
const UPDATE_APPLICATION = 'UPDATE_APPLICATION';

function requirePerms(prms) {
    return (req, res, next) => {
        for (const permission of prms) {
            if (
                req.user &&
                req.user.permissions &&
                (req.user.permissions.indexOf(ADMIN) !== -1 ||
                    req.user.permissions.indexOf(permission) !== -1)
            ) {
                return next();
            }
        }
        return res
            .status(403)
            .json({
                message: 'Missing permissions to perform this action.',
            })
            .end();
    };
}

module.exports = {
    requirePerms,
    ADMIN,
    CREATE_FEATURE,
    UPDATE_FEATURE,
    DELETE_FEATURE,
    CREATE_STRATEGY,
    UPDATE_STRATEGY,
    DELETE_STRATEGY,
    UPDATE_APPLICATION,
};

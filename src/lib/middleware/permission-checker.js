'use strict';

const NoAccessError = require('../error/no-access-error');
const { ADMIN } = require('../permissions');
const { isRbacEnabled } = require('../util/feature-enabled');

module.exports = function(config, permission) {
    if (!permission) {
        return (req, res, next) => next();
    }
    if (isRbacEnabled(config)) {
        return async (req, res, next) => {
            if (await req.checkRbac(permission)) {
                return next();
            }
            return res
                .status(403)
                .json(new NoAccessError(permission))
                .end();
        };
    }
    if (!config.extendedPermissions) {
        return (req, res, next) => next();
    }
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
            .json(new NoAccessError(permission))
            .end();
    };
};

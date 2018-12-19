'use strict';

const { Router } = require('express');
const { requirePermission } = require('./../permissions');
/**
 * Base class for Controllers to standardize binding to express Router.
 */
class Controller {
    constructor(extendedPermissions) {
        const router = Router();
        this.app = router;
        this.extendedPermissions = extendedPermissions;
    }

    checkPermission(permission) {
        if (this.extendedPermissions && permission) {
            return requirePermission(permission);
        }
        return (res, req, next) => next();
    }

    get(path, handler, permission) {
        this.app.get(
            path,
            this.checkPermission(permission),
            handler.bind(this)
        );
    }

    post(path, handler, permission) {
        this.app.post(
            path,
            this.checkPermission(permission),
            handler.bind(this)
        );
    }

    put(path, handler, permission) {
        this.app.put(
            path,
            this.checkPermission(permission),
            handler.bind(this)
        );
    }

    delete(path, handler, permission) {
        this.app.delete(
            path,
            this.checkPermission(permission),
            handler.bind(this)
        );
    }

    use(path, router) {
        this.app.use(path, router);
    }

    get router() {
        return this.app;
    }
}

module.exports = Controller;

'use strict';

const { Router } = require('express');
const { requirePermission } = require('./../permissions');
/**
 * Base class for Controllers to standardize binding to express Router.
 */
class Controller {
    constructor(extendedPerms) {
        const router = Router();
        this.app = router;
        this.extendedPerms = extendedPerms;
    }

    get(path, handler, permission) {
        if (this.extendedPerms && permission) {
            this.app.get(
                path,
                requirePermission(permission),
                handler.bind(this)
            );
        }
        this.app.get(path, handler.bind(this));
    }

    post(path, handler, permission) {
        if (this.extendedPerms && permission) {
            this.app.post(
                path,
                requirePermission(permission),
                handler.bind(this)
            );
        }
        this.app.post(path, handler.bind(this));
    }

    put(path, handler, permission) {
        if (this.extendedPerms && permission) {
            this.app.put(
                path,
                requirePermission(permission),
                handler.bind(this)
            );
        }
        this.app.put(path, handler.bind(this));
    }

    delete(path, handler, permission) {
        if (this.extendedPerms && permission) {
            this.app.delete(
                path,
                requirePermission(permission),
                handler.bind(this)
            );
        }
        this.app.delete(path, handler.bind(this));
    }

    use(path, router) {
        this.app.use(path, router);
    }

    get router() {
        return this.app;
    }
}

module.exports = Controller;

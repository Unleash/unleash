'use strict';

const { Router } = require('express');
const { requirePerms } = require('./../permissions');
/**
 * Base class for Controllers to standardize binding to express Router.
 */
class Controller {
    constructor(extendedPerms) {
        const router = Router();
        this.app = router;
        this.extendedPerms = extendedPerms;
    }

    get(path, handler, ...perms) {
        if (this.extendedPerms && perms.length > 0) {
            this.app.get(path, requirePerms(perms), handler.bind(this));
        }
        this.app.get(path, handler.bind(this));
    }

    post(path, handler, ...perms) {
        if (this.extendedPerms && perms.length > 0) {
            this.app.post(path, requirePerms(perms), handler.bind(this));
        }
        this.app.post(path, handler.bind(this));
    }

    put(path, handler, ...perms) {
        if (this.extendedPerms && perms.length > 0) {
            this.app.put(path, requirePerms(perms), handler.bind(this));
        }
        this.app.put(path, handler.bind(this));
    }

    delete(path, handler, ...perms) {
        if (this.extendedPerms && perms.length > 0) {
            this.app.delete(path, requirePerms(perms), handler.bind(this));
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

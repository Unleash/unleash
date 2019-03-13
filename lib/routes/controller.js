'use strict';

const { Router } = require('express');
const checkPermission = require('../middleware/permission-checker');
/**
 * Base class for Controllers to standardize binding to express Router.
 */
class Controller {
    constructor(config) {
        const router = Router();
        this.app = router;
        this.config = config;
    }

    get(path, handler, permission) {
        this.app.get(
            path,
            checkPermission(this.config, permission),
            handler.bind(this)
        );
    }

    post(path, handler, permission) {
        this.app.post(
            path,
            checkPermission(this.config, permission),
            handler.bind(this)
        );
    }

    put(path, handler, permission) {
        this.app.put(
            path,
            checkPermission(this.config, permission),
            handler.bind(this)
        );
    }

    delete(path, handler, permission) {
        this.app.delete(
            path,
            checkPermission(this.config, permission),
            handler.bind(this)
        );
    }

    fileupload(path, filehandler, handler, permission) {
        this.app.post(
            path,
            checkPermission(this.config, permission),
            filehandler,
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

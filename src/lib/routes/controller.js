'use strict';

const { Router } = require('express');
const NoAccessError = require('../error/no-access-error');
const requireContentType = require('../middleware/content_type_checker');

const checkPermission = permission => async (req, res, next) => {
    if (!permission) {
        return next();
    }
    if (req.checkRbac && (await req.checkRbac(permission))) {
        return next();
    }
    return res
        .status(403)
        .json(new NoAccessError(permission))
        .end();
};

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
        this.app.get(path, checkPermission(permission), handler.bind(this));
    }

    post(path, handler, permission, ...acceptedContentTypes) {
        this.app.post(
            path,
            checkPermission(permission),
            requireContentType(...acceptedContentTypes),
            handler.bind(this),
        );
    }

    put(path, handler, permission, ...acceptedContentTypes) {
        this.app.put(
            path,
            checkPermission(permission),
            requireContentType(...acceptedContentTypes),
            handler.bind(this),
        );
    }

    delete(path, handler, permission) {
        this.app.delete(path, checkPermission(permission), handler.bind(this));
    }

    fileupload(path, filehandler, handler, permission) {
        this.app.post(
            path,
            checkPermission(permission),
            filehandler,
            handler.bind(this),
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

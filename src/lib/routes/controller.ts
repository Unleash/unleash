import { IRouter } from 'express';
import { IUnleashConfig } from '../types/option';

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
export default class Controller {
    app: IRouter;

    config: IUnleashConfig;

    constructor(config: IUnleashConfig) {
        this.app = Router();
        this.config = config;
    }

    get(path: string, handler: Function, permission?: string): void {
        this.app.get(path, checkPermission(permission), handler.bind(this));
    }

    post(
        path: string,
        handler: Function,
        permission?: string,
        ...acceptedContentTypes: string[]
    ): void {
        this.app.post(
            path,
            checkPermission(permission),
            requireContentType(...acceptedContentTypes),
            handler.bind(this),
        );
    }

    put(
        path: string,
        handler: Function,
        permission?: string,
        ...acceptedContentTypes: string[]
    ): void {
        this.app.put(
            path,
            checkPermission(permission),
            requireContentType(...acceptedContentTypes),
            handler.bind(this),
        );
    }

    delete(path: string, handler: Function, permission?: string): void {
        this.app.delete(path, checkPermission(permission), handler.bind(this));
    }

    fileupload(
        path: string,
        filehandler: Function,
        handler: Function,
        permission?: string,
    ): void {
        this.app.post(
            path,
            checkPermission(permission),
            filehandler.bind(this),
            handler.bind(this),
        );
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    use(path: string, router: IRouter): void {
        this.app.use(path, router);
    }

    get router(): any {
        return this.app;
    }
}

module.exports = Controller;

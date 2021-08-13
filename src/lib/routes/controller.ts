import { IRouter, Request, Response } from 'express';
import { Logger } from 'lib/logger';
import { IUnleashConfig } from '../types/option';
import { handleErrors } from './util';

const { Router } = require('express');
const NoAccessError = require('../error/no-access-error');
const requireContentType = require('../middleware/content_type_checker');

interface IRequestHandler<
    P = any,
    ResBody = any,
    ReqBody = any,
    ReqQuery = any,
> {
    (
        req: Request<P, ResBody, ReqBody, ReqQuery>,
        res: Response<ResBody>,
    ): Promise<void> | void;
}

const checkPermission = (permission) => async (req, res, next) => {
    if (!permission) {
        return next();
    }
    if (req.checkRbac && (await req.checkRbac(permission))) {
        return next();
    }
    return res.status(403).json(new NoAccessError(permission)).end();
};

/**
 * Base class for Controllers to standardize binding to express Router.
 *
 * This class will take care of the following:
 * - try/catch inside RequestHandler
 * - await if the RequestHandler returns a promise.
 * - access control
 */
export default class Controller {
    private ownLogger: Logger;

    app: IRouter;

    config: IUnleashConfig;

    constructor(config: IUnleashConfig) {
        this.ownLogger = config.getLogger(
            `controller/${this.constructor.name}`,
        );
        this.app = Router();
        this.config = config;
    }

    wrap(handler: IRequestHandler): IRequestHandler {
        return async (req: Request, res: Response) => {
            try {
                await handler(req, res);
            } catch (error) {
                handleErrors(res, this.ownLogger, error);
            }
        };
    }

    get(path: string, handler: IRequestHandler, permission?: string): void {
        this.app.get(
            path,
            checkPermission(permission),
            this.wrap(handler.bind(this)),
        );
    }

    post(
        path: string,
        handler: IRequestHandler,
        permission?: string,
        ...acceptedContentTypes: string[]
    ): void {
        this.app.post(
            path,
            checkPermission(permission),
            requireContentType(...acceptedContentTypes),
            this.wrap(handler.bind(this)),
        );
    }

    put(
        path: string,
        handler: IRequestHandler,
        permission?: string,
        ...acceptedContentTypes: string[]
    ): void {
        this.app.put(
            path,
            checkPermission(permission),
            requireContentType(...acceptedContentTypes),
            this.wrap(handler.bind(this)),
        );
    }

    delete(path: string, handler: IRequestHandler, permission?: string): void {
        this.app.delete(
            path,
            checkPermission(permission),
            this.wrap(handler.bind(this)),
        );
    }

    fileupload(
        path: string,
        filehandler: IRequestHandler,
        handler: Function,
        permission?: string,
    ): void {
        this.app.post(
            path,
            checkPermission(permission),
            filehandler.bind(this),
            this.wrap(handler.bind(this)),
        );
    }

    use(path: string, router: IRouter): void {
        this.app.use(path, router);
    }

    get router(): any {
        return this.app;
    }
}

module.exports = Controller;

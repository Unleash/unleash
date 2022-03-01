import { IRouter, Router, Request, Response, RequestHandler } from 'express';
import { Logger } from 'lib/logger';
import { IUnleashConfig } from '../types/option';
import { NONE } from '../types/permissions';
import { handleErrors } from './util';
import NoAccessError from '../error/no-access-error';
import requireContentType from '../middleware/content_type_checker';

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
    if (!permission || permission === NONE) {
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

    get(
        path: string,
        handler: IRequestHandler,
        permission?: string,
        middleware: RequestHandler[] = [],
    ): void {
        this.app.get(
            path,
            checkPermission(permission),
            ...middleware,
            this.wrap(handler.bind(this)),
        );
    }

    post(
        path: string,
        handler: IRequestHandler,
        permission: string,
        middleware: RequestHandler[] = [],
    ): void {
        this.app.post(
            path,
            checkPermission(permission),
            requireContentType(),
            ...middleware,
            this.wrap(handler.bind(this)),
        );
    }

    put(
        path: string,
        handler: IRequestHandler,
        permission: string,
        middleware: RequestHandler[] = [],
    ): void {
        this.app.put(
            path,
            checkPermission(permission),
            requireContentType(),
            ...middleware,
            this.wrap(handler.bind(this)),
        );
    }

    patch(
        path: string,
        handler: IRequestHandler,
        permission: string,
        middleware: RequestHandler[] = [],
    ): void {
        this.app.patch(
            path,
            checkPermission(permission),
            requireContentType(),
            ...middleware,
            this.wrap(handler.bind(this)),
        );
    }

    delete(
        path: string,
        handler: IRequestHandler,
        permission: string,
        middleware: RequestHandler[] = [],
    ): void {
        this.app.delete(
            path,
            checkPermission(permission),
            ...middleware,
            this.wrap(handler.bind(this)),
        );
    }

    fileUpload(
        path: string,
        fileHandler: RequestHandler,
        handler: Function,
        permission: string,
    ): void {
        this.app.post(
            path,
            checkPermission(permission),
            fileHandler.bind(this),
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

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

interface IRouteOptionsBase {
    path: string;
    permission: string;
    middleware?: RequestHandler[];
    handler: IRequestHandler;
    acceptedContentTypes?: string[];
}

interface IRouteOptionsGet extends IRouteOptionsBase {
    method: 'get';
}

interface IRouteOptionsNonGet extends IRouteOptionsBase {
    method: 'post' | 'put' | 'patch' | 'delete';
    acceptAnyContentType?: boolean;
}

type IRouteOptions = IRouteOptionsNonGet | IRouteOptionsGet;

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

    private useRouteErrorHandler(handler: IRequestHandler): IRequestHandler {
        return async (req: Request, res: Response) => {
            try {
                await handler(req, res);
            } catch (error) {
                handleErrors(res, this.ownLogger, error);
            }
        };
    }

    private useContentTypeMiddleware(options: IRouteOptions): RequestHandler[] {
        const { middleware = [], acceptedContentTypes = [] } = options;

        return options.method === 'get' || options.acceptAnyContentType
            ? middleware
            : [requireContentType(...acceptedContentTypes), ...middleware];
    }

    route(options: IRouteOptions): void {
        this.app[options.method](
            options.path,
            checkPermission(options.permission),
            this.useContentTypeMiddleware(options),
            this.useRouteErrorHandler(options.handler.bind(this)),
        );
    }

    get(path: string, handler: IRequestHandler, permission?: string): void {
        this.route({
            method: 'get',
            path,
            handler,
            permission,
        });
    }

    post(
        path: string,
        handler: IRequestHandler,
        permission: string,
        ...acceptedContentTypes: string[]
    ): void {
        this.route({
            method: 'post',
            path,
            handler,
            permission,
            acceptedContentTypes,
        });
    }

    put(
        path: string,
        handler: IRequestHandler,
        permission: string,
        ...acceptedContentTypes: string[]
    ): void {
        this.route({
            method: 'put',
            path,
            handler,
            permission,
            acceptedContentTypes,
        });
    }

    patch(
        path: string,
        handler: IRequestHandler,
        permission: string,
        ...acceptedContentTypes: string[]
    ): void {
        this.route({
            method: 'patch',
            path,
            handler,
            permission,
            acceptedContentTypes,
        });
    }

    delete(path: string, handler: IRequestHandler, permission: string): void {
        this.route({
            method: 'delete',
            path,
            handler,
            permission,
            acceptAnyContentType: true,
        });
    }

    fileupload(
        path: string,
        filehandler: IRequestHandler,
        handler: Function,
        permission: string,
    ): void {
        this.app.post(
            path,
            checkPermission(permission),
            filehandler.bind(this),
            this.useRouteErrorHandler(handler.bind(this)),
        );
    }

    use(path: string, router: IRouter): void {
        this.app.use(path, router);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    useWithMiddleware(path: string, router: IRouter, middleware: any): void {
        this.app.use(path, middleware, router);
    }

    get router(): any {
        return this.app;
    }
}

module.exports = Controller;

import {
    type IRouter,
    Router,
    type Request,
    type Response,
    type RequestHandler,
} from 'express';
import type { Logger } from '../logger.js';
import { type IUnleashConfig, NONE } from '../types/index.js';
import { handleErrors } from './util.js';
import requireContentType from '../middleware/content_type_checker.js';
import { PermissionError } from '../error/index.js';
import { fromOpenApiValidationErrors } from '../error/bad-data-error.js';
import { storeRequestedRoute } from '../middleware/response-time-metrics.js';

type IRequestHandler<P = any, ResBody = any, ReqBody = any, ReqQuery = any> = (
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
) => Promise<void> | void;

type Permission = string | string[];

interface IRouteOptionsBase {
    path: string;
    permission: Permission;
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

const checkPermission =
    (permission: Permission = []) =>
    async (req, res, next) => {
        const permissions = (
            Array.isArray(permission) ? permission : [permission]
        ).filter((p) => p !== NONE);

        if (!permissions.length) {
            return next();
        }
        if (req.checkRbac && (await req.checkRbac(permissions))) {
            return next();
        }
        return res.status(403).json(new PermissionError(permissions)).end();
    };

const checkPrivateProjectPermissions = () => async (req, res, next) => {
    if (
        !req.checkPrivateProjectPermissions ||
        (await req.checkPrivateProjectPermissions())
    ) {
        return next();
    }
    return res.status(404).end();
};

const openAPIValidationMiddleware = async (err, req, res, next) => {
    if (err?.status && err.validationErrors) {
        const apiError = fromOpenApiValidationErrors(req, err.validationErrors);

        res.status(apiError.statusCode).json(apiError);
    } else {
        next(err);
    }
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
            storeRequestedRoute,
            checkPermission(options.permission),
            checkPrivateProjectPermissions(),
            this.useContentTypeMiddleware(options),
            this.useRouteErrorHandler(options.handler.bind(this)),
        );

        this.app.use(options.path, openAPIValidationMiddleware);
    }

    get(
        path: string,
        handler: IRequestHandler,
        permission: Permission = NONE,
    ): void {
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
        permission: Permission = NONE,
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
        permission: Permission = NONE,
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
        permission: Permission = NONE,
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

    delete(
        path: string,
        handler: IRequestHandler,
        permission: Permission = NONE,
    ): void {
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
        permission: Permission = NONE,
    ): void {
        this.app.post(
            path,
            storeRequestedRoute,
            checkPermission(permission),
            checkPrivateProjectPermissions(),
            filehandler.bind(this),
            this.useRouteErrorHandler(handler.bind(this)),
        );
    }

    use(path: string, router: IRouter): void {
        this.app.use(path, router);
    }

    useWithMiddleware(path: string, router: IRouter, middleware: any): void {
        this.app.use(path, middleware, router);
    }

    get router(): IRouter {
        return this.app;
    }
}

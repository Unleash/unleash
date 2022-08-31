import { Response, Request } from 'express';
import Controller from '../controller';
import { IUnleashConfig, IUnleashServices } from '../../types';
import { Logger } from '../../logger';
import { NONE } from '../../types/permissions';
import ApiUser from '../../types/api-user';
import {
    proxyFeaturesSchema,
    ProxyFeaturesSchema,
} from '../../openapi/spec/proxy-features-schema';
import { Context } from 'unleash-client';
import { createContext } from '../../proxy/create-context';
import { ProxyMetricsSchema } from '../../openapi/spec/proxy-metrics-schema';
import { ProxyClientSchema } from '../../openapi/spec/proxy-client-schema';
import { createResponseSchema } from '../../openapi/util/create-response-schema';
import { createRequestSchema } from '../../openapi/util/create-request-schema';
import { emptyResponse } from '../../openapi/util/standard-responses';
import { corsOriginMiddleware } from '../../middleware/cors-origin-middleware';

interface ApiUserRequest<
    PARAM = any,
    ResBody = any,
    ReqBody = any,
    ReqQuery = any,
> extends Request<PARAM, ResBody, ReqBody, ReqQuery> {
    user: ApiUser;
}

type Services = Pick<
    IUnleashServices,
    'settingService' | 'proxyService' | 'openApiService'
>;

export default class ProxyController extends Controller {
    private readonly logger: Logger;

    private services: Services;

    constructor(config: IUnleashConfig, services: Services) {
        super(config);
        this.logger = config.getLogger('proxy-api/index.ts');
        this.services = services;

        // Support CORS requests for the frontend endpoints.
        // Preflight requests are handled in `app.ts`.
        this.app.use(corsOriginMiddleware(services));

        this.route({
            method: 'get',
            path: '',
            handler: this.getProxyFeatures,
            permission: NONE,
            middleware: [
                this.services.openApiService.validPath({
                    tags: ['Unstable'],
                    operationId: 'getFrontendFeatures',
                    responses: {
                        200: createResponseSchema('proxyFeaturesSchema'),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '',
            handler: ProxyController.endpointNotImplemented,
            permission: NONE,
        });

        this.route({
            method: 'get',
            path: '/client/features',
            handler: ProxyController.endpointNotImplemented,
            permission: NONE,
        });

        this.route({
            method: 'post',
            path: '/client/metrics',
            handler: this.registerProxyMetrics,
            permission: NONE,
            middleware: [
                this.services.openApiService.validPath({
                    tags: ['Unstable'],
                    operationId: 'registerFrontendMetrics',
                    requestBody: createRequestSchema('proxyMetricsSchema'),
                    responses: { 200: emptyResponse },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '/client/register',
            handler: ProxyController.registerProxyClient,
            permission: NONE,
            middleware: [
                this.services.openApiService.validPath({
                    tags: ['Unstable'],
                    operationId: 'registerFrontendClient',
                    requestBody: createRequestSchema('proxyClientSchema'),
                    responses: { 200: emptyResponse },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/health',
            handler: ProxyController.endpointNotImplemented,
            permission: NONE,
        });

        this.route({
            method: 'get',
            path: '/internal-backstage/prometheus',
            handler: ProxyController.endpointNotImplemented,
            permission: NONE,
        });
    }

    private static async endpointNotImplemented(
        req: ApiUserRequest,
        res: Response,
    ) {
        res.status(405).json({
            message: 'The frontend API does not support this endpoint.',
        });
    }

    private async getProxyFeatures(
        req: ApiUserRequest,
        res: Response<ProxyFeaturesSchema>,
    ) {
        const toggles = await this.services.proxyService.getProxyFeatures(
            req.user,
            ProxyController.createContext(req),
        );
        this.services.openApiService.respondWithValidation(
            200,
            res,
            proxyFeaturesSchema.$id,
            { toggles },
        );
    }

    private async registerProxyMetrics(
        req: ApiUserRequest<unknown, unknown, ProxyMetricsSchema>,
        res: Response,
    ) {
        await this.services.proxyService.registerProxyMetrics(
            req.user,
            req.body,
            req.ip,
        );
        res.sendStatus(200);
    }

    private static async registerProxyClient(
        req: ApiUserRequest<unknown, unknown, ProxyClientSchema>,
        res: Response<string>,
    ) {
        // Client registration is not yet supported by @unleash/proxy,
        // but proxy clients may still expect a 200 from this endpoint.
        res.sendStatus(200);
    }

    private static createContext(req: ApiUserRequest): Context {
        const { query } = req;
        query.remoteAddress = query.remoteAddress || req.ip;
        query.environment = req.user.environment;
        return createContext(query);
    }
}

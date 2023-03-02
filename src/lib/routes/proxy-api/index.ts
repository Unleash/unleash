import { Request, Response } from 'express';
import Controller from '../controller';
import {
    IFlagResolver,
    IUnleashConfig,
    IUnleashServices,
    NONE,
} from '../../types';
import { Logger } from '../../logger';
import ApiUser from '../../types/api-user';
import {
    createRequestSchema,
    createResponseSchema,
    emptyResponse,
    ProxyClientSchema,
    proxyFeaturesSchema,
    ProxyFeaturesSchema,
    ProxyMetricsSchema,
} from '../../openapi';
import { Context } from 'unleash-client';
import { enrichContextWithIp } from '../../proxy';
import { corsOriginMiddleware } from '../../middleware';
import * as process from 'process';

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

    private flagResolver: IFlagResolver;

    constructor(
        config: IUnleashConfig,
        services: Services,
        flagResolver: IFlagResolver,
    ) {
        super(config);
        this.logger = config.getLogger('proxy-api/index.ts');
        this.services = services;
        this.flagResolver = flagResolver;

        // Support CORS requests for the frontend endpoints.
        // Preflight requests are handled in `app.ts`.
        this.app.use(corsOriginMiddleware(services, config));

        this.route({
            method: 'get',
            path: '',
            handler: this.getProxyFeatures,
            permission: NONE,
            middleware: [
                this.services.openApiService.validPath({
                    tags: ['Frontend API'],
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
                    tags: ['Frontend API'],
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
                    tags: ['Frontend API'],
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
        let toggles;
        if (
            this.flagResolver.isEnabled('proxyReturnAllToggles') &&
            Boolean(process.env.RETURN_ALL_TOGGLES)
        ) {
            toggles = await this.services.proxyService.getAllProxyFeatures(
                req.user,
                ProxyController.createContext(req),
            );
        } else {
            toggles = await this.services.proxyService.getProxyFeatures(
                req.user,
                ProxyController.createContext(req),
            );
        }

        res.set('Cache-control', 'public, max-age=2');

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
        return enrichContextWithIp(query, req.ip);
    }
}

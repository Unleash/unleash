import { Request, Response } from 'express';
import hashSum from 'hash-sum';
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
    ClientMetricsSchema,
    createRequestSchema,
    createResponseSchema,
    emptyResponse,
    ProxyClientSchema,
    proxyFeaturesSchema,
    ProxyFeaturesSchema,
} from '../../openapi';
import { Context } from 'unleash-client';
import { enrichContextWithIp } from '../../proxy';
import { corsOriginMiddleware } from '../../middleware';
import { UnleashError } from '../../error/api-error';
import { EventService } from 'lib/services';

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
    'settingService' | 'proxyService' | 'openApiService' | 'eventService'
>;

//copy with pride
interface IMeta {
    revisionId: number;
    etag: string;
    queryHash: string;
}

export default class ProxyController extends Controller {
    private readonly logger: Logger;

    private services: Services;

    private flagResolver: IFlagResolver;

    private eventService: EventService;

    constructor(
        config: IUnleashConfig,
        services: Services,
        flagResolver: IFlagResolver,
    ) {
        super(config);
        this.logger = config.getLogger('proxy-api/index.ts');
        this.services = services;
        this.flagResolver = flagResolver;
        this.eventService = services.eventService;

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
                    requestBody: createRequestSchema('clientMetricsSchema'),
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
        const error = new UnleashError({
            name: 'NotImplementedError',
            message: 'The frontend API does not support this endpoint.',
        });
        res.status(error.statusCode).json(error);
    }

    private async getProxyFeatures(
        req: ApiUserRequest,
        res: Response<ProxyFeaturesSchema>,
    ) {
        if (this.flagResolver.isEnabled('optimal304Frontend')) {
            return this.optimal304(req, res);
        }

        const toggles = await this.services.proxyService.getProxyFeatures(
            req.user,
            ProxyController.createContext(req),
        );

        res.set('Cache-control', 'public, max-age=2');

        this.services.openApiService.respondWithValidation(
            200,
            res,
            proxyFeaturesSchema.$id,
            { toggles },
        );
    }

    private async optimal304(
        req: ApiUserRequest,
        res: Response<ProxyFeaturesSchema>,
    ) {
        const context = ProxyController.createContext(req);
        const env = req.user.environment;

        const userVersion = req.headers['if-none-match'];
        const meta = await this.calculateMeta(context, env);
        const { etag } = meta;

        res.setHeader('ETag', etag);

        if (etag === userVersion) {
            res.status(304);
            res.end();
            return;
        } else {
            this.logger.debug(
                `Provided revision: ${userVersion}, calculated revision: ${etag}`,
            );
        }

        const toggles = await this.services.proxyService.getProxyFeatures(
            req.user,
            context,
        );

        res.set('Cache-control', 'public, max-age=2');

        this.services.openApiService.respondWithValidation(
            200,
            res,
            proxyFeaturesSchema.$id,
            { toggles },
        );
    }

    private async registerProxyMetrics(
        req: ApiUserRequest<unknown, unknown, ClientMetricsSchema>,
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

    async calculateMeta(context: Context, environment: string): Promise<IMeta> {
        // TODO: We will need to standardize this to be able to implement this a cross languages (Edge in Rust?).
        const revisionId = await this.eventService.getMaxRevisionId();

        // TODO: We will need to standardize this to be able to implement this a cross languages (Edge in Rust?).
        const queryHash = hashSum({ context, environment });
        const etag = `"${queryHash}:${revisionId}"`;
        return { revisionId, etag, queryHash };
    }
}

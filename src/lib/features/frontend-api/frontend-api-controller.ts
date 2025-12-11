import type { Request, Response } from 'express';
import Controller from '../../routes/controller.js';
import {
    type IFlagResolver,
    type IUnleashConfig,
    NONE,
} from '../../types/index.js';
import type { Logger } from '../../logger.js';
import type { IApiUser } from '../../types/api-user.js';
import {
    type ClientMetricsSchema,
    createRequestSchema,
    createResponseSchema,
    emptyResponse,
    type FrontendApiClientSchema,
    frontendApiFeaturesSchema,
    type FrontendApiFeaturesSchema,
    getStandardResponses,
} from '../../openapi/index.js';
import type { Context } from 'unleash-client';
import { enrichContextWithIp } from './index.js';
import NotImplementedError from '../../error/not-implemented-error.js';
import rateLimit from 'express-rate-limit';
import { minutesToMilliseconds } from 'date-fns';
import metricsHelper from '../../util/metrics-helper.js';
import { FUNCTION_TIME } from '../../metric-events.js';
import type { IUnleashServices } from '../../services/index.js';

interface ApiUserRequest<
    PARAM = any,
    ResBody = any,
    ReqBody = any,
    ReqQuery = any,
> extends Request<PARAM, ResBody, ReqBody, ReqQuery> {
    user: IApiUser;
}

type Services = Pick<
    IUnleashServices,
    | 'settingService'
    | 'frontendApiService'
    | 'openApiService'
    | 'clientInstanceService'
>;

export default class FrontendAPIController extends Controller {
    private readonly logger: Logger;

    private services: Services;

    private timer: Function;

    private flagResolver: IFlagResolver;

    constructor(config: IUnleashConfig, services: Services) {
        super(config);
        this.logger = config.getLogger('frontend-api-controller.ts');
        this.services = services;
        this.flagResolver = config.flagResolver;

        this.timer = (functionName: string) =>
            metricsHelper.wrapTimer(config.eventBus, FUNCTION_TIME, {
                className: 'FrontendAPIController',
                functionName,
            });

        this.route({
            method: 'get',
            path: '',
            handler: this.getFrontendApiFeatures,
            permission: NONE,
            middleware: [
                this.services.openApiService.validPath({
                    tags: ['Frontend API'],
                    operationId: 'getFrontendFeatures',
                    responses: {
                        200: createResponseSchema('frontendApiFeaturesSchema'),
                        ...getStandardResponses(401, 404),
                    },
                    summary:
                        'Retrieve enabled feature flags for the provided context.',
                    description:
                        'This endpoint returns the list of feature flags that the frontend API evaluates to enabled for the given context. Context values are provided as query parameters. If the Frontend API is disabled 404 is returned.',
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '',
            handler: this.getFrontendApiFeatures,
            permission: NONE,
            middleware: [
                this.services.openApiService.validPath({
                    tags: ['Frontend API'],
                    operationId: 'getFrontendApiFeaturesWithPost',
                    requestBody: createRequestSchema(
                        'frontendApiFeaturesPostSchema',
                    ),
                    responses: {
                        200: createResponseSchema('frontendApiFeaturesSchema'),
                        ...getStandardResponses(401, 404),
                    },
                    summary:
                        'Retrieve enabled feature flags for the provided context, using POST.',
                    description:
                        'This endpoint returns the list of feature flags that the frontend API evaluates to enabled for the given context, using POST. Context values are provided as a `context` property in the request body. If the Frontend API is disabled 404 is returned.',
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/client/features',
            handler: FrontendAPIController.endpointNotImplemented,
            permission: NONE,
        });

        this.route({
            method: 'post',
            path: '/client/metrics',
            handler: this.registerFrontendApiMetrics,
            permission: NONE,
            middleware: [
                this.services.openApiService.validPath({
                    tags: ['Frontend API'],
                    summary: 'Register client usage metrics',
                    description: `Registers usage metrics. Stores information about how many times each flag was evaluated to enabled and disabled within a time frame. If provided, this operation will also store data on how many times each feature flag's variants were displayed to the end user. If the Frontend API is disabled 404 is returned.`,
                    operationId: 'registerFrontendMetrics',
                    requestBody: createRequestSchema('clientMetricsSchema'),
                    responses: {
                        200: emptyResponse,
                        204: emptyResponse,
                        ...getStandardResponses(400, 401, 404),
                    },
                }),
                rateLimit({
                    windowMs: minutesToMilliseconds(1),
                    max: config.metricsRateLimiting.frontendMetricsMaxPerMinute,
                    validate: false,
                    standardHeaders: true,
                    legacyHeaders: false,
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '/client/register',
            handler: this.registerFrontendApiClient,
            permission: NONE,
            middleware: [
                this.services.openApiService.validPath({
                    tags: ['Frontend API'],
                    summary: 'Register a client SDK',
                    description:
                        'This is for future use. Currently Frontend client registration is not supported. Returning 200 for clients that expect this status code. If the Frontend API is disabled 404 is returned.',
                    operationId: 'registerFrontendClient',
                    requestBody: createRequestSchema('frontendApiClientSchema'),
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(400, 401, 404),
                    },
                }),
                rateLimit({
                    windowMs: minutesToMilliseconds(1),
                    max: config.metricsRateLimiting
                        .frontendRegisterMaxPerMinute,
                    validate: false,
                    standardHeaders: true,
                    legacyHeaders: false,
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/health',
            handler: FrontendAPIController.endpointNotImplemented,
            permission: NONE,
        });

        this.route({
            method: 'get',
            path: '/internal-backstage/prometheus',
            handler: FrontendAPIController.endpointNotImplemented,
            permission: NONE,
        });
    }

    private static async endpointNotImplemented(
        _req: ApiUserRequest,
        res: Response,
    ) {
        const error = new NotImplementedError(
            'The frontend API does not support this endpoint.',
        );
        res.status(error.statusCode).json(error);
    }

    private async getFrontendApiFeatures(
        req: ApiUserRequest,
        res: Response<FrontendApiFeaturesSchema>,
    ) {
        const toggles =
            await this.services.frontendApiService.getFrontendApiFeatures(
                req.user,
                FrontendAPIController.createContext(req),
            );

        res.set('Cache-control', 'no-cache');

        this.services.openApiService.respondWithValidation(
            200,
            res,
            frontendApiFeaturesSchema.$id,
            { toggles },
        );
    }

    private async registerFrontendApiMetrics(
        req: ApiUserRequest<unknown, unknown, ClientMetricsSchema>,
        res: Response,
    ) {
        if (this.config.flagResolver.isEnabled('disableMetrics')) {
            res.sendStatus(204);
            return;
        }

        await this.services.frontendApiService.registerFrontendApiMetrics(
            req.user,
            req.body,
            req.ip,
            req.headers['unleash-sdk'],
        );

        res.sendStatus(200);
    }

    private async registerFrontendApiClient(
        _req: ApiUserRequest<unknown, unknown, FrontendApiClientSchema>,
        res: Response<string>,
    ) {
        // Client registration is not yet supported by @unleash/proxy,
        // but proxy clients may still expect a 200 from this endpoint.
        res.sendStatus(200);
    }

    private static createContext(req: ApiUserRequest): Context {
        const { query, body } = req;

        const bodyContext = body.context ?? {};
        const contextData = req.method === 'POST' ? bodyContext : query;

        return enrichContextWithIp(contextData, req.ip);
    }
}

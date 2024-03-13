import { Request, Response } from 'express';
import Controller from '../../routes/controller';
import { IUnleashConfig, IUnleashServices, NONE } from '../../types';
import { Logger } from '../../logger';
import { IApiUser } from '../../types/api-user';
import {
    ClientMetricsSchema,
    createRequestSchema,
    createResponseSchema,
    emptyResponse,
    getStandardResponses,
    FrontendApiClientSchema,
    FrontendApiFeatureSchema,
    frontendApiFeaturesSchema,
    FrontendApiFeaturesSchema,
} from '../../openapi';
import { Context } from 'unleash-client';
import { enrichContextWithIp } from './index';
import { corsOriginMiddleware } from '../../middleware';
import NotImplementedError from '../../error/not-implemented-error';
import NotFoundError from '../../error/notfound-error';
import rateLimit from 'express-rate-limit';
import { minutesToMilliseconds } from 'date-fns';
import isEqual from 'lodash.isequal';
import { diff } from 'json-diff';
import metricsHelper from '../../util/metrics-helper';
import { FUNCTION_TIME } from '../../metric-events';

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
    'settingService' | 'frontendApiService' | 'openApiService'
>;

export default class FrontendAPIController extends Controller {
    private readonly logger: Logger;

    private services: Services;

    private timer: Function;

    constructor(config: IUnleashConfig, services: Services) {
        super(config);
        this.logger = config.getLogger('frontend-api-controller.ts');
        this.services = services;

        this.timer = (functionName) =>
            metricsHelper.wrapTimer(config.eventBus, FUNCTION_TIME, {
                className: 'FrontendAPIController',
                functionName,
            });

        // Support CORS requests for the frontend endpoints.
        // Preflight requests are handled in `app.ts`.
        this.app.use(corsOriginMiddleware(services, config));

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
                        'Retrieve enabled feature toggles for the provided context.',
                    description:
                        'This endpoint returns the list of feature toggles that the frontend API evaluates to enabled for the given context. Context values are provided as query parameters. If the Frontend API is disabled 404 is returned.',
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '',
            handler: FrontendAPIController.endpointNotImplemented,
            permission: NONE,
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
                    description: `Registers usage metrics. Stores information about how many times each toggle was evaluated to enabled and disabled within a time frame. If provided, this operation will also store data on how many times each feature toggle's variants were displayed to the end user. If the Frontend API is disabled 404 is returned.`,
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
        req: ApiUserRequest,
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
        if (!this.config.flagResolver.isEnabled('embedProxy')) {
            throw new NotFoundError();
        }
        let toggles: FrontendApiFeatureSchema[];
        let newToggles: FrontendApiFeatureSchema[] = [];
        if (this.config.flagResolver.isEnabled('globalFrontendApiCache')) {
            const context = FrontendAPIController.createContext(req);
            [toggles, newToggles] = await Promise.all([
                this.getTimedFrontendApiFeatures(req, context),
                this.getTimedNewFrontendApiFeatures(req, context),
            ]);
            const sortedToggles = toggles.sort((a, b) =>
                a.name.localeCompare(b.name),
            );
            const sortedNewToggles = newToggles.sort((a, b) =>
                a.name.localeCompare(b.name),
            );
            if (!isEqual(sortedToggles, sortedNewToggles)) {
                this.logger.warn(
                    `old features and new features are different. Old count ${
                        toggles.length
                    }, new count ${newToggles.length}, projects ${
                        req.user.projects
                    }, environment ${
                        req.user.environment
                    }, diff ${JSON.stringify(
                        diff(sortedToggles, sortedNewToggles),
                    )}`,
                );
            }
        } else {
            toggles =
                await this.services.frontendApiService.getFrontendApiFeatures(
                    req.user,
                    FrontendAPIController.createContext(req),
                );
        }

        const returnedToggles = this.config.flagResolver.isEnabled(
            'returnGlobalFrontendApiCache',
        )
            ? newToggles
            : toggles;

        res.set('Cache-control', 'no-cache');

        this.services.openApiService.respondWithValidation(
            200,
            res,
            frontendApiFeaturesSchema.$id,
            { toggles: returnedToggles },
        );
    }

    private async getTimedFrontendApiFeatures(req, context) {
        const stopTimer = this.timer('getFrontendApiFeatures');
        const features =
            await this.services.frontendApiService.getFrontendApiFeatures(
                req.user,
                context,
            );
        stopTimer();
        return features;
    }

    private async getTimedNewFrontendApiFeatures(req, context) {
        const stopTimer = this.timer('getNewFrontendApiFeatures');
        const features =
            await this.services.frontendApiService.getNewFrontendApiFeatures(
                req.user,
                context,
            );
        stopTimer();
        return features;
    }

    private async registerFrontendApiMetrics(
        req: ApiUserRequest<unknown, unknown, ClientMetricsSchema>,
        res: Response,
    ) {
        if (!this.config.flagResolver.isEnabled('embedProxy')) {
            throw new NotFoundError();
        }

        if (this.config.flagResolver.isEnabled('disableMetrics')) {
            res.sendStatus(204);
            return;
        }

        await this.services.frontendApiService.registerFrontendApiMetrics(
            req.user,
            req.body,
            req.ip,
        );
        res.sendStatus(200);
    }

    private async registerFrontendApiClient(
        req: ApiUserRequest<unknown, unknown, FrontendApiClientSchema>,
        res: Response<string>,
    ) {
        if (!this.config.flagResolver.isEnabled('embedProxy')) {
            throw new NotFoundError();
        }
        // Client registration is not yet supported by @unleash/proxy,
        // but proxy clients may still expect a 200 from this endpoint.
        res.sendStatus(200);
    }

    private static createContext(req: ApiUserRequest): Context {
        const { query } = req;
        return enrichContextWithIp(query, req.ip);
    }
}

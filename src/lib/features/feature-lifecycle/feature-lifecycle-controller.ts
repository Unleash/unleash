import type { FeatureLifecycleService } from './feature-lifecycle-service.js';
import {
    type IFlagResolver,
    type IUnleashConfig,
    NONE,
    serializeDates,
    UPDATE_FEATURE,
} from '../../types/index.js';
import type { IUnleashServices, OpenApiService } from '../../services/index.js';
import {
    createRequestSchema,
    createResponseSchema,
    emptyResponse,
    type FeatureLifecycleCompletedSchema,
    featureLifecycleSchema,
    type FeatureLifecycleSchema,
    getStandardResponses,
} from '../../openapi/index.js';
import Controller from '../../routes/controller.js';
import type { Request, Response } from 'express';
import type { IAuthRequest } from '../../routes/unleash-types.js';
import type { WithTransactional } from '../../db/transaction.js';

interface FeatureLifecycleParams extends Record<string, string> {
    projectId: string;
    featureName: string;
}

const PATH = '/:projectId/features/:featureName/lifecycle';

export default class FeatureLifecycleController extends Controller {
    private featureLifecycleService: WithTransactional<FeatureLifecycleService>;

    private openApiService: OpenApiService;

    private flagResolver: IFlagResolver;

    constructor(
        config: IUnleashConfig,
        {
            transactionalFeatureLifecycleService,
            openApiService,
        }: Pick<
            IUnleashServices,
            'openApiService' | 'transactionalFeatureLifecycleService'
        >,
    ) {
        super(config);
        this.featureLifecycleService = transactionalFeatureLifecycleService;
        this.openApiService = openApiService;
        this.flagResolver = config.flagResolver;

        this.route({
            method: 'get',
            path: PATH,
            handler: this.getFeatureLifecycle,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Unstable'],
                    summary: 'Get feature lifecycle',
                    description:
                        'Information about the lifecycle stages of the feature.',
                    operationId: 'getFeatureLifecycle',
                    responses: {
                        200: createResponseSchema('featureLifecycleSchema'),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: `${PATH}/complete`,
            handler: this.complete,
            permission: UPDATE_FEATURE,
            acceptAnyContentType: true,
            middleware: [
                openApiService.validPath({
                    tags: ['Unstable'],
                    summary: 'Set feature completed',
                    description: 'This will set the feature as completed.',
                    operationId: 'complete',
                    requestBody: createRequestSchema(
                        'featureLifecycleCompletedSchema',
                    ),
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: `${PATH}/uncomplete`,
            handler: this.uncomplete,
            permission: UPDATE_FEATURE,
            acceptAnyContentType: true,
            middleware: [
                openApiService.validPath({
                    tags: ['Unstable'],
                    summary: 'Set feature uncompleted',
                    description: 'This will set the feature as uncompleted.',
                    operationId: 'uncomplete',
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });
    }

    async getFeatureLifecycle(
        req: Request<FeatureLifecycleParams, any, any, any>,
        res: Response<FeatureLifecycleSchema>,
    ): Promise<void> {
        const { featureName } = req.params;

        const result =
            await this.featureLifecycleService.getFeatureLifecycle(featureName);

        this.openApiService.respondWithValidation(
            200,
            res,
            featureLifecycleSchema.$id,
            serializeDates(result),
        );
    }

    async complete(
        req: IAuthRequest<
            FeatureLifecycleParams,
            any,
            FeatureLifecycleCompletedSchema
        >,
        res: Response,
    ): Promise<void> {
        const { featureName, projectId } = req.params;

        const status = req.body;

        await this.featureLifecycleService.transactional((service) =>
            service.featureCompleted(featureName, projectId, status, req.audit),
        );

        res.status(200).end();
    }

    async uncomplete(
        req: IAuthRequest<FeatureLifecycleParams>,
        res: Response,
    ): Promise<void> {
        const { featureName, projectId } = req.params;

        await this.featureLifecycleService.transactional((service) =>
            service.featureUncompleted(featureName, projectId, req.audit),
        );

        res.status(200).end();
    }
}

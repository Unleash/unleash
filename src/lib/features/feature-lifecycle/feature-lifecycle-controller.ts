import type { FeatureLifecycleService } from './feature-lifecycle-service';
import {
    type IFlagResolver,
    type IUnleashConfig,
    type IUnleashServices,
    NONE,
    serializeDates,
} from '../../types';
import type { OpenApiService } from '../../services';
import {
    createResponseSchema,
    featureLifecycleSchema,
    type FeatureLifecycleSchema,
    getStandardResponses,
} from '../../openapi';
import Controller from '../../routes/controller';
import type { Request, Response } from 'express';
import { NotFoundError } from '../../error';

interface FeatureLifecycleParams {
    projectId: string;
    featureName: string;
}

const PATH = '/:projectId/features/:featureName/lifecycle';

export default class FeatureLifecycleController extends Controller {
    private featureLifecycleService: FeatureLifecycleService;

    private openApiService: OpenApiService;

    private flagResolver: IFlagResolver;

    constructor(
        config: IUnleashConfig,
        {
            featureLifecycleService,
            openApiService,
        }: Pick<IUnleashServices, 'openApiService' | 'featureLifecycleService'>,
    ) {
        super(config);
        this.featureLifecycleService = featureLifecycleService;
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
    }

    async getFeatureLifecycle(
        req: Request<FeatureLifecycleParams, any, any, any>,
        res: Response<FeatureLifecycleSchema>,
    ): Promise<void> {
        if (!this.flagResolver.isEnabled('featureLifecycle')) {
            throw new NotFoundError('Feature lifecycle is disabled.');
        }
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
}

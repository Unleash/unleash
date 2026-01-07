import {
    type IFeatureLifecycleReadModel,
    type IUnleashConfig,
    type IUnleashStores,
    NONE,
} from '../../types/index.js';
import type { IUnleashServices, OpenApiService } from '../../services/index.js';
import {
    createResponseSchema,
    getStandardResponses,
} from '../../openapi/index.js';
import Controller from '../../routes/controller.js';
import type { Request, Response } from 'express';
import {
    type FeatureLifecycleCountSchema,
    featureLifecycleCountSchema,
} from '../../openapi/spec/feature-lifecycle-count-schema.js';

export default class FeatureLifecycleCountController extends Controller {
    private featureLifecycleReadModel: IFeatureLifecycleReadModel;

    private openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        { openApiService }: Pick<IUnleashServices, 'openApiService'>,
        {
            featureLifecycleReadModel,
        }: Pick<IUnleashStores, 'featureLifecycleReadModel'>,
    ) {
        super(config);
        this.featureLifecycleReadModel = featureLifecycleReadModel;
        this.openApiService = openApiService;

        this.route({
            method: 'get',
            path: '/count',
            handler: this.getStageCount,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Unstable'],
                    summary: 'Get all features lifecycle stage count',
                    description:
                        'Information about the number of features in each lifecycle stage.',
                    operationId: 'getFeatureLifecycleStageCount',
                    responses: {
                        200: createResponseSchema(
                            'featureLifecycleCountSchema',
                        ),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });
    }

    async getStageCount(
        _: Request<any, any, any, any>,
        res: Response<FeatureLifecycleCountSchema>,
    ): Promise<void> {
        const stageCounts =
            await this.featureLifecycleReadModel.getStageCount();

        const result: Record<string, number> = stageCounts.reduce(
            (acc, { stage, count }) => {
                acc[stage === 'pre-live' ? 'preLive' : stage] = count;
                return acc;
            },
            { initial: 0, preLive: 0, live: 0, completed: 0, archived: 0 },
        );

        this.openApiService.respondWithValidation(
            200,
            res,
            featureLifecycleCountSchema.$id,
            result,
        );
    }
}

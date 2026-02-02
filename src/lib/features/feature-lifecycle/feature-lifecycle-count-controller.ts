import {
    type IAuthRequest,
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
import type { Response } from 'express';
import {
    type FeatureLifecycleCountSchema,
    featureLifecycleCountSchema,
} from '../../openapi/spec/feature-lifecycle-count-schema.js';
import type { IPrivateProjectChecker } from '../private-project/privateProjectCheckerType.js';

export default class FeatureLifecycleCountController extends Controller {
    private featureLifecycleReadModel: IFeatureLifecycleReadModel;

    private openApiService: OpenApiService;

    private privateProjectChecker: IPrivateProjectChecker;

    constructor(
        config: IUnleashConfig,
        {
            openApiService,
            privateProjectChecker,
        }: Pick<IUnleashServices, 'openApiService' | 'privateProjectChecker'>,
        {
            featureLifecycleReadModel,
        }: Pick<IUnleashStores, 'featureLifecycleReadModel'>,
    ) {
        super(config);
        this.featureLifecycleReadModel = featureLifecycleReadModel;
        this.openApiService = openApiService;
        this.privateProjectChecker = privateProjectChecker;

        this.route({
            method: 'get',
            path: '/count',
            handler: this.getStageCount,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    release: { beta: '7', stable: '8' },
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
        req: IAuthRequest,
        res: Response<FeatureLifecycleCountSchema>,
    ): Promise<void> {
        const user = req.user;
        const accessibleProjects =
            await this.privateProjectChecker.getUserAccessibleProjects(user.id);

        const projectsToFilter =
            accessibleProjects.mode === 'limited'
                ? accessibleProjects.projects
                : undefined;

        const stageCounts =
            await this.featureLifecycleReadModel.getStageCount(
                projectsToFilter,
            );

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

import { Response } from 'express';
import Controller from '../../routes/controller';
import { OpenApiService } from '../../services';
import {
    IFlagResolver,
    IUnleashConfig,
    IUnleashServices,
    UPDATE_FEATURE,
} from '../../types';
import { Logger } from '../../logger';
import {
    CreateDependentFeatureSchema,
    createRequestSchema,
    emptyResponse,
    getStandardResponses,
} from '../../openapi';
import { IAuthRequest } from '../../routes/unleash-types';
import { InvalidOperationError } from '../../error';
import { DependentFeaturesService } from './dependent-features-service';

interface FeatureParams {
    featureName: string;
}

interface DeleteDependencyParams {
    featureName: string;
    dependency: string;
}

const PATH = '/:projectId/features';
const PATH_FEATURE = `${PATH}/:featureName`;
const PATH_DEPENDENCIES = `${PATH_FEATURE}/dependencies`;
const PATH_DEPENDENCY = `${PATH_FEATURE}/dependencies/:dependency`;

type DependentFeaturesServices = Pick<
    IUnleashServices,
    'dependentFeaturesService' | 'openApiService'
>;

export default class DependentFeaturesController extends Controller {
    private dependentFeaturesService: DependentFeaturesService;

    private openApiService: OpenApiService;

    private flagResolver: IFlagResolver;

    private readonly logger: Logger;

    constructor(
        config: IUnleashConfig,
        { dependentFeaturesService, openApiService }: DependentFeaturesServices,
    ) {
        super(config);
        this.dependentFeaturesService = dependentFeaturesService;
        this.openApiService = openApiService;
        this.flagResolver = config.flagResolver;
        this.logger = config.getLogger(
            '/dependent-features/dependent-feature-service.ts',
        );

        this.route({
            method: 'post',
            path: PATH_DEPENDENCIES,
            handler: this.addFeatureDependency,
            permission: UPDATE_FEATURE,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    summary: 'Add a feature dependency.',
                    description:
                        'Add a dependency to a parent feature. Each environment will resolve corresponding dependency independently.',
                    operationId: 'addFeatureDependency',
                    requestBody: createRequestSchema(
                        'createDependentFeatureSchema',
                    ),
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'delete',
            path: PATH_DEPENDENCY,
            handler: this.deleteFeatureDependency,
            permission: UPDATE_FEATURE,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    summary: 'Deletes a feature dependency.',
                    description: 'Remove a dependency to a parent feature.',
                    operationId: 'deleteFeatureDependency',
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });
    }

    async addFeatureDependency(
        req: IAuthRequest<FeatureParams, any, CreateDependentFeatureSchema>,
        res: Response,
    ): Promise<void> {
        const { featureName } = req.params;
        const { variants, enabled, feature } = req.body;

        if (this.config.flagResolver.isEnabled('dependentFeatures')) {
            await this.dependentFeaturesService.upsertFeatureDependency(
                featureName,
                {
                    variants,
                    enabled,
                    feature,
                },
            );
            res.status(200).end();
        } else {
            throw new InvalidOperationError(
                'Dependent features are not enabled',
            );
        }
    }

    async deleteFeatureDependency(
        req: IAuthRequest<DeleteDependencyParams, any, any>,
        res: Response,
    ): Promise<void> {
        const { featureName, dependency } = req.params;

        if (this.config.flagResolver.isEnabled('dependentFeatures')) {
            await this.dependentFeaturesService.deleteFeatureDependency({
                parent: dependency,
                child: featureName,
            });
            res.status(200).end();
        } else {
            throw new InvalidOperationError(
                'Dependent features are not enabled',
            );
        }
    }
}

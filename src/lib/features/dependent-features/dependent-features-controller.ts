import { Response } from 'express';
import Controller from '../../routes/controller';
import { OpenApiService } from '../../services';
import {
    IFlagResolver,
    IUnleashConfig,
    IUnleashServices,
    NONE,
    UPDATE_FEATURE_DEPENDENCY,
} from '../../types';
import { Logger } from '../../logger';
import {
    CreateDependentFeatureSchema,
    createRequestSchema,
    createResponseSchema,
    emptyResponse,
    getStandardResponses,
    ParentFeatureOptionsSchema,
} from '../../openapi';
import { IAuthRequest } from '../../routes/unleash-types';
import { InvalidOperationError } from '../../error';
import { DependentFeaturesService } from './dependent-features-service';
import {
    TransactionCreator,
    UnleashTransaction,
    WithTransactional,
} from '../../db/transaction';

interface ProjectParams {
    projectId: string;
}

interface FeatureParams extends ProjectParams {
    child: string;
}

interface DeleteDependencyParams extends ProjectParams {
    child: string;
    parent: string;
}

const PATH = '/:projectId/features';
const PATH_FEATURE = `${PATH}/:child`;
const PATH_DEPENDENCIES = `${PATH_FEATURE}/dependencies`;
const PATH_DEPENDENCIES_CHECK = `/:projectId/dependencies`;
const PATH_PARENTS = `${PATH_FEATURE}/parents`;
const PATH_DEPENDENCY = `${PATH_FEATURE}/dependencies/:parent`;

type DependentFeaturesServices = Pick<
    IUnleashServices,
    'dependentFeaturesService' | 'dependentFeaturesService' | 'openApiService'
>;

export default class DependentFeaturesController extends Controller {
    private dependentFeaturesService: WithTransactional<DependentFeaturesService>;

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
            permission: UPDATE_FEATURE_DEPENDENCY,
            middleware: [
                openApiService.validPath({
                    tags: ['Dependencies'],
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
            permission: UPDATE_FEATURE_DEPENDENCY,
            acceptAnyContentType: true,
            middleware: [
                openApiService.validPath({
                    tags: ['Dependencies'],
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

        this.route({
            method: 'delete',
            path: PATH_DEPENDENCIES,
            handler: this.deleteFeatureDependencies,
            permission: UPDATE_FEATURE_DEPENDENCY,
            acceptAnyContentType: true,
            middleware: [
                openApiService.validPath({
                    tags: ['Dependencies'],
                    summary: 'Deletes feature dependencies.',
                    description: 'Remove dependencies to all parent features.',
                    operationId: 'deleteFeatureDependencies',
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: PATH_PARENTS,
            handler: this.getParentOptions,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Dependencies'],
                    summary: 'List parent options.',
                    description:
                        'List available parents who have no transitive dependencies.',
                    operationId: 'listParentOptions',
                    responses: {
                        200: createResponseSchema('parentFeatureOptionsSchema'),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: PATH_DEPENDENCIES_CHECK,
            handler: this.checkDependenciesExist,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Dependencies'],
                    summary: 'Check dependencies exist.',
                    description:
                        'Check if any dependencies exist in this Unleash instance',
                    operationId: 'checkDependenciesExist',
                    responses: {
                        200: createResponseSchema('dependenciesExistSchema'),
                        ...getStandardResponses(401, 403),
                    },
                }),
            ],
        });
    }

    async addFeatureDependency(
        req: IAuthRequest<FeatureParams, any, CreateDependentFeatureSchema>,
        res: Response,
    ): Promise<void> {
        const { child, projectId } = req.params;
        const { variants, enabled, feature } = req.body;

        if (this.config.flagResolver.isEnabled('dependentFeatures')) {
            await this.dependentFeaturesService.transactional((service) =>
                service.upsertFeatureDependency(
                    { child, projectId },
                    {
                        variants,
                        enabled,
                        feature,
                    },
                    req.user,
                ),
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
        const { child, parent, projectId } = req.params;

        if (this.config.flagResolver.isEnabled('dependentFeatures')) {
            await this.dependentFeaturesService.transactional((service) =>
                service.deleteFeatureDependency(
                    {
                        parent,
                        child,
                    },
                    projectId,
                    req.user,
                ),
            );
            res.status(200).end();
        } else {
            throw new InvalidOperationError(
                'Dependent features are not enabled',
            );
        }
    }

    async deleteFeatureDependencies(
        req: IAuthRequest<FeatureParams, any, any>,
        res: Response,
    ): Promise<void> {
        const { child, projectId } = req.params;

        if (this.config.flagResolver.isEnabled('dependentFeatures')) {
            await this.dependentFeaturesService.transactional((service) =>
                service.deleteFeaturesDependencies(
                    [child],
                    projectId,
                    req.user,
                ),
            );
            res.status(200).end();
        } else {
            throw new InvalidOperationError(
                'Dependent features are not enabled',
            );
        }
    }

    async getParentOptions(
        req: IAuthRequest<FeatureParams, any, any>,
        res: Response<ParentFeatureOptionsSchema>,
    ): Promise<void> {
        const { child } = req.params;

        if (this.config.flagResolver.isEnabled('dependentFeatures')) {
            const parentOptions =
                await this.dependentFeaturesService.getParentOptions(child);
            res.send(parentOptions);
        } else {
            throw new InvalidOperationError(
                'Dependent features are not enabled',
            );
        }
    }

    async checkDependenciesExist(
        req: IAuthRequest,
        res: Response,
    ): Promise<void> {
        const { child } = req.params;

        if (this.config.flagResolver.isEnabled('dependentFeatures')) {
            const exist =
                await this.dependentFeaturesService.checkDependenciesExist();
            res.send(exist);
        } else {
            throw new InvalidOperationError(
                'Dependent features are not enabled',
            );
        }
    }
}

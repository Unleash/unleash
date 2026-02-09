import type { Response } from 'express';
import Controller from '../../routes/controller.js';
import type { IUnleashServices, OpenApiService } from '../../services/index.js';
import {
    type IFlagResolver,
    type IUnleashConfig,
    NONE,
    UPDATE_FEATURE_DEPENDENCY,
} from '../../types/index.js';
import type { Logger } from '../../logger.js';
import {
    type CreateDependentFeatureSchema,
    createRequestSchema,
    createResponseSchema,
    emptyResponse,
    getStandardResponses,
    parentFeatureOptionsSchema,
    type ParentFeatureOptionsSchema,
    type ParentVariantOptionsSchema,
    parentVariantOptionsSchema,
} from '../../openapi/index.js';
import type { IAuthRequest } from '../../routes/unleash-types.js';
import type { DependentFeaturesService } from './dependent-features-service.js';
import type { WithTransactional } from '../../db/transaction.js';

interface ProjectParams {
    projectId: string;
}

interface FeatureParams extends ProjectParams {
    child: string;
}

interface ParentVariantsParams extends ProjectParams {
    parent: string;
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
const PATH_PARENT_VARIANTS = `${PATH}/:parent/parent-variants`;
const PATH_DEPENDENCY = `${PATH_FEATURE}/dependencies/:parent`;

type DependentFeaturesServices = Pick<
    IUnleashServices,
    'transactionalDependentFeaturesService' | 'openApiService'
>;

export default class DependentFeaturesController extends Controller {
    private dependentFeaturesService: WithTransactional<DependentFeaturesService>;

    private openApiService: OpenApiService;

    private flagResolver: IFlagResolver;

    private readonly logger: Logger;

    constructor(
        config: IUnleashConfig,
        {
            transactionalDependentFeaturesService,
            openApiService,
        }: DependentFeaturesServices,
    ) {
        super(config);
        this.dependentFeaturesService = transactionalDependentFeaturesService;
        this.openApiService = openApiService;
        this.flagResolver = config.flagResolver;
        this.logger = config.getLogger(
            '/dependent-features/dependent-features-controller.ts',
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
            handler: this.getPossibleParentFeatures,
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
            path: PATH_PARENT_VARIANTS,
            handler: this.getPossibleParentVariants,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Dependencies'],
                    summary: 'List parent feature variants.',
                    description:
                        'List available parent variants across all strategy variants and feature environment variants.',
                    operationId: 'listParentVariantOptions',
                    responses: {
                        200: createResponseSchema('parentVariantOptionsSchema'),
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

        await this.dependentFeaturesService.transactional((service) =>
            service.upsertFeatureDependency(
                { child, projectId },
                {
                    variants,
                    enabled,
                    feature,
                },
                req.user,
                req.audit,
            ),
        );

        res.status(200).end();
    }

    async deleteFeatureDependency(
        req: IAuthRequest<DeleteDependencyParams, any, any>,
        res: Response,
    ): Promise<void> {
        const { child, parent, projectId } = req.params;

        await this.dependentFeaturesService.transactional((service) =>
            service.deleteFeatureDependency(
                {
                    parent,
                    child,
                },
                projectId,
                req.user,
                req.audit,
            ),
        );
        res.status(200).end();
    }

    async deleteFeatureDependencies(
        req: IAuthRequest<FeatureParams, any, any>,
        res: Response,
    ): Promise<void> {
        const { child, projectId } = req.params;

        await this.dependentFeaturesService.transactional((service) =>
            service.deleteFeaturesDependencies(
                [child],
                projectId,
                req.user,
                req.audit,
            ),
        );
        res.status(200).end();
    }

    async getPossibleParentFeatures(
        req: IAuthRequest<FeatureParams, any, any>,
        res: Response<ParentFeatureOptionsSchema>,
    ): Promise<void> {
        const { child } = req.params;

        const options =
            await this.dependentFeaturesService.getPossibleParentFeatures(
                child,
            );

        this.openApiService.respondWithValidation(
            200,
            res,
            parentFeatureOptionsSchema.$id,
            options,
        );
    }

    async getPossibleParentVariants(
        req: IAuthRequest<ParentVariantsParams, any, any>,
        res: Response<ParentVariantOptionsSchema>,
    ): Promise<void> {
        const { parent } = req.params;

        const options =
            await this.dependentFeaturesService.getPossibleParentVariants(
                parent,
            );

        this.openApiService.respondWithValidation(
            200,
            res,
            parentVariantOptionsSchema.$id,
            options,
        );
    }

    async checkDependenciesExist(
        req: IAuthRequest,
        res: Response,
    ): Promise<void> {
        const exist =
            await this.dependentFeaturesService.checkDependenciesExist();
        res.send(exist);
    }
}

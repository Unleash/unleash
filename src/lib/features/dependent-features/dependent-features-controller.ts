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
import { DependentFeaturesService } from './dependent-features-service';
import { WithTransactional } from '../../db/transaction';

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
            service.deleteFeaturesDependencies([child], projectId, req.user),
        );
        res.status(200).end();
    }

    async getParentOptions(
        req: IAuthRequest<FeatureParams, any, any>,
        res: Response<ParentFeatureOptionsSchema>,
    ): Promise<void> {
        const { child } = req.params;

        const parentOptions =
            await this.dependentFeaturesService.getParentOptions(child);
        res.send(parentOptions);
    }

    async checkDependenciesExist(
        req: IAuthRequest,
        res: Response,
    ): Promise<void> {
        const { child } = req.params;

        const exist =
            await this.dependentFeaturesService.checkDependenciesExist();
        res.send(exist);
    }
}

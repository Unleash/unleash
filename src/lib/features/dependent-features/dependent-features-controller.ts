import { Response } from 'express';
import Controller from '../../routes/controller';
import { OpenApiService } from '../../services';
import {
    IFlagResolver,
    IUnleashConfig,
    IUnleashServices,
    NONE,
    UPDATE_FEATURE,
} from '../../types';
import { Logger } from '../../logger';
import {
    CreateDependentFeatureSchema,
    createRequestSchema,
    createResponseSchema,
    emptyResponse,
    getStandardResponses,
} from '../../openapi';
import { IAuthRequest } from '../../routes/unleash-types';
import { InvalidOperationError } from '../../error';
import { DependentFeaturesService } from './dependent-features-service';
import { TransactionCreator, UnleashTransaction } from '../../db/transaction';

interface FeatureParams {
    child: string;
}

interface DeleteDependencyParams {
    child: string;
    parent: string;
}

const PATH = '/:projectId/features';
const PATH_FEATURE = `${PATH}/:child`;
const PATH_DEPENDENCIES = `${PATH_FEATURE}/dependencies`;
const PATH_PARENTS = `${PATH_FEATURE}/parents`;
const PATH_DEPENDENCY = `${PATH_FEATURE}/dependencies/:parent`;

type DependentFeaturesServices = Pick<
    IUnleashServices,
    | 'transactionalDependentFeaturesService'
    | 'dependentFeaturesService'
    | 'openApiService'
>;

export default class DependentFeaturesController extends Controller {
    private transactionalDependentFeaturesService: (
        db: UnleashTransaction,
    ) => DependentFeaturesService;

    private dependentFeaturesService: DependentFeaturesService;

    private readonly startTransaction: TransactionCreator<UnleashTransaction>;

    private openApiService: OpenApiService;

    private flagResolver: IFlagResolver;

    private readonly logger: Logger;

    constructor(
        config: IUnleashConfig,
        {
            transactionalDependentFeaturesService,
            dependentFeaturesService,
            openApiService,
        }: DependentFeaturesServices,
        startTransaction: TransactionCreator<UnleashTransaction>,
    ) {
        super(config);
        this.transactionalDependentFeaturesService =
            transactionalDependentFeaturesService;
        this.dependentFeaturesService = dependentFeaturesService;
        this.openApiService = openApiService;
        this.flagResolver = config.flagResolver;
        this.startTransaction = startTransaction;
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
                        200: createResponseSchema('parentFeatureOptionsSchema'),
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
            acceptAnyContentType: true,
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

        this.route({
            method: 'delete',
            path: PATH_DEPENDENCIES,
            handler: this.deleteFeatureDependencies,
            permission: UPDATE_FEATURE,
            acceptAnyContentType: true,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
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
                    tags: ['Features'],
                    summary: 'List parent options.',
                    description:
                        'List available parents who have no transitive dependencies.',
                    operationId: 'listParentOptions',
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
        const { child } = req.params;
        const { variants, enabled, feature } = req.body;

        if (this.config.flagResolver.isEnabled('dependentFeatures')) {
            await this.startTransaction(async (tx) =>
                this.transactionalDependentFeaturesService(
                    tx,
                ).upsertFeatureDependency(child, {
                    variants,
                    enabled,
                    feature,
                }),
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
        const { child, parent } = req.params;

        if (this.config.flagResolver.isEnabled('dependentFeatures')) {
            await this.dependentFeaturesService.deleteFeatureDependency({
                parent,
                child,
            });
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
        const { child } = req.params;

        if (this.config.flagResolver.isEnabled('dependentFeatures')) {
            await this.dependentFeaturesService.deleteFeatureDependencies(
                child,
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
        res: Response,
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
}

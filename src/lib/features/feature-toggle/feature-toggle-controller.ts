import { Request, Response } from 'express';
import { applyPatch, Operation } from 'fast-json-patch';
import Controller from '../../routes/controller';
import {
    CREATE_FEATURE,
    CREATE_FEATURE_STRATEGY,
    DELETE_FEATURE,
    DELETE_FEATURE_STRATEGY,
    IFlagResolver,
    IUnleashConfig,
    IUnleashServices,
    NONE,
    serializeDates,
    UPDATE_FEATURE,
    UPDATE_FEATURE_ENVIRONMENT,
    UPDATE_FEATURE_STRATEGY,
} from '../../types';
import { Logger } from '../../logger';
import { extractUsername } from '../../util';
import { IAuthRequest } from '../../routes/unleash-types';
import {
    AdminFeaturesQuerySchema,
    BulkToggleFeaturesSchema,
    CreateFeatureSchema,
    CreateFeatureStrategySchema,
    createRequestSchema,
    createResponseSchema,
    emptyResponse,
    featureEnvironmentSchema,
    FeatureEnvironmentSchema,
    featureSchema,
    FeatureSchema,
    featuresSchema,
    FeaturesSchema,
    FeatureStrategySchema,
    getStandardResponses,
    ParametersSchema,
    SetStrategySortOrderSchema,
    TagsBulkAddSchema,
    TagSchema,
    UpdateFeatureSchema,
    UpdateFeatureStrategySchema,
} from '../../openapi';
import {
    FeatureTagService,
    FeatureToggleService,
    OpenApiService,
} from '../../services';
import { querySchema } from '../../schema/feature-schema';
import { BatchStaleSchema } from '../../openapi/spec/batch-stale-schema';
import { TransactionCreator, UnleashTransaction } from '../../db/transaction';
import { BadDataError } from '../../error';

interface FeatureStrategyParams {
    projectId: string;
    featureName: string;
    environment: string;
    sortOrder?: number;
}

interface BulkFeaturesStrategyParams {
    projectId: string;
    environment: string;
}

interface FeatureStrategyQuery {
    shouldActivateDisabledStrategies: string;
}

interface FeatureParams extends ProjectParam {
    featureName: string;
}

interface ProjectParam {
    projectId: string;
}

interface StrategyIdParams extends FeatureStrategyParams {
    strategyId: string;
}

export interface IFeatureProjectUserParams extends ProjectParam {
    archived?: boolean;
    userId?: number;

    tag?: string[][];
    namePrefix?: string;
}

const PATH = '/:projectId/features';
const PATH_STALE = '/:projectId/stale';
const PATH_TAGS = `/:projectId/tags`;
const PATH_FEATURE = `${PATH}/:featureName`;
const PATH_FEATURE_CLONE = `${PATH_FEATURE}/clone`;
const PATH_ENV = `${PATH_FEATURE}/environments/:environment`;
const BULK_PATH_ENV = `/:projectId/bulk_features/environments/:environment`;
const PATH_STRATEGIES = `${PATH_ENV}/strategies`;
const PATH_STRATEGY = `${PATH_STRATEGIES}/:strategyId`;

type ProjectFeaturesServices = Pick<
    IUnleashServices,
    | 'featureToggleServiceV2'
    | 'projectHealthService'
    | 'openApiService'
    | 'transactionalFeatureToggleService'
    | 'featureTagService'
>;

export default class ProjectFeaturesController extends Controller {
    private featureService: FeatureToggleService;

    private featureTagService: FeatureTagService;

    private transactionalFeatureToggleService: (
        db: UnleashTransaction,
    ) => FeatureToggleService;

    private openApiService: OpenApiService;

    private flagResolver: IFlagResolver;

    private readonly logger: Logger;

    private readonly startTransaction: TransactionCreator<UnleashTransaction>;

    constructor(
        config: IUnleashConfig,
        {
            featureToggleServiceV2,
            openApiService,
            transactionalFeatureToggleService,
            featureTagService,
        }: ProjectFeaturesServices,
        startTransaction: TransactionCreator<UnleashTransaction>,
    ) {
        super(config);
        this.featureService = featureToggleServiceV2;
        this.transactionalFeatureToggleService =
            transactionalFeatureToggleService;
        this.startTransaction = startTransaction;
        this.openApiService = openApiService;
        this.featureTagService = featureTagService;
        this.flagResolver = config.flagResolver;
        this.logger = config.getLogger('/admin-api/project/features.ts');

        this.route({
            method: 'get',
            path: PATH_ENV,
            permission: NONE,
            handler: this.getFeatureEnvironment,
            middleware: [
                openApiService.validPath({
                    summary: 'Get a feature environment',
                    description:
                        'Information about the enablement status and strategies for a feature toggle in specified environment.',
                    tags: ['Features'],
                    operationId: 'getFeatureEnvironment',
                    responses: {
                        200: createResponseSchema('featureEnvironmentSchema'),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: `${PATH_ENV}/off`,
            acceptAnyContentType: true,
            handler: this.toggleFeatureEnvironmentOff,
            permission: UPDATE_FEATURE_ENVIRONMENT,
            middleware: [
                openApiService.validPath({
                    summary: 'Disable a feature toggle',
                    description:
                        'Disable a feature toggle in the specified environment.',
                    tags: ['Features'],
                    operationId: 'toggleFeatureEnvironmentOff',
                    responses: {
                        200: createResponseSchema('featureSchema'),
                        ...getStandardResponses(400, 401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: `${PATH_ENV}/on`,
            acceptAnyContentType: true,
            handler: this.toggleFeatureEnvironmentOn,
            permission: UPDATE_FEATURE_ENVIRONMENT,
            middleware: [
                openApiService.validPath({
                    summary: 'Enable a feature toggle',
                    description:
                        'Enable a feature toggle in the specified environment.',
                    tags: ['Features'],
                    operationId: 'toggleFeatureEnvironmentOn',
                    responses: {
                        200: createResponseSchema('featureSchema'),
                        ...getStandardResponses(400, 401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: `${BULK_PATH_ENV}/on`,
            handler: this.bulkToggleFeaturesEnvironmentOn,
            permission: UPDATE_FEATURE_ENVIRONMENT,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    summary: 'Bulk enable a list of features',
                    description:
                        'This endpoint enables multiple feature toggles.',
                    operationId: 'bulkToggleFeaturesEnvironmentOn',
                    requestBody: createRequestSchema(
                        'bulkToggleFeaturesSchema',
                    ),
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(400, 401, 403, 404, 413, 415),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: `${BULK_PATH_ENV}/off`,
            handler: this.bulkToggleFeaturesEnvironmentOff,
            permission: UPDATE_FEATURE_ENVIRONMENT,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    summary: 'Bulk disable a list of features',
                    description:
                        'This endpoint disables multiple feature toggles.',
                    operationId: 'bulkToggleFeaturesEnvironmentOff',
                    requestBody: createRequestSchema(
                        'bulkToggleFeaturesSchema',
                    ),
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(400, 401, 403, 404, 413, 415),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: PATH_STRATEGIES,
            handler: this.getFeatureStrategies,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    summary: 'Get feature toggle strategies',
                    operationId: 'getFeatureStrategies',
                    description:
                        'Get strategies defined for a feature toggle in the specified environment.',
                    responses: {
                        200: createResponseSchema('featureStrategySchema'),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: PATH_STRATEGIES,
            handler: this.addFeatureStrategy,
            permission: CREATE_FEATURE_STRATEGY,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    summary: 'Add a strategy to a feature toggle',
                    description:
                        'Add a strategy to a feature toggle in the specified environment.',
                    operationId: 'addFeatureStrategy',
                    requestBody: createRequestSchema(
                        'createFeatureStrategySchema',
                    ),
                    responses: {
                        200: createResponseSchema('featureStrategySchema'),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: PATH_STRATEGY,
            handler: this.getFeatureStrategy,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    summary: 'Get a strategy configuration',
                    description:
                        'Get a strategy configuration for an environment in a feature toggle.',
                    operationId: 'getFeatureStrategy',
                    responses: {
                        200: createResponseSchema('featureStrategySchema'),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: `${PATH_STRATEGIES}/set-sort-order`,
            handler: this.setStrategiesSortOrder,
            permission: UPDATE_FEATURE_STRATEGY,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    operationId: 'setStrategySortOrder',
                    summary: 'Set strategy sort order',
                    description:
                        'Set the sort order of the provided list of strategies.',
                    requestBody: createRequestSchema(
                        'setStrategySortOrderSchema',
                    ),
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(400, 401, 403),
                    },
                }),
            ],
        });

        this.route({
            method: 'put',
            path: PATH_STRATEGY,
            handler: this.updateFeatureStrategy,
            permission: UPDATE_FEATURE_STRATEGY,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    summary: 'Update a strategy',
                    description:
                        'Replace strategy configuration for a feature toggle in the specified environment.',
                    operationId: 'updateFeatureStrategy',
                    requestBody: createRequestSchema(
                        'updateFeatureStrategySchema',
                    ),
                    responses: {
                        200: createResponseSchema('featureStrategySchema'),
                        ...getStandardResponses(400, 401, 403, 404, 415),
                    },
                }),
            ],
        });

        this.route({
            method: 'patch',
            path: PATH_STRATEGY,
            handler: this.patchFeatureStrategy,
            permission: UPDATE_FEATURE_STRATEGY,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    summary: 'Change specific properties of a strategy',
                    description:
                        'Change specific properties of a strategy configuration in a feature toggle.',
                    operationId: 'patchFeatureStrategy',
                    requestBody: createRequestSchema('patchesSchema'),
                    responses: {
                        200: createResponseSchema('featureStrategySchema'),
                        ...getStandardResponses(400, 401, 403, 404, 415),
                    },
                }),
            ],
        });

        this.route({
            method: 'delete',
            path: PATH_STRATEGY,
            acceptAnyContentType: true,
            handler: this.deleteFeatureStrategy,
            permission: DELETE_FEATURE_STRATEGY,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    summary: 'Delete a strategy from a feature toggle',
                    description:
                        'Delete a strategy configuration from a feature toggle in the specified environment.',
                    operationId: 'deleteFeatureStrategy',
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: PATH,
            handler: this.getFeatures,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    summary: 'Get all features in a project',
                    description:
                        'A list of all features for the specified project.',
                    tags: ['Features'],
                    operationId: 'getFeatures',
                    responses: {
                        200: createResponseSchema('featuresSchema'),
                        ...getStandardResponses(400, 401, 403),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: PATH,
            handler: this.createFeature,
            permission: CREATE_FEATURE,
            middleware: [
                openApiService.validPath({
                    summary: 'Add a new feature toggle',
                    description:
                        'Create a new feature toggle in a specified project.',
                    tags: ['Features'],
                    operationId: 'createFeature',
                    requestBody: createRequestSchema('createFeatureSchema'),
                    responses: {
                        200: createResponseSchema('featureSchema'),
                        ...getStandardResponses(401, 403, 404, 415),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: PATH_FEATURE_CLONE,
            acceptAnyContentType: true,
            handler: this.cloneFeature,
            permission: CREATE_FEATURE,
            middleware: [
                openApiService.validPath({
                    summary: 'Clone a feature toggle',
                    description:
                        'Creates a copy of the specified feature toggle. The copy can be created in any project.',
                    tags: ['Features'],
                    operationId: 'cloneFeature',
                    requestBody: createRequestSchema('cloneFeatureSchema'),
                    responses: {
                        200: createResponseSchema('featureSchema'),
                        ...getStandardResponses(401, 403, 404, 415),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: PATH_FEATURE,
            handler: this.getFeature,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    operationId: 'getFeature',
                    tags: ['Features'],
                    summary: 'Get a feature',
                    description:
                        'This endpoint returns the information about the requested feature if the feature belongs to the specified project.',
                    responses: {
                        200: createResponseSchema('featureSchema'),
                        403: {
                            description:
                                'You either do not have the required permissions or used an invalid URL.',
                        },
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'put',
            path: PATH_FEATURE,
            handler: this.updateFeature,
            permission: UPDATE_FEATURE,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    operationId: 'updateFeature',
                    summary: 'Update a feature toggle',
                    description:
                        'Updates the specified feature if the feature belongs to the specified project. Only the provided properties are updated; any feature properties left out of the request body are left untouched.',
                    requestBody: createRequestSchema('updateFeatureSchema'),
                    responses: {
                        200: createResponseSchema('featureSchema'),
                        ...getStandardResponses(401, 403, 404, 415),
                    },
                }),
            ],
        });

        this.route({
            method: 'patch',
            path: PATH_FEATURE,
            handler: this.patchFeature,
            permission: UPDATE_FEATURE,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    operationId: 'patchFeature',
                    summary: 'Modify a feature toggle',
                    description:
                        'Change specific properties of a feature toggle.',
                    requestBody: createRequestSchema('patchesSchema'),
                    responses: {
                        200: createResponseSchema('featureSchema'),
                        ...getStandardResponses(401, 403, 404, 415),
                    },
                }),
            ],
        });

        this.route({
            method: 'delete',
            path: PATH_FEATURE,
            acceptAnyContentType: true,
            handler: this.archiveFeature,
            permission: DELETE_FEATURE,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    operationId: 'archiveFeature',
                    summary: 'Archive a feature toggle',
                    description:
                        'This endpoint archives the specified feature if the feature belongs to the specified project.',
                    responses: {
                        202: emptyResponse,
                        403: {
                            description:
                                'You either do not have the required permissions or used an invalid URL.',
                        },
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: PATH_STALE,
            handler: this.staleFeatures,
            permission: UPDATE_FEATURE,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    operationId: 'staleFeatures',
                    summary: 'Mark features as stale / not stale',
                    description: `This endpoint marks the provided list of features as either [stale](https://docs.getunleash.io/reference/technical-debt#stale-and-potentially-stale-toggles) or not stale depending on the request body you send. Any provided features that don't exist are ignored.`,
                    requestBody: createRequestSchema('batchStaleSchema'),
                    responses: {
                        202: emptyResponse,
                        ...getStandardResponses(401, 403, 415),
                    },
                }),
            ],
        });

        this.route({
            method: 'put',
            path: PATH_TAGS,
            handler: this.updateFeaturesTags,
            permission: UPDATE_FEATURE,
            middleware: [
                openApiService.validPath({
                    tags: ['Tags'],
                    operationId: 'addTagToFeatures',
                    summary: 'Adds a tag to the specified features',
                    description:
                        'Add a tag to a list of features. Create tags if needed.',
                    requestBody: createRequestSchema('tagsBulkAddSchema'),
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(401, 403, 404, 415),
                    },
                }),
            ],
        });
    }

    async getFeatures(
        req: IAuthRequest<ProjectParam, any, any, AdminFeaturesQuerySchema>,
        res: Response<FeaturesSchema>,
    ): Promise<void> {
        const { projectId } = req.params;
        const query = await this.prepQuery(req.query, projectId);
        const features = await this.featureService.getFeatureOverview({
            ...query,
            userId: req.user.id,
        });
        this.openApiService.respondWithValidation(
            200,
            res,
            featuresSchema.$id,
            { version: 2, features: serializeDates(features) },
        );
    }

    async prepQuery(
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        { tag, namePrefix }: AdminFeaturesQuerySchema,
        projectId: string,
    ): Promise<IFeatureProjectUserParams> {
        if (!tag && !namePrefix) {
            return { projectId };
        }
        const tagQuery = this.paramToArray(tag);
        const query = await querySchema.validateAsync({
            tag: tagQuery,
            namePrefix,
        });
        if (query.tag) {
            query.tag = query.tag.map((q) => q.split(':'));
        }
        return { projectId, ...query };
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    paramToArray(param: any): Array<any> {
        if (!param) {
            return param;
        }
        return Array.isArray(param) ? param : [param];
    }

    async cloneFeature(
        req: IAuthRequest<
            FeatureParams,
            any,
            { name: string; replaceGroupId?: boolean }
        >,
        res: Response<FeatureSchema>,
    ): Promise<void> {
        const { projectId, featureName } = req.params;
        const { name, replaceGroupId } = req.body;
        const userName = extractUsername(req);
        const created = await this.featureService.cloneFeatureToggle(
            featureName,
            projectId,
            name,
            userName,
            req.user.id,
            replaceGroupId,
        );

        this.openApiService.respondWithValidation(
            201,
            res,
            featureSchema.$id,
            serializeDates(created),
        );
    }

    async createFeature(
        req: IAuthRequest<FeatureParams, FeatureSchema, CreateFeatureSchema>,
        res: Response<FeatureSchema>,
    ): Promise<void> {
        const { projectId } = req.params;

        const userName = extractUsername(req);
        const created = await this.featureService.createFeatureToggle(
            projectId,
            {
                ...req.body,
                description: req.body.description || undefined,
            },
            userName,
            req.user.id,
        );

        this.openApiService.respondWithValidation(
            201,
            res,
            featureSchema.$id,
            serializeDates(created),
        );
    }

    async getFeature(
        req: IAuthRequest<FeatureParams, any, any, any>,
        res: Response,
    ): Promise<void> {
        const { featureName, projectId } = req.params;
        const { variantEnvironments } = req.query;
        const { user } = req;
        const feature = await this.featureService.getFeature({
            featureName,
            archived: false,
            projectId,
            environmentVariants: variantEnvironments === 'true',
            userId: user.id,
        });
        res.status(200).json(feature);
    }

    async updateFeature(
        req: IAuthRequest<
            { projectId: string; featureName: string },
            any,
            UpdateFeatureSchema
        >,
        res: Response<FeatureSchema>,
    ): Promise<void> {
        const { projectId, featureName } = req.params;
        const { createdAt, ...data } = req.body;
        const userName = extractUsername(req);
        if (data.name && data.name !== featureName) {
            throw new BadDataError('Cannot change name of feature toggle');
        }
        const created = await this.featureService.updateFeatureToggle(
            projectId,
            {
                ...data,
                name: featureName,
            },
            userName,
            featureName,
            req.user.id,
        );

        this.openApiService.respondWithValidation(
            200,
            res,
            featureSchema.$id,
            serializeDates(created),
        );
    }

    async patchFeature(
        req: IAuthRequest<
            { projectId: string; featureName: string },
            any,
            Operation[],
            any
        >,
        res: Response<FeatureSchema>,
    ): Promise<void> {
        const { projectId, featureName } = req.params;
        const updated = await this.featureService.patchFeature(
            projectId,
            featureName,
            extractUsername(req),
            req.body,
            req.user.id,
        );
        this.openApiService.respondWithValidation(
            200,
            res,
            featureSchema.$id,
            serializeDates(updated),
        );
    }

    async archiveFeature(
        req: IAuthRequest<
            { projectId: string; featureName: string },
            any,
            any,
            any
        >,
        res: Response<void>,
    ): Promise<void> {
        const { featureName, projectId } = req.params;
        await this.startTransaction(async (tx) =>
            this.transactionalFeatureToggleService(tx).archiveToggle(
                featureName,
                req.user,
                projectId,
            ),
        );
        res.status(202).send();
    }

    async staleFeatures(
        req: IAuthRequest<{ projectId: string }, void, BatchStaleSchema>,
        res: Response,
    ): Promise<void> {
        const { features, stale } = req.body;
        const { projectId } = req.params;
        const userName = extractUsername(req);

        await this.featureService.setToggleStaleness(
            features,
            stale,
            userName,
            projectId,
            req.user.id,
        );
        res.status(202).end();
    }

    async getFeatureEnvironment(
        req: Request<FeatureStrategyParams, any, any, any>,
        res: Response<FeatureEnvironmentSchema>,
    ): Promise<void> {
        const { environment, featureName, projectId } = req.params;
        const { defaultStrategy, ...environmentInfo } =
            await this.featureService.getEnvironmentInfo(
                projectId,
                environment,
                featureName,
            );

        const result = {
            ...environmentInfo,
            strategies: environmentInfo.strategies.map((strategy) => {
                const {
                    strategyName,
                    projectId: project,
                    environment: environmentId,
                    createdAt,
                    ...rest
                } = strategy;
                return { ...rest, name: strategyName };
            }),
        };

        this.openApiService.respondWithValidation(
            200,
            res,
            featureEnvironmentSchema.$id,
            serializeDates(result),
        );
    }

    async toggleFeatureEnvironmentOn(
        req: IAuthRequest<
            FeatureStrategyParams,
            any,
            any,
            FeatureStrategyQuery
        >,
        res: Response<void>,
    ): Promise<void> {
        const { featureName, environment, projectId } = req.params;
        const { shouldActivateDisabledStrategies } = req.query;
        await this.featureService.updateEnabled(
            projectId,
            featureName,
            environment,
            true,
            extractUsername(req),
            req.user,
            shouldActivateDisabledStrategies === 'true',
        );
        res.status(200).end();
    }

    async bulkToggleFeaturesEnvironmentOn(
        req: IAuthRequest<
            BulkFeaturesStrategyParams,
            any,
            BulkToggleFeaturesSchema,
            FeatureStrategyQuery
        >,
        res: Response<void>,
    ): Promise<void> {
        const { environment, projectId } = req.params;
        const { shouldActivateDisabledStrategies } = req.query;
        const { features } = req.body;

        if (this.flagResolver.isEnabled('disableBulkToggle')) {
            res.status(403).end();
            return;
        }

        await this.startTransaction(async (tx) =>
            this.transactionalFeatureToggleService(tx).bulkUpdateEnabled(
                projectId,
                features,
                environment,
                true,
                extractUsername(req),
                req.user,
                shouldActivateDisabledStrategies === 'true',
            ),
        );
        res.status(200).end();
    }

    async bulkToggleFeaturesEnvironmentOff(
        req: IAuthRequest<
            BulkFeaturesStrategyParams,
            any,
            BulkToggleFeaturesSchema,
            FeatureStrategyQuery
        >,
        res: Response<void>,
    ): Promise<void> {
        const { environment, projectId } = req.params;
        const { shouldActivateDisabledStrategies } = req.query;
        const { features } = req.body;

        if (this.flagResolver.isEnabled('disableBulkToggle')) {
            res.status(403).end();
            return;
        }

        await this.startTransaction(async (tx) =>
            this.transactionalFeatureToggleService(tx).bulkUpdateEnabled(
                projectId,
                features,
                environment,
                false,
                extractUsername(req),
                req.user,
                shouldActivateDisabledStrategies === 'true',
            ),
        );
        res.status(200).end();
    }

    async toggleFeatureEnvironmentOff(
        req: IAuthRequest<FeatureStrategyParams, any, any, any>,
        res: Response<void>,
    ): Promise<void> {
        const { featureName, environment, projectId } = req.params;
        await this.featureService.updateEnabled(
            projectId,
            featureName,
            environment,
            false,
            extractUsername(req),
            req.user,
        );
        res.status(200).end();
    }

    async addFeatureStrategy(
        req: IAuthRequest<
            FeatureStrategyParams,
            any,
            CreateFeatureStrategySchema
        >,
        res: Response<FeatureStrategySchema>,
    ): Promise<void> {
        const { projectId, featureName, environment } = req.params;
        const { ...strategyConfig } = req.body;

        if (!strategyConfig.segmentIds) {
            strategyConfig.segmentIds = [];
        }

        const userName = extractUsername(req);
        const strategy = await this.featureService.createStrategy(
            strategyConfig,
            { environment, projectId, featureName },
            userName,
            req.user,
        );

        const updatedStrategy = await this.featureService.getStrategy(
            strategy.id,
        );
        res.status(200).json(updatedStrategy);
    }

    async getFeatureStrategies(
        req: Request<FeatureStrategyParams, any, any, any>,
        res: Response<FeatureStrategySchema[]>,
    ): Promise<void> {
        const { projectId, featureName, environment } = req.params;
        const featureStrategies =
            await this.featureService.getStrategiesForEnvironment(
                projectId,
                featureName,
                environment,
            );
        res.status(200).json(featureStrategies);
    }

    async setStrategiesSortOrder(
        req: IAuthRequest<
            FeatureStrategyParams,
            any,
            SetStrategySortOrderSchema,
            any
        >,
        res: Response,
    ): Promise<void> {
        const { featureName, projectId, environment } = req.params;
        const createdBy = extractUsername(req);
        await this.startTransaction(async (tx) =>
            this.transactionalFeatureToggleService(
                tx,
            ).updateStrategiesSortOrder(
                {
                    featureName,
                    environment,
                    projectId,
                },
                req.body,
                createdBy,
            ),
        );

        res.status(200).send();
    }

    async updateFeatureStrategy(
        req: IAuthRequest<StrategyIdParams, any, UpdateFeatureStrategySchema>,
        res: Response<FeatureStrategySchema>,
    ): Promise<void> {
        const { strategyId, environment, projectId, featureName } = req.params;
        const userName = extractUsername(req);

        if (!req.body.segmentIds) {
            req.body.segmentIds = [];
        }

        const updatedStrategy = await this.startTransaction(async (tx) =>
            this.transactionalFeatureToggleService(tx).updateStrategy(
                strategyId,
                req.body,
                { environment, projectId, featureName },
                userName,
                req.user,
            ),
        );

        res.status(200).json(updatedStrategy);
    }

    async patchFeatureStrategy(
        req: IAuthRequest<StrategyIdParams, any, Operation[], any>,
        res: Response<FeatureStrategySchema>,
    ): Promise<void> {
        const { strategyId, projectId, environment, featureName } = req.params;
        const userName = extractUsername(req);
        const patch = req.body;
        const strategy = await this.featureService.getStrategy(strategyId);

        const { newDocument } = applyPatch(strategy, patch);
        const updatedStrategy = await this.startTransaction(async (tx) =>
            this.transactionalFeatureToggleService(tx).updateStrategy(
                strategyId,
                newDocument,
                { environment, projectId, featureName },
                userName,
                req.user,
            ),
        );

        res.status(200).json(updatedStrategy);
    }

    async getFeatureStrategy(
        req: IAuthRequest<StrategyIdParams, any, any, any>,
        res: Response<FeatureStrategySchema>,
    ): Promise<void> {
        this.logger.info('Getting strategy');
        const { strategyId } = req.params;
        this.logger.info(strategyId);
        const strategy = await this.featureService.getStrategy(strategyId);
        res.status(200).json(strategy);
    }

    async deleteFeatureStrategy(
        req: IAuthRequest<StrategyIdParams, any, any, any>,
        res: Response<void>,
    ): Promise<void> {
        this.logger.info('Deleting strategy');
        const { environment, projectId, featureName } = req.params;
        const userName = extractUsername(req);
        const { strategyId } = req.params;
        this.logger.info(strategyId);
        const strategy = await this.featureService.deleteStrategy(
            strategyId,
            { environment, projectId, featureName },
            userName,
            req.user,
        );
        res.status(200).json(strategy);
    }

    async updateStrategyParameter(
        req: IAuthRequest<
            StrategyIdParams,
            any,
            { name: string; value: string | number },
            any
        >,
        res: Response<FeatureStrategySchema>,
    ): Promise<void> {
        const { strategyId, environment, projectId, featureName } = req.params;
        const userName = extractUsername(req);
        const { name, value } = req.body;

        const updatedStrategy =
            await this.featureService.updateStrategyParameter(
                strategyId,
                name,
                value,
                { environment, projectId, featureName },
                userName,
                req.user.id,
            );
        res.status(200).json(updatedStrategy);
    }

    async updateFeaturesTags(
        req: IAuthRequest<void, void, TagsBulkAddSchema>,
        res: Response<TagSchema>,
    ): Promise<void> {
        const { features, tags } = req.body;
        const userName = extractUsername(req);
        await this.featureTagService.updateTags(
            features,
            tags.addedTags,
            tags.removedTags,
            userName,
            req.user.id,
        );
        res.status(200).end();
    }

    async getStrategyParameters(
        req: Request<StrategyIdParams, any, any, any>,
        res: Response<ParametersSchema>,
    ): Promise<void> {
        this.logger.info('Getting strategy parameters');
        const { strategyId } = req.params;
        const strategy = await this.featureService.getStrategy(strategyId);
        res.status(200).json(strategy.parameters);
    }
}

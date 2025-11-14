import type { Request, Response } from 'express';
import type { Operation } from 'fast-json-patch';
import fastJsonPatch from 'fast-json-patch';
const { applyPatch } = fastJsonPatch;
import Controller from '../../routes/controller.js';
import {
    CREATE_FEATURE,
    CREATE_FEATURE_STRATEGY,
    DELETE_FEATURE,
    DELETE_FEATURE_STRATEGY,
    type FeatureToggleView,
    type IFlagResolver,
    type IUnleashConfig,
    NONE,
    serializeDates,
    UPDATE_FEATURE,
    UPDATE_FEATURE_ENVIRONMENT,
    UPDATE_FEATURE_STRATEGY,
} from '../../types/index.js';
import type { Logger } from '../../logger.js';
import type { IAuthRequest } from '../../routes/unleash-types.js';
import {
    type AdminFeaturesQuerySchema,
    type BulkToggleFeaturesSchema,
    type CreateFeatureSchema,
    type CreateFeatureStrategySchema,
    createRequestSchema,
    createResponseSchema,
    emptyResponse,
    featureEnvironmentSchema,
    type FeatureEnvironmentSchema,
    featureSchema,
    type FeatureSchema,
    featureStrategySchema,
    type FeatureStrategySchema,
    getStandardResponses,
    projectFeaturesSchema,
    type ProjectFeaturesSchema,
    type SetStrategySortOrderSchema,
    type TagsBulkAddSchema,
    type TagSchema,
    type UpdateFeatureSchema,
    type UpdateFeatureStrategySchema,
} from '../../openapi/index.js';
import type {
    FeatureTagService,
    FeatureToggleService,
    OpenApiService,
    IUnleashServices,
} from '../../services/index.js';
import { querySchema } from '../../schema/feature-schema.js';
import type { BatchStaleSchema } from '../../openapi/spec/batch-stale-schema.js';
import type { WithTransactional } from '../../db/transaction.js';
import { BadDataError } from '../../error/index.js';
import { anonymise } from '../../util/index.js';
import { throwOnInvalidSchema } from '../../openapi/validate.js';

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
    | 'featureToggleService'
    | 'projectHealthService'
    | 'openApiService'
    | 'transactionalFeatureToggleService'
    | 'featureTagService'
>;

export default class ProjectFeaturesController extends Controller {
    private featureService: FeatureToggleService;

    private featureTagService: FeatureTagService;

    private transactionalFeatureToggleService: WithTransactional<FeatureToggleService>;

    private openApiService: OpenApiService;

    private flagResolver: IFlagResolver;

    private readonly logger: Logger;

    constructor(
        config: IUnleashConfig,
        {
            featureToggleService,
            openApiService,
            transactionalFeatureToggleService,
            featureTagService,
        }: ProjectFeaturesServices,
    ) {
        super(config);
        this.featureService = featureToggleService;
        this.transactionalFeatureToggleService =
            transactionalFeatureToggleService;
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
                        'Information about the enablement status and strategies for a feature flag in specified environment.',
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
                    summary: 'Disable a feature flag',
                    description:
                        'Disable a feature flag in the specified environment.',
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
                    summary: 'Enable a feature flag',
                    description:
                        'Enable a feature flag in the specified environment.',
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
                        'This endpoint enables multiple feature flags.',
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
                        'This endpoint disables multiple feature flags.',
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
                    summary: 'Get feature flag strategies',
                    operationId: 'getFeatureStrategies',
                    description:
                        'Get strategies defined for a feature flag in the specified environment.',
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
                    summary: 'Add a strategy to a feature flag',
                    description:
                        'Add a strategy to a feature flag in the specified environment.',
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
                        'Get a strategy configuration for an environment in a feature flag.',
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
                        'Replace strategy configuration for a feature flag in the specified environment.',
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
                        'Change specific properties of a strategy configuration in a feature flag.',
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
                    summary: 'Delete a strategy from a feature flag',
                    description:
                        'Delete a strategy configuration from a feature flag in the specified environment.',
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
                        200: createResponseSchema('projectFeaturesSchema'),
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
                    summary: 'Add a new feature flag',
                    description:
                        'Create a new feature flag in a specified project.',
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
                    summary: 'Clone a feature flag',
                    description:
                        'Creates a copy of the specified feature flag. The copy can be created in any project.',
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
                    summary: 'Update a feature flag',
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
                    summary: 'Modify a feature flag',
                    description:
                        'Change specific properties of a feature flag.',
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
                    summary: 'Archive a feature flag',
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
                    description: `This endpoint marks the provided list of features as either [stale](https://docs.getunleash.io/reference/technical-debt#stale-and-potentially-stale-flags) or not stale depending on the request body you send. Any provided features that don't exist are ignored.`,
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
        res: Response<ProjectFeaturesSchema>,
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
            projectFeaturesSchema.$id,
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
        const created =
            await this.transactionalFeatureToggleService.transactional(
                (service) =>
                    service.cloneFeatureToggle(
                        featureName,
                        projectId,
                        name,
                        req.audit,
                        replaceGroupId,
                    ),
            );

        this.openApiService.respondWithValidation(
            201,
            res,
            featureSchema.$id,
            serializeDates({ ...created, stale: created.stale || false }),
        );
    }

    async createFeature(
        req: IAuthRequest<FeatureParams, FeatureSchema, CreateFeatureSchema>,
        res: Response<FeatureSchema>,
    ): Promise<void> {
        const { projectId } = req.params;

        const created =
            await this.transactionalFeatureToggleService.transactional(
                (service) =>
                    service.createFeatureToggle(
                        projectId,
                        {
                            ...req.body,
                            description: req.body.description || undefined,
                        },
                        req.audit,
                    ),
            );

        this.openApiService.respondWithValidation(
            201,
            res,
            featureSchema.$id,
            serializeDates({ ...created, stale: created.stale || false }),
        );
    }

    maybeAnonymise(feature: FeatureToggleView): FeatureToggleView {
        if (
            this.flagResolver.isEnabled('anonymiseEventLog') &&
            feature.createdBy
        ) {
            return {
                ...feature,
                ...(feature.collaborators
                    ? {
                          collaborators: {
                              ...feature.collaborators,
                              users: feature.collaborators.users.map(
                                  (user) => ({
                                      ...user,
                                      name: anonymise(user.name),
                                  }),
                              ),
                          },
                      }
                    : {}),
                createdBy: {
                    ...feature.createdBy,
                    name: anonymise(feature.createdBy?.name),
                },
            };
        }
        return feature;
    }

    async getFeature(
        req: IAuthRequest<FeatureParams, any, any, any>,
        res: Response<FeatureSchema>,
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
        const maybeAnonymized = this.maybeAnonymise(feature);
        const responseData = {
            ...maybeAnonymized,
            stale: maybeAnonymized.stale || false,
        };
        this.openApiService.respondWithValidation(
            200,
            res,
            featureSchema.$id,
            serializeDates(responseData),
        );
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
        if (data.name && data.name !== featureName) {
            throw new BadDataError('Cannot change name of feature flag');
        }
        const created =
            await this.transactionalFeatureToggleService.transactional(
                (service) =>
                    service.updateFeatureToggle(
                        projectId,
                        {
                            ...data,
                            name: featureName,
                        },
                        featureName,
                        req.audit,
                    ),
            );

        this.openApiService.respondWithValidation(
            200,
            res,
            featureSchema.$id,
            serializeDates({ ...created, stale: created.stale || false }),
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
        const updated =
            await this.transactionalFeatureToggleService.transactional(
                (service) =>
                    service.patchFeature(
                        projectId,
                        featureName,
                        req.body,
                        req.audit,
                    ),
            );
        this.openApiService.respondWithValidation(
            200,
            res,
            featureSchema.$id,
            serializeDates({ ...updated, stale: updated.stale || false }),
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
        await this.transactionalFeatureToggleService.transactional((service) =>
            service.archiveToggle(featureName, req.user, req.audit, projectId),
        );
        res.status(202).send();
    }

    async staleFeatures(
        req: IAuthRequest<{ projectId: string }, void, BatchStaleSchema>,
        res: Response,
    ): Promise<void> {
        const { features, stale } = req.body;
        const { projectId } = req.params;

        await this.featureService.setToggleStaleness(
            features,
            stale,
            projectId,
            req.audit,
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
                    milestoneId,
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
        await this.transactionalFeatureToggleService.transactional((service) =>
            service.updateEnabled(
                projectId,
                featureName,
                environment,
                true,
                req.audit,
                req.user,
                shouldActivateDisabledStrategies === 'true',
            ),
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

        await this.transactionalFeatureToggleService.transactional((service) =>
            service.bulkUpdateEnabled(
                projectId,
                features,
                environment,
                true,
                req.audit,
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

        await this.transactionalFeatureToggleService.transactional((service) =>
            service.bulkUpdateEnabled(
                projectId,
                features,
                environment,
                false,
                req.audit,
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
        await this.transactionalFeatureToggleService.transactional((service) =>
            service.updateEnabled(
                projectId,
                featureName,
                environment,
                false,
                req.audit,
                req.user,
            ),
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

        const strategy =
            await this.transactionalFeatureToggleService.transactional(
                (service) =>
                    service.createStrategy(
                        strategyConfig,
                        { environment, projectId, featureName },
                        req.audit,
                        req.user,
                    ),
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
        await this.transactionalFeatureToggleService.transactional((service) =>
            service.updateStrategiesSortOrder(
                {
                    featureName,
                    environment,
                    projectId,
                },
                req.body,
                req.audit,
            ),
        );

        res.status(200).send();
    }

    async updateFeatureStrategy(
        req: IAuthRequest<StrategyIdParams, any, UpdateFeatureStrategySchema>,
        res: Response<FeatureStrategySchema>,
    ): Promise<void> {
        const { strategyId, environment, projectId, featureName } = req.params;

        if (!req.body.segmentIds) {
            req.body.segmentIds = [];
        }

        const updatedStrategy =
            await this.transactionalFeatureToggleService.transactional(
                (service) =>
                    service.updateStrategy(
                        strategyId,
                        req.body,
                        { environment, projectId, featureName },
                        req.audit,
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
        const patch = req.body;
        const strategy = await this.featureService.getStrategy(strategyId);

        const { newDocument } = applyPatch(strategy, patch);

        throwOnInvalidSchema(featureStrategySchema.$id, newDocument);

        const updatedStrategy =
            await this.transactionalFeatureToggleService.transactional(
                (service) =>
                    service.updateStrategy(
                        strategyId,
                        newDocument,
                        { environment, projectId, featureName },
                        req.audit,
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
        const { strategyId } = req.params;
        this.logger.info(strategyId);
        const strategy =
            await this.transactionalFeatureToggleService.transactional(
                (service) =>
                    service.deleteStrategy(
                        strategyId,
                        { environment, projectId, featureName },
                        req.audit,
                        req.user,
                    ),
            );
        res.status(200).json(strategy);
    }

    async updateFeaturesTags(
        req: IAuthRequest<void, void, TagsBulkAddSchema>,
        res: Response<TagSchema>,
    ): Promise<void> {
        const { features, tags } = req.body;
        await this.featureTagService.updateTags(
            features,
            tags.addedTags,
            tags.removedTags,
            req.audit,
        );
        res.status(200).end();
    }
}

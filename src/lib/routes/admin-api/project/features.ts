import { Request, Response } from 'express';
import { applyPatch, Operation } from 'fast-json-patch';
import Controller from '../../controller';
import { IUnleashConfig } from '../../../types/option';
import { IUnleashServices } from '../../../types';
import FeatureToggleService from '../../../services/feature-toggle-service';
import { Logger } from '../../../logger';
import {
    CREATE_FEATURE,
    CREATE_FEATURE_STRATEGY,
    DELETE_FEATURE,
    DELETE_FEATURE_STRATEGY,
    NONE,
    UPDATE_FEATURE,
    UPDATE_FEATURE_ENVIRONMENT,
    UPDATE_FEATURE_STRATEGY,
} from '../../../types/permissions';
import { extractUsername } from '../../../util/extract-user';
import { IAuthRequest } from '../../unleash-types';
import { CreateFeatureSchema } from '../../../openapi/spec/create-feature-schema';
import {
    featureSchema,
    FeatureSchema,
} from '../../../openapi/spec/feature-schema';
import { StrategySchema } from '../../../openapi/spec/strategy-schema';
import { ParametersSchema } from '../../../openapi/spec/parameters-schema';
import {
    featuresSchema,
    FeaturesSchema,
} from '../../../openapi/spec/features-schema';
import { UpdateFeatureSchema } from '../../../openapi/spec/update-feature-schema';
import { UpdateStrategySchema } from '../../../openapi/spec/update-strategy-schema';
import { CreateStrategySchema } from '../../../openapi/spec/create-strategy-schema';
import { serializeDates } from '../../../types/serialize-dates';
import { OpenApiService } from '../../../services/openapi-service';
import { createRequestSchema, createResponseSchema } from '../../../openapi';
import { FeatureEnvironmentSchema } from '../../../openapi/spec/feature-environment-schema';
import { emptyResponse } from '../../../openapi/spec/empty-response';

interface FeatureStrategyParams {
    projectId: string;
    featureName: string;
    environment: string;
    sortOrder?: number;
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

const PATH = '/:projectId/features';
const PATH_FEATURE = `${PATH}/:featureName`;
const PATH_FEATURE_CLONE = `${PATH_FEATURE}/clone`;
const PATH_ENV = `${PATH_FEATURE}/environments/:environment`;
const PATH_STRATEGIES = `${PATH_ENV}/strategies`;
const PATH_STRATEGY = `${PATH_STRATEGIES}/:strategyId`;

type ProjectFeaturesServices = Pick<
    IUnleashServices,
    'featureToggleServiceV2' | 'projectHealthService' | 'openApiService'
>;

export default class ProjectFeaturesController extends Controller {
    private featureService: FeatureToggleService;

    private openApiService: OpenApiService;

    private readonly logger: Logger;

    constructor(
        config: IUnleashConfig,
        { featureToggleServiceV2, openApiService }: ProjectFeaturesServices,
    ) {
        super(config);
        this.featureService = featureToggleServiceV2;
        this.openApiService = openApiService;
        this.logger = config.getLogger('/admin-api/project/features.ts');

        this.route({
            method: 'get',
            path: PATH_ENV,
            permission: NONE,
            handler: this.getFeatureEnvironment,
            middleware: [
                openApiService.validPath({
                    tags: ['admin'],
                    operationId: 'getFeatureEnvironment',
                    responses: {
                        200: createResponseSchema('featureEnvironmentSchema'),
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
                    tags: ['admin'],
                    operationId: 'toggleFeatureEnvironmentOff',
                    responses: { 200: createResponseSchema('featureSchema') },
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
                    tags: ['admin'],
                    operationId: 'toggleFeatureEnvironmentOn',
                    responses: { 200: createResponseSchema('featureSchema') },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: PATH_STRATEGIES,
            handler: this.getStrategies,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['admin'],
                    operationId: 'getStrategies',
                    responses: { 200: createResponseSchema('strategySchema') },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: PATH_STRATEGIES,
            handler: this.addStrategy,
            permission: CREATE_FEATURE_STRATEGY,
            middleware: [
                openApiService.validPath({
                    tags: ['admin'],
                    operationId: 'addStrategy',
                    requestBody: createRequestSchema('createStrategySchema'),
                    responses: {
                        200: createResponseSchema('featureStrategySchema'),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: PATH_STRATEGY,
            handler: this.getStrategy,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['admin'],
                    operationId: 'getStrategy',
                    responses: {
                        200: createResponseSchema('featureStrategySchema'),
                    },
                }),
            ],
        });

        this.route({
            method: 'put',
            path: PATH_STRATEGY,
            handler: this.updateStrategy,
            permission: UPDATE_FEATURE_STRATEGY,
            middleware: [
                openApiService.validPath({
                    tags: ['admin'],
                    operationId: 'updateStrategy',
                    requestBody: createRequestSchema('updateStrategySchema'),
                    responses: {
                        200: createResponseSchema('featureStrategySchema'),
                    },
                }),
            ],
        });
        this.route({
            method: 'patch',
            path: PATH_STRATEGY,
            handler: this.patchStrategy,
            permission: UPDATE_FEATURE_STRATEGY,
            middleware: [
                openApiService.validPath({
                    tags: ['admin'],
                    operationId: 'patchStrategy',
                    requestBody: createRequestSchema('patchesSchema'),
                    responses: {
                        200: createResponseSchema('featureStrategySchema'),
                    },
                }),
            ],
        });
        this.route({
            method: 'delete',
            path: PATH_STRATEGY,
            acceptAnyContentType: true,
            handler: this.deleteStrategy,
            permission: DELETE_FEATURE_STRATEGY,
            middleware: [
                openApiService.validPath({
                    operationId: 'deleteStrategy',
                    tags: ['admin'],
                    responses: { 200: emptyResponse },
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
                    tags: ['admin'],
                    operationId: 'getFeatures',
                    responses: { 200: createResponseSchema('featuresSchema') },
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
                    tags: ['admin'],
                    operationId: 'createFeature',
                    requestBody: createRequestSchema('createFeatureSchema'),
                    responses: { 200: createResponseSchema('featureSchema') },
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
                    tags: ['admin'],
                    operationId: 'cloneFeature',
                    requestBody: createRequestSchema('cloneFeatureSchema'),
                    responses: { 200: createResponseSchema('featureSchema') },
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
                    tags: ['admin'],
                    responses: { 200: createResponseSchema('featureSchema') },
                }),
            ],
        });

        this.route({
            method: 'put',
            path: PATH_FEATURE,
            acceptAnyContentType: true,
            handler: this.updateFeature,
            permission: UPDATE_FEATURE,
            middleware: [
                openApiService.validPath({
                    tags: ['admin'],
                    operationId: 'updateFeature',
                    requestBody: createRequestSchema('updateFeatureSchema'),
                    responses: { 200: createResponseSchema('featureSchema') },
                }),
            ],
        });

        this.route({
            method: 'patch',
            path: PATH_FEATURE,
            acceptAnyContentType: true,
            handler: this.patchFeature,
            permission: UPDATE_FEATURE,
            middleware: [
                openApiService.validPath({
                    tags: ['admin'],
                    operationId: 'patchFeature',
                    requestBody: createRequestSchema('patchesSchema'),
                    responses: { 200: createResponseSchema('featureSchema') },
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
                    tags: ['admin'],
                    operationId: 'archiveFeature',
                    responses: { 200: emptyResponse },
                }),
            ],
        });
    }

    async getFeatures(
        req: Request<ProjectParam, any, any, any>,
        res: Response<FeaturesSchema>,
    ): Promise<void> {
        const { projectId } = req.params;
        const features = await this.featureService.getFeatureOverview(
            projectId,
        );
        this.openApiService.respondWithValidation(
            200,
            res,
            featuresSchema.$id,
            { version: 2, features: serializeDates(features) },
        );
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
            replaceGroupId,
            userName,
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
            req.body,
            userName,
        );

        this.openApiService.respondWithValidation(
            201,
            res,
            featureSchema.$id,
            serializeDates(created),
        );
    }

    async getFeature(
        req: Request<FeatureParams, any, any, any>,
        res: Response,
    ): Promise<void> {
        const { featureName } = req.params;
        const feature = await this.featureService.getFeature(featureName);
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
        const created = await this.featureService.updateFeatureToggle(
            projectId,
            data,
            userName,
            featureName,
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
        );
        this.openApiService.respondWithValidation(
            200,
            res,
            featureSchema.$id,
            serializeDates(updated),
        );
    }

    // TODO: validate projectId
    async archiveFeature(
        req: IAuthRequest<
            { projectId: string; featureName: string },
            any,
            any,
            any
        >,
        res: Response<void>,
    ): Promise<void> {
        const { featureName } = req.params;
        const userName = extractUsername(req);
        await this.featureService.archiveToggle(featureName, userName);
        res.status(202).send();
    }

    async getFeatureEnvironment(
        req: Request<FeatureStrategyParams, any, any, any>,
        res: Response<FeatureEnvironmentSchema>,
    ): Promise<void> {
        const { environment, featureName, projectId } = req.params;
        const environmentInfo = await this.featureService.getEnvironmentInfo(
            projectId,
            environment,
            featureName,
        );
        this.openApiService.respondWithValidation(
            200,
            res,
            featureSchema.$id,
            serializeDates(environmentInfo),
        );
    }

    async toggleFeatureEnvironmentOn(
        req: IAuthRequest<FeatureStrategyParams, any, any, any>,
        res: Response<void>,
    ): Promise<void> {
        const { featureName, environment, projectId } = req.params;
        await this.featureService.updateEnabled(
            projectId,
            featureName,
            environment,
            true,
            extractUsername(req),
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
        );
        res.status(200).end();
    }

    async addStrategy(
        req: IAuthRequest<FeatureStrategyParams, any, CreateStrategySchema>,
        res: Response<StrategySchema>,
    ): Promise<void> {
        const { projectId, featureName, environment } = req.params;
        const userName = extractUsername(req);
        const strategy = await this.featureService.createStrategy(
            req.body,
            { environment, projectId, featureName },
            userName,
        );
        res.status(200).json(strategy);
    }

    async getStrategies(
        req: Request<FeatureStrategyParams, any, any, any>,
        res: Response<StrategySchema[]>,
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

    async updateStrategy(
        req: IAuthRequest<StrategyIdParams, any, UpdateStrategySchema>,
        res: Response<StrategySchema>,
    ): Promise<void> {
        const { strategyId, environment, projectId, featureName } = req.params;
        const userName = extractUsername(req);
        const updatedStrategy = await this.featureService.updateStrategy(
            strategyId,
            req.body,
            { environment, projectId, featureName },
            userName,
        );
        res.status(200).json(updatedStrategy);
    }

    async patchStrategy(
        req: IAuthRequest<StrategyIdParams, any, Operation[], any>,
        res: Response<StrategySchema>,
    ): Promise<void> {
        const { strategyId, projectId, environment, featureName } = req.params;
        const userName = extractUsername(req);
        const patch = req.body;
        const strategy = await this.featureService.getStrategy(strategyId);
        const { newDocument } = applyPatch(strategy, patch);
        const updatedStrategy = await this.featureService.updateStrategy(
            strategyId,
            newDocument,
            { environment, projectId, featureName },
            userName,
        );
        res.status(200).json(updatedStrategy);
    }

    async getStrategy(
        req: IAuthRequest<StrategyIdParams, any, any, any>,
        res: Response<StrategySchema>,
    ): Promise<void> {
        this.logger.info('Getting strategy');
        const { strategyId } = req.params;
        this.logger.info(strategyId);
        const strategy = await this.featureService.getStrategy(strategyId);
        res.status(200).json(strategy);
    }

    async deleteStrategy(
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
        res: Response<StrategySchema>,
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
            );
        res.status(200).json(updatedStrategy);
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

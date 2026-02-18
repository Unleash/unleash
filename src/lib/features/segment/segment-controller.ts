import type { Request, Response } from 'express';
import Controller from '../../routes/controller.js';

import type { FeatureToggleService } from '../feature-toggle/feature-toggle-service.js';

import type { IAuthRequest, IUnleashConfig } from '../../types/index.js';
import {
    type AdminSegmentSchema,
    adminSegmentSchema,
    createRequestSchema,
    createResponseSchema,
    resourceCreatedResponseSchema,
    updateFeatureStrategySchema,
    type UpdateFeatureStrategySegmentsSchema,
    type UpsertSegmentSchema,
} from '../../openapi/index.js';
import {
    emptyResponse,
    getStandardResponses,
} from '../../openapi/util/standard-responses.js';
import type { ISegmentService } from './segment-service-interface.js';
import type { SegmentStrategiesSchema } from '../../openapi/spec/segment-strategies-schema.js';
import type {
    AccessService,
    IUnleashServices,
    OpenApiService,
} from '../../services/index.js';
import {
    CREATE_SEGMENT,
    DELETE_SEGMENT,
    type IFlagResolver,
    NONE,
    serializeDates,
    UPDATE_FEATURE_STRATEGY,
    UPDATE_PROJECT_SEGMENT,
    UPDATE_SEGMENT,
} from '../../types/index.js';
import {
    segmentsSchema,
    type SegmentsSchema,
} from '../../openapi/spec/segments-schema.js';

import { anonymiseKeys, extractUserIdFromUser } from '../../util/index.js';
import { BadDataError } from '../../error/index.js';

type IUpdateFeatureStrategySegmentsRequest = IAuthRequest<
    {},
    undefined,
    UpdateFeatureStrategySegmentsSchema
>;

export class SegmentsController extends Controller {
    private segmentService: ISegmentService;

    private accessService: AccessService;

    private flagResolver: IFlagResolver;

    private openApiService: OpenApiService;

    private featureToggleService: FeatureToggleService;

    constructor(
        config: IUnleashConfig,
        {
            segmentService,
            accessService,
            openApiService,
            featureToggleService,
        }: Pick<
            IUnleashServices,
            | 'segmentService'
            | 'accessService'
            | 'openApiService'
            | 'featureToggleService'
        >,
    ) {
        super(config);
        this.flagResolver = config.flagResolver;
        this.config = config;
        this.segmentService = segmentService;
        this.accessService = accessService;
        this.openApiService = openApiService;
        this.featureToggleService = featureToggleService;

        this.route({
            method: 'post',
            path: '/validate',
            handler: this.validate,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    summary: 'Validates if a segment name exists',
                    description:
                        'Uses the name provided in the body of the request to validate if the given name exists or not',
                    tags: ['Segments'],
                    operationId: 'validateSegment',
                    requestBody: createRequestSchema('nameSchema'),
                    responses: {
                        204: emptyResponse,
                        ...getStandardResponses(400, 401, 409, 415),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/strategies/:strategyId',
            handler: this.getSegmentsByStrategy,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Segments'],
                    operationId: 'getSegmentsByStrategyId',
                    summary: 'Get strategy segments',
                    description:
                        "Retrieve all segments that are referenced by the specified strategy. Returns an empty list of segments if the strategy ID doesn't exist.",
                    responses: {
                        200: createResponseSchema('segmentsSchema'),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '/strategies',
            handler: this.updateFeatureStrategySegments,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    summary: 'Update strategy segments',
                    description:
                        'Sets the segments of the strategy specified to be exactly the ones passed in the payload. Any segments that were used by the strategy before will be removed if they are not in the provided list of segments.',
                    tags: ['Strategies'],
                    operationId: 'updateFeatureStrategySegments',
                    requestBody: createRequestSchema(
                        'updateFeatureStrategySegmentsSchema',
                    ),
                    responses: {
                        201: resourceCreatedResponseSchema(
                            'updateFeatureStrategySegmentsSchema',
                        ),
                        ...getStandardResponses(400, 401, 403, 415),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/:id/strategies',
            handler: this.getStrategiesBySegment,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Segments'],
                    operationId: 'getStrategiesBySegmentId',
                    summary: 'Get strategies that reference segment',
                    description:
                        'Retrieve all strategies that reference the specified segment.',
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            schema: {
                                type: 'integer',
                            },
                            description: 'a segment id',
                        },
                    ],
                    responses: {
                        200: createResponseSchema('segmentStrategiesSchema'),
                    },
                }),
            ],
        });

        this.route({
            method: 'delete',
            path: '/:id',
            handler: this.removeSegment,
            permission: [DELETE_SEGMENT, UPDATE_PROJECT_SEGMENT],
            acceptAnyContentType: true,
            middleware: [
                openApiService.validPath({
                    summary: 'Deletes a segment by id',
                    description:
                        'Deletes a segment by its id, if not found returns a 409 error',
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            schema: {
                                type: 'integer',
                            },
                            description: 'a segment id',
                        },
                    ],
                    tags: ['Segments'],
                    operationId: 'removeSegment',
                    responses: {
                        204: emptyResponse,
                        ...getStandardResponses(401, 403, 409),
                    },
                }),
            ],
        });

        this.route({
            method: 'put',
            path: '/:id',
            handler: this.updateSegment,
            permission: [UPDATE_SEGMENT, UPDATE_PROJECT_SEGMENT],
            middleware: [
                openApiService.validPath({
                    summary: 'Update segment by id',
                    description:
                        'Updates the content of the segment with the provided payload. Requires `name` and `constraints` to be present. If `project` is not present, it will be set to `null`. Any other fields not specified will be left untouched.',
                    tags: ['Segments'],
                    operationId: 'updateSegment',
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            schema: {
                                type: 'integer',
                            },
                            description: 'a segment id',
                        },
                    ],
                    requestBody: createRequestSchema('upsertSegmentSchema'),
                    responses: {
                        204: emptyResponse,
                        ...getStandardResponses(400, 401, 403, 409, 415),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/:id',
            handler: this.getSegment,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    summary: 'Get a segment',
                    description: 'Retrieves a segment based on its ID.',
                    tags: ['Segments'],
                    operationId: 'getSegment',
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            schema: {
                                type: 'integer',
                            },
                            description: 'a segment id',
                        },
                    ],
                    responses: {
                        200: createResponseSchema('adminSegmentSchema'),
                        ...getStandardResponses(404),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '',
            handler: this.createSegment,
            permission: [CREATE_SEGMENT, UPDATE_PROJECT_SEGMENT],
            middleware: [
                openApiService.validPath({
                    summary: 'Create a new segment',
                    description:
                        'Creates a new segment using the payload provided',
                    tags: ['Segments'],
                    operationId: 'createSegment',
                    requestBody: createRequestSchema('upsertSegmentSchema'),
                    responses: {
                        201: resourceCreatedResponseSchema(
                            'adminSegmentSchema',
                        ),
                        ...getStandardResponses(400, 401, 403, 409, 415),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '',
            handler: this.getSegments,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    summary: 'Get all segments',
                    description:
                        'Retrieves all segments that exist in this Unleash instance.',
                    tags: ['Segments'],
                    operationId: 'getSegments',
                    responses: {
                        200: createResponseSchema('segmentsSchema'),
                    },
                }),
            ],
        });
    }

    async validate(
        req: Request<unknown, unknown, { name: string }>,
        res: Response,
    ): Promise<void> {
        const { name } = req.body;
        await this.segmentService.validateName(name);
        res.status(204).send();
    }

    async getSegmentsByStrategy(
        req: Request<{ strategyId: string }>,
        res: Response<SegmentsSchema>,
    ): Promise<void> {
        const { strategyId } = req.params;
        const segments = await this.segmentService.getByStrategy(strategyId);

        const responseBody = this.flagResolver.isEnabled('anonymiseEventLog')
            ? {
                  segments: anonymiseKeys(segments, ['createdBy']),
              }
            : { segments };

        this.openApiService.respondWithValidation(
            200,
            res,
            segmentsSchema.$id,
            serializeDates(responseBody),
        );
    }

    async updateFeatureStrategySegments(
        req: IUpdateFeatureStrategySegmentsRequest,
        res: Response<UpdateFeatureStrategySegmentsSchema>,
    ): Promise<void> {
        const { projectId, environmentId, strategyId, segmentIds } = req.body;

        const hasFeatureStrategyPermission = this.accessService.hasPermission(
            req.user,
            UPDATE_FEATURE_STRATEGY,
            projectId,
            environmentId,
        );

        if (!hasFeatureStrategyPermission) {
            res.status(403).send();
            return;
        }

        if (segmentIds.length > this.config.strategySegmentsLimit) {
            throw new BadDataError(
                `Strategies may not have more than ${this.config.strategySegmentsLimit} segments`,
            );
        }

        const segments = await this.segmentService.getByStrategy(strategyId);
        const currentSegmentIds = segments.map((segment) => segment.id);

        await this.removeFromStrategy(
            strategyId,
            currentSegmentIds.filter((id) => !segmentIds.includes(id)),
        );

        await this.addToStrategy(
            strategyId,
            segmentIds.filter((id) => !currentSegmentIds.includes(id)),
        );

        this.openApiService.respondWithValidation(
            201,
            res,
            updateFeatureStrategySchema.$id,
            req.body,
            {
                location: `strategies/${strategyId}`,
            },
        );
    }

    async getStrategiesBySegment(
        req: IAuthRequest<{ id: number }>,
        res: Response<SegmentStrategiesSchema>,
    ): Promise<void> {
        const id = req.params.id;
        const { user } = req;
        const userId = extractUserIdFromUser(user);
        const strategies = await this.segmentService.getVisibleStrategies(
            id,
            userId,
        );

        const segmentStrategies = strategies.strategies.map((strategy) => ({
            id: strategy.id,
            projectId: strategy.projectId,
            featureName: strategy.featureName,
            strategyName: strategy.strategyName,
            environment: strategy.environment,
        }));

        const changeRequestStrategies = strategies.changeRequestStrategies.map(
            (strategy) => ({
                ...('id' in strategy ? { id: strategy.id } : {}),
                projectId: strategy.projectId,
                featureName: strategy.featureName,
                strategyName: strategy.strategyName,
                environment: strategy.environment,
                changeRequest: strategy.changeRequest,
            }),
        );

        res.json({
            strategies: segmentStrategies,
            changeRequestStrategies,
        });
    }

    async removeSegment(
        req: IAuthRequest<{ id: number }>,
        res: Response,
    ): Promise<void> {
        const id = req.params.id;

        let segmentIsInUse = false;
        segmentIsInUse = await this.segmentService.isInUse(id);

        if (segmentIsInUse) {
            res.status(409).send();
        } else {
            await this.segmentService.delete(id, req.user, req.audit);
            res.status(204).send();
        }
    }

    async updateSegment(
        req: IAuthRequest<{ id: number }>,
        res: Response,
    ): Promise<void> {
        const id = req.params.id;

        await this.featureToggleService.validateConstraint(
            req.body.constraints,
        );

        const updateRequest: UpsertSegmentSchema = {
            name: req.body.name,
            description: req.body.description,
            project: req.body.project,
            constraints: req.body.constraints,
        };
        await this.segmentService.update(
            id,
            updateRequest,
            req.user,
            req.audit,
        );
        res.status(204).send();
    }

    async getSegment(
        req: IAuthRequest<{ id: number }>,
        res: Response,
    ): Promise<void> {
        const id = req.params.id;
        const userId = extractUserIdFromUser(req.user);
        const segment = await this.segmentService.get(id, userId);

        if (this.flagResolver.isEnabled('anonymiseEventLog')) {
            res.json(anonymiseKeys(segment, ['createdBy']));
        } else {
            res.json(segment);
        }
    }

    async createSegment(
        req: IAuthRequest<any, any, UpsertSegmentSchema>,
        res: Response<AdminSegmentSchema>,
    ): Promise<void> {
        const createRequest = req.body;
        await this.featureToggleService.validateConstraints(
            createRequest.constraints,
        );
        const segment = await this.segmentService.create(
            createRequest,
            req.audit,
        );
        this.openApiService.respondWithValidation(
            201,
            res,
            adminSegmentSchema.$id,
            serializeDates(segment),
            { location: `segments/${segment.id}` },
        );
    }

    async getSegments(
        req: IAuthRequest,
        res: Response<SegmentsSchema>,
    ): Promise<void> {
        const userId = extractUserIdFromUser(req.user);
        const segments = await this.segmentService.getAll(userId);

        const response = {
            segments: this.flagResolver.isEnabled('anonymiseEventLog')
                ? anonymiseKeys(segments, ['createdBy'])
                : segments,
        };

        this.openApiService.respondWithValidation<SegmentsSchema>(
            200,
            res,
            segmentsSchema.$id,
            serializeDates(response),
        );
    }

    private async removeFromStrategy(
        strategyId: string,
        segmentIds: number[],
    ): Promise<void> {
        await Promise.all(
            segmentIds.map((id) =>
                this.segmentService.removeFromStrategy(id, strategyId),
            ),
        );
    }

    private async addToStrategy(
        strategyId: string,
        segmentIds: number[],
    ): Promise<void> {
        await Promise.all(
            segmentIds.map((id) =>
                this.segmentService.addToStrategy(id, strategyId),
            ),
        );
    }
}

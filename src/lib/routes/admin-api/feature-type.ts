import type { Request, Response } from 'express';
import type { IUnleashServices } from '../../services/index.js';
import type FeatureTypeService from '../../services/feature-type-service.js';
import type { Logger } from '../../logger.js';
import type { IUnleashConfig } from '../../types/option.js';
import type { OpenApiService } from '../../services/openapi-service.js';
import { ADMIN, NONE } from '../../types/permissions.js';
import {
    featureTypesSchema,
    type FeatureTypesSchema,
} from '../../openapi/spec/feature-types-schema.js';
import { createResponseSchema } from '../../openapi/util/create-response-schema.js';
import Controller from '../controller.js';
import {
    createRequestSchema,
    featureTypeSchema,
    type FeatureTypeSchema,
    getStandardResponses,
    type UpdateFeatureTypeLifetimeSchema,
} from '../../openapi/index.js';
import type { IAuthRequest } from '../unleash-types.js';
import type { IFlagResolver } from '../../types/index.js';

const version = 1;

export class FeatureTypeController extends Controller {
    private featureTypeService: FeatureTypeService;

    private openApiService: OpenApiService;

    private logger: Logger;

    private flagResolver: IFlagResolver;

    constructor(
        config: IUnleashConfig,
        {
            featureTypeService,
            openApiService,
        }: Pick<IUnleashServices, 'featureTypeService' | 'openApiService'>,
    ) {
        super(config);
        this.featureTypeService = featureTypeService;
        this.openApiService = openApiService;
        this.flagResolver = config.flagResolver;
        this.logger = config.getLogger('/admin-api/feature-type.js');

        this.route({
            method: 'get',
            path: '',
            handler: this.getAllFeatureTypes,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Feature Types'],
                    operationId: 'getAllFeatureTypes',
                    summary: 'Get all feature types',
                    description:
                        'Retrieves all feature types that exist in this Unleash instance, along with their descriptions and lifetimes.',
                    responses: {
                        200: createResponseSchema('featureTypesSchema'),
                        ...getStandardResponses(401),
                    },
                }),
            ],
        });

        this.route({
            method: 'put',
            path: '/:id/lifetime',
            handler: this.updateLifetime,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Feature Types'],
                    operationId: 'updateFeatureTypeLifetime',
                    summary: 'Update feature type lifetime',
                    description: `Updates the lifetime configuration for the specified [feature flag type](https://docs.getunleash.io/concepts/feature-flags#feature-flag-types). The expected lifetime is an integer representing the number of days before Unleash marks a feature flag of that type as potentially stale. If set to \`null\` or \`0\`, then feature flags of that particular type will never be marked as potentially stale.

When a feature flag type's expected lifetime is changed, this will also cause any feature flags of this type to be reevaluated for potential staleness.`,
                    responses: {
                        200: createResponseSchema('featureTypeSchema'),
                        ...getStandardResponses(400, 401, 403, 404, 409, 415),
                    },
                    requestBody: createRequestSchema(
                        'updateFeatureTypeLifetimeSchema',
                    ),
                }),
            ],
        });
    }

    async getAllFeatureTypes(
        req: Request,
        res: Response<FeatureTypesSchema>,
    ): Promise<void> {
        this.openApiService.respondWithValidation(
            200,
            res,
            featureTypesSchema.$id,
            {
                version,
                types: await this.featureTypeService.getAll(),
            },
        );
    }

    async updateLifetime(
        req: IAuthRequest<
            { id: string },
            unknown,
            UpdateFeatureTypeLifetimeSchema
        >,
        res: Response<FeatureTypeSchema>,
    ): Promise<void> {
        const result = await this.featureTypeService.updateLifetime(
            req.params.id.toLowerCase(),
            req.body.lifetimeDays,
            req.audit,
        );

        this.openApiService.respondWithValidation(
            200,
            res,
            featureTypeSchema.$id,
            result,
        );
    }
}

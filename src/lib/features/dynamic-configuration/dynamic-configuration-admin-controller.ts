import type { Response } from 'express';
import Controller from '../../routes/controller.js';
import type { IAuthRequest } from '../../routes/unleash-types.js';
import type { IUnleashConfig } from '../../types/index.js';
import { NONE, UPDATE_FEATURE } from '../../types/permissions.js';
import type { OpenApiService } from '../../services/openapi-service.js';
import { createRequestSchema } from '../../openapi/util/create-request-schema.js';
import { createResponseSchema } from '../../openapi/util/create-response-schema.js';
import { getStandardResponses } from '../../openapi/util/standard-responses.js';
import { NotFoundError } from '../../error/index.js';
import { dynamicConfigurationSchema } from '../../openapi/spec/dynamic-configuration-schema.js';
import { dynamicConfigurationsSchema } from '../../openapi/spec/dynamic-configurations-schema.js';
import type {
    DynamicConfiguration,
    UpsertDynamicConfiguration,
} from './dynamic-configuration-types.js';
import { mockDynamicConfigurationStore } from './mock-dynamic-configuration-store.js';

interface ProjectParams {
    projectId: string;
}

interface ConfigurationParams extends ProjectParams {
    configurationKey: string;
}

interface DynamicConfigurationsResponse {
    configurations: DynamicConfiguration[];
}

export class DynamicConfigurationAdminController extends Controller {
    private readonly openApiService: OpenApiService;

    constructor(config: IUnleashConfig, openApiService: OpenApiService) {
        super(config);
        this.openApiService = openApiService;

        this.route({
            method: 'get',
            path: '/:projectId/configurations',
            handler: this.list,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    operationId: 'listDynamicConfigurations',
                    tags: ['Projects'],
                    summary: 'List dynamic configurations in a project',
                    description:
                        'Alpha mock endpoint backed by process-local sample data.',
                    release: { alpha: true },
                    responses: {
                        200: createResponseSchema(
                            'dynamicConfigurationsSchema',
                        ),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/:projectId/configurations/:configurationKey',
            handler: this.getConfiguration,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    operationId: 'getDynamicConfiguration',
                    tags: ['Projects'],
                    summary: 'Get a dynamic configuration',
                    description:
                        'Returns the management representation, including values for every environment.',
                    release: { alpha: true },
                    responses: {
                        200: createResponseSchema('dynamicConfigurationSchema'),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'put',
            path: '/:projectId/configurations/:configurationKey',
            handler: this.upsert,
            permission: UPDATE_FEATURE,
            middleware: [
                openApiService.validPath({
                    operationId: 'upsertDynamicConfiguration',
                    tags: ['Projects'],
                    summary: 'Create or replace a dynamic configuration',
                    description:
                        'Alpha mock endpoint. Uses the existing UPDATE_FEATURE permission until dedicated permissions are designed.',
                    release: { alpha: true },
                    requestBody: createRequestSchema(
                        'upsertDynamicConfigurationSchema',
                    ),
                    responses: {
                        200: createResponseSchema('dynamicConfigurationSchema'),
                        ...getStandardResponses(400, 401, 403, 415),
                    },
                }),
            ],
        });
    }

    async list(
        req: IAuthRequest<ProjectParams>,
        res: Response<DynamicConfigurationsResponse>,
    ): Promise<void> {
        const response = {
            configurations: mockDynamicConfigurationStore.list(
                req.params.projectId,
            ),
        };
        this.openApiService.respondWithValidation(
            200,
            res,
            dynamicConfigurationsSchema.$id,
            response,
        );
    }

    async getConfiguration(
        req: IAuthRequest<ConfigurationParams>,
        res: Response<DynamicConfiguration>,
    ): Promise<void> {
        const configuration = mockDynamicConfigurationStore.get(
            req.params.projectId,
            req.params.configurationKey,
        );
        if (!configuration) {
            throw new NotFoundError(
                `Could not find dynamic configuration ${req.params.configurationKey}`,
            );
        }

        this.openApiService.respondWithValidation(
            200,
            res,
            dynamicConfigurationSchema.$id,
            configuration,
        );
    }

    async upsert(
        req: IAuthRequest<
            ConfigurationParams,
            DynamicConfiguration,
            UpsertDynamicConfiguration
        >,
        res: Response<DynamicConfiguration>,
    ): Promise<void> {
        const configuration = mockDynamicConfigurationStore.upsert(
            req.params.projectId,
            req.params.configurationKey,
            req.body,
        );
        this.openApiService.respondWithValidation(
            200,
            res,
            dynamicConfigurationSchema.$id,
            configuration,
        );
    }
}

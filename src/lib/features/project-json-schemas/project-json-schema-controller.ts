import type { Response } from 'express';
import Controller from '../../routes/controller.js';
import type { IAuthRequest } from '../../routes/unleash-types.js';
import type { IUnleashConfig } from '../../types/option.js';
import type ProjectJsonSchemaService from './project-json-schema-service.js';
import { UPDATE_PROJECT, NONE } from '../../types/permissions.js';
import type { OpenApiService } from '../../services/openapi-service.js';
import {
    createResponseSchema,
    resourceCreatedResponseSchema,
    type ProjectJsonSchemaSchema,
    type ProjectJsonSchemasSchema,
} from '../../openapi/index.js';
import {
    emptyResponse,
    getStandardResponses,
} from '../../openapi/util/standard-responses.js';
import { createRequestSchema } from '../../openapi/util/create-request-schema.js';
import type { IFlagResolver } from '../../types/index.js';
import type { CreateProjectJsonSchemaSchema } from '../../openapi/spec/create-project-json-schema-schema.js';
import { serializeDates } from '../../types/serialize-dates.js';
import { projectJsonSchemaSchema } from '../../openapi/spec/project-json-schema-schema.js';
import { projectJsonSchemasSchema } from '../../openapi/spec/project-json-schemas-schema.js';

interface ProjectJsonSchemaControllerServices {
    projectJsonSchemaService: ProjectJsonSchemaService;
    openApiService: OpenApiService;
}

const PATH = '/:projectId/json-schemas';
const PATH_SCHEMA = '/:projectId/json-schemas/:schemaId';

export default class ProjectJsonSchemaController extends Controller {
    private projectJsonSchemaService: ProjectJsonSchemaService;

    private openApiService: OpenApiService;

    private flagResolver: IFlagResolver;

    constructor(
        config: IUnleashConfig,
        {
            projectJsonSchemaService,
            openApiService,
        }: ProjectJsonSchemaControllerServices,
    ) {
        super(config);
        this.projectJsonSchemaService = projectJsonSchemaService;
        this.openApiService = openApiService;
        this.flagResolver = config.flagResolver;

        this.route({
            method: 'get',
            path: PATH,
            handler: this.getProjectJsonSchemas,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Unstable'],
                    operationId: 'getProjectJsonSchemas',
                    summary: 'List JSON schemas for a project.',
                    description:
                        'Retrieve all JSON schemas defined for a project. These schemas can be used to validate strategy variant payloads.',
                    responses: {
                        200: createResponseSchema('projectJsonSchemasSchema'),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: PATH,
            handler: this.createProjectJsonSchema,
            permission: UPDATE_PROJECT,
            middleware: [
                openApiService.validPath({
                    tags: ['Unstable'],
                    operationId: 'createProjectJsonSchema',
                    summary: 'Create a JSON schema for a project.',
                    description:
                        'Create a new JSON schema definition scoped to this project.',
                    requestBody: createRequestSchema(
                        'createProjectJsonSchemaSchema',
                    ),
                    responses: {
                        201: resourceCreatedResponseSchema(
                            'projectJsonSchemaSchema',
                        ),
                        ...getStandardResponses(400, 401, 403, 415),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: PATH_SCHEMA,
            handler: this.getProjectJsonSchema,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Unstable'],
                    operationId: 'getProjectJsonSchema',
                    summary: 'Get a specific JSON schema.',
                    description:
                        'Retrieve a specific JSON schema definition by its ID.',
                    responses: {
                        200: createResponseSchema('projectJsonSchemaSchema'),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'put',
            path: PATH_SCHEMA,
            handler: this.updateProjectJsonSchema,
            permission: UPDATE_PROJECT,
            middleware: [
                openApiService.validPath({
                    tags: ['Unstable'],
                    operationId: 'updateProjectJsonSchema',
                    summary: 'Update a JSON schema.',
                    description: 'Update an existing JSON schema definition.',
                    requestBody: createRequestSchema(
                        'createProjectJsonSchemaSchema',
                    ),
                    responses: {
                        200: createResponseSchema('projectJsonSchemaSchema'),
                        ...getStandardResponses(400, 401, 403, 404, 415),
                    },
                }),
            ],
        });

        this.route({
            method: 'delete',
            path: PATH_SCHEMA,
            handler: this.deleteProjectJsonSchema,
            acceptAnyContentType: true,
            permission: UPDATE_PROJECT,
            middleware: [
                openApiService.validPath({
                    tags: ['Unstable'],
                    operationId: 'deleteProjectJsonSchema',
                    summary: 'Delete a JSON schema.',
                    description:
                        'Delete a JSON schema definition from a project.',
                    responses: {
                        204: emptyResponse,
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });
    }

    async getProjectJsonSchemas(
        req: IAuthRequest<{ projectId: string }>,
        res: Response<ProjectJsonSchemasSchema>,
    ): Promise<void> {
        const { projectId } = req.params;
        const schemas =
            await this.projectJsonSchemaService.getByProject(projectId);

        this.openApiService.respondWithValidation(
            200,
            res,
            projectJsonSchemasSchema.$id,
            { jsonSchemas: serializeDates(schemas) },
        );
    }

    async createProjectJsonSchema(
        req: IAuthRequest<
            { projectId: string },
            unknown,
            CreateProjectJsonSchemaSchema
        >,
        res: Response<ProjectJsonSchemaSchema>,
    ): Promise<void> {
        const { projectId } = req.params;
        const schema = await this.projectJsonSchemaService.createSchema(
            projectId,
            req.body,
        );

        this.openApiService.respondWithValidation(
            201,
            res,
            projectJsonSchemaSchema.$id,
            serializeDates(schema),
            { location: `${projectId}/json-schemas/${schema.id}` },
        );
    }

    async getProjectJsonSchema(
        req: IAuthRequest<{ projectId: string; schemaId: string }>,
        res: Response<ProjectJsonSchemaSchema>,
    ): Promise<void> {
        const { schemaId } = req.params;
        const schema = await this.projectJsonSchemaService.getById(schemaId);

        this.openApiService.respondWithValidation(
            200,
            res,
            projectJsonSchemaSchema.$id,
            serializeDates(schema),
        );
    }

    async updateProjectJsonSchema(
        req: IAuthRequest<
            { projectId: string; schemaId: string },
            unknown,
            CreateProjectJsonSchemaSchema
        >,
        res: Response<ProjectJsonSchemaSchema>,
    ): Promise<void> {
        const { projectId, schemaId } = req.params;
        const schema = await this.projectJsonSchemaService.updateSchema(
            schemaId,
            projectId,
            req.body,
        );

        this.openApiService.respondWithValidation(
            200,
            res,
            projectJsonSchemaSchema.$id,
            serializeDates(schema),
        );
    }

    async deleteProjectJsonSchema(
        req: IAuthRequest<{ projectId: string; schemaId: string }>,
        res: Response,
    ): Promise<void> {
        const { projectId, schemaId } = req.params;
        await this.projectJsonSchemaService.deleteSchema(schemaId, projectId);
        res.status(204).end();
    }
}

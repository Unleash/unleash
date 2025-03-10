import type { Request, Response } from 'express';

import Controller from '../../../routes/controller';

import {
    CREATE_CONTEXT_FIELD,
    UPDATE_CONTEXT_FIELD,
    DELETE_CONTEXT_FIELD,
    NONE,
} from '../../../types/permissions';
import type { IUnleashConfig } from '../../../types/option';
import type { IUnleashServices } from '../../../types/services';
import type ContextService from '../../../features/context/context-service';
import type { Logger } from '../../../logger';
import type { IAuthRequest } from '../../../routes/unleash-types';

import type { OpenApiService } from '../../../services/openapi-service';
import {
    contextFieldSchema,
    type ContextFieldSchema,
} from '../../../openapi/spec/context-field-schema';
import type { ContextFieldsSchema } from '../../../openapi/spec/context-fields-schema';
import { createRequestSchema } from '../../../openapi/util/create-request-schema';
import {
    createResponseSchema,
    resourceCreatedResponseSchema,
} from '../../../openapi/util/create-response-schema';
import { serializeDates } from '../../../types/serialize-dates';
import NotFoundError from '../../../error/notfound-error';
import type { NameSchema } from '../../../openapi/spec/name-schema';
import {
    emptyResponse,
    getStandardResponses,
} from '../../../openapi/util/standard-responses';
import {
    type ContextFieldStrategiesSchema,
    contextFieldStrategiesSchema,
} from '../../../openapi/spec/context-field-strategies-schema';
import type { UpdateContextFieldSchema } from '../../../openapi/spec/update-context-field-schema';
import type { CreateContextFieldSchema } from '../../../openapi/spec/create-context-field-schema';
import { extractUserIdFromUser } from '../../../util';
import type { LegalValueSchema } from '../../../openapi';
import type { WithTransactional } from '../../../db/transaction';
import type { IAuditUser } from '../../../types/user';

interface ContextParam {
    contextField: string;
    workspaceId: string;
}

interface DeleteLegalValueParam extends ContextParam {
    legalValue: string;
}

export class ContextWorkspaceController extends Controller {
    private transactionalContextService: WithTransactional<ContextService>;

    private openApiService: OpenApiService;

    private logger: Logger;

    constructor(
        config: IUnleashConfig,
        {
            transactionalContextService,
            openApiService,
        }: Pick<
            IUnleashServices,
            'transactionalContextService' | 'openApiService'
        >,
    ) {
        super(config);
        this.openApiService = openApiService;
        this.logger = config.getLogger('/admin-api/workspace-context.ts');
        this.transactionalContextService = transactionalContextService;

        this.route({
            method: 'get',
            path: '/workspaces/:workspaceId/context',
            handler: this.getContextFields,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Context'],
                    summary: 'Gets configured context fields for a workspace',
                    parameters: [
                        {
                            in: 'path',
                            name: 'workspaceId',
                            schema: {
                                type: 'string',
                            },
                            required: true,
                            description: 'Workspace ID',
                        },
                    ],
                    operationId: 'getWorkspaceContextFields',
                    responses: {
                        200: createResponseSchema('contextFieldsSchema'),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/workspaces/:workspaceId/context/:contextField',
            handler: this.getContextField,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Context'],
                    summary: 'Gets context field for a workspace',
                    parameters: [
                        {
                            in: 'path',
                            name: 'workspaceId',
                            schema: {
                                type: 'string',
                            },
                            required: true,
                            description: 'Workspace ID',
                        },
                        {
                            in: 'path',
                            name: 'contextField',
                            schema: {
                                type: 'string',
                            },
                            required: true,
                            description: 'Context field name',
                        },
                    ],
                    operationId: 'getWorkspaceContextField',
                    responses: {
                        200: createResponseSchema('contextFieldSchema'),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '/workspaces/:workspaceId/context',
            handler: this.createContextField,
            permission: CREATE_CONTEXT_FIELD,
            middleware: [
                openApiService.validPath({
                    tags: ['Context'],
                    summary: 'Create a new context field for a workspace',
                    parameters: [
                        {
                            in: 'path',
                            name: 'workspaceId',
                            schema: {
                                type: 'string',
                            },
                            required: true,
                            description: 'Workspace ID',
                        },
                    ],
                    operationId: 'createWorkspaceContextField',
                    requestBody: createRequestSchema(
                        'createContextFieldSchema',
                    ),
                    responses: {
                        201: resourceCreatedResponseSchema(
                            'contextFieldSchema',
                        ),
                        ...getStandardResponses(),
                    },
                }),
            ],
        });

        this.route({
            method: 'put',
            path: '/workspaces/:workspaceId/context/:contextField',
            handler: this.updateContextField,
            permission: UPDATE_CONTEXT_FIELD,
            middleware: [
                openApiService.validPath({
                    tags: ['Context'],
                    summary: 'Update an existing context field for a workspace',
                    parameters: [
                        {
                            in: 'path',
                            name: 'workspaceId',
                            schema: {
                                type: 'string',
                            },
                            required: true,
                            description: 'Workspace ID',
                        },
                        {
                            in: 'path',
                            name: 'contextField',
                            schema: {
                                type: 'string',
                            },
                            required: true,
                            description: 'Context field name',
                        },
                    ],
                    operationId: 'updateWorkspaceContextField',
                    requestBody: createRequestSchema(
                        'updateContextFieldSchema',
                    ),
                    responses: {
                        200: emptyResponse,
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '/workspaces/:workspaceId/context/:contextField/legal-values',
            handler: this.updateLegalValue,
            permission: UPDATE_CONTEXT_FIELD,
            middleware: [
                openApiService.validPath({
                    tags: ['Context'],
                    summary:
                        'Add a legal value to a context field for a workspace',
                    parameters: [
                        {
                            in: 'path',
                            name: 'workspaceId',
                            schema: {
                                type: 'string',
                            },
                            required: true,
                            description: 'Workspace ID',
                        },
                        {
                            in: 'path',
                            name: 'contextField',
                            schema: {
                                type: 'string',
                            },
                            required: true,
                            description: 'Context field name',
                        },
                    ],
                    operationId: 'addWorkspaceContextFieldLegalValue',
                    requestBody: createRequestSchema('legalValueSchema'),
                    responses: {
                        200: emptyResponse,
                    },
                }),
            ],
        });

        this.route({
            method: 'delete',
            path: '/workspaces/:workspaceId/context/:contextField/legal-values/:legalValue',
            handler: this.deleteLegalValue,
            acceptAnyContentType: true,
            permission: UPDATE_CONTEXT_FIELD,
            middleware: [
                openApiService.validPath({
                    tags: ['Context'],
                    summary:
                        'Delete a legal value from a context field for a workspace',
                    parameters: [
                        {
                            in: 'path',
                            name: 'workspaceId',
                            schema: {
                                type: 'string',
                            },
                            required: true,
                            description: 'Workspace ID',
                        },
                        {
                            in: 'path',
                            name: 'contextField',
                            schema: {
                                type: 'string',
                            },
                            required: true,
                            description: 'Context field name',
                        },
                        {
                            in: 'path',
                            name: 'legalValue',
                            schema: {
                                type: 'string',
                            },
                            required: true,
                            description: 'Legal value to delete',
                        },
                    ],
                    operationId: 'deleteWorkspaceContextFieldLegalValue',
                    responses: {
                        200: emptyResponse,
                    },
                }),
            ],
        });

        this.route({
            method: 'delete',
            path: '/workspaces/:workspaceId/context/:contextField',
            handler: this.deleteContextField,
            acceptAnyContentType: true,
            permission: DELETE_CONTEXT_FIELD,
            middleware: [
                openApiService.validPath({
                    tags: ['Context'],
                    summary: 'Delete an existing context field for a workspace',
                    parameters: [
                        {
                            in: 'path',
                            name: 'workspaceId',
                            schema: {
                                type: 'string',
                            },
                            required: true,
                            description: 'Workspace ID',
                        },
                        {
                            in: 'path',
                            name: 'contextField',
                            schema: {
                                type: 'string',
                            },
                            required: true,
                            description: 'Context field name',
                        },
                    ],
                    operationId: 'deleteWorkspaceContextField',
                    responses: {
                        200: emptyResponse,
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '/workspaces/:workspaceId/context/validate',
            handler: this.validate,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Context'],
                    summary: 'Validate a context field name for a workspace',
                    parameters: [
                        {
                            in: 'path',
                            name: 'workspaceId',
                            schema: {
                                type: 'string',
                            },
                            required: true,
                            description: 'Workspace ID',
                        },
                    ],
                    operationId: 'validateWorkspaceContextFieldName',
                    requestBody: createRequestSchema('nameSchema'),
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/workspaces/:workspaceId/context/:contextField/strategies',
            handler: this.getStrategiesByContextField,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Context'],
                    summary:
                        'Get strategies using a context field for a workspace',
                    parameters: [
                        {
                            in: 'path',
                            name: 'workspaceId',
                            schema: {
                                type: 'string',
                            },
                            required: true,
                            description: 'Workspace ID',
                        },
                        {
                            in: 'path',
                            name: 'contextField',
                            schema: {
                                type: 'string',
                            },
                            required: true,
                            description: 'Context field name',
                        },
                    ],
                    operationId: 'getWorkspaceStrategiesByContextField',
                    responses: {
                        200: createResponseSchema(
                            'contextFieldStrategiesSchema',
                        ),
                    },
                }),
            ],
        });
    }

    private getWorkspaceId(req: Request<{ workspaceId: string }>): number {
        const workspaceId = req.params.workspaceId;
        return Number(workspaceId);
    }

    async getContextFields(
        req: Request<{ workspaceId: string }>,
        res: Response<ContextFieldsSchema>,
    ): Promise<void> {
        const workspaceId = this.getWorkspaceId(req);
        const fields =
            await this.transactionalContextService.getAll(workspaceId);

        res.status(200).json(serializeDates(fields)).end();
    }

    async getContextField(
        req: Request<ContextParam>,
        res: Response<ContextFieldSchema>,
    ): Promise<void> {
        const { contextField } = req.params;
        const workspaceId = this.getWorkspaceId(req);

        const field = await this.transactionalContextService.getContextField(
            contextField,
            workspaceId,
        );

        if (!field) {
            throw new NotFoundError(
                `Could not find context field with name ${contextField}`,
            );
        }

        this.openApiService.respondWithValidation(
            200,
            res,
            contextFieldSchema.$id,
            serializeDates(field),
        );
    }

    async createContextField(
        req: IAuthRequest<
            { workspaceId: string },
            void,
            CreateContextFieldSchema
        >,
        res: Response<ContextFieldSchema>,
    ): Promise<void> {
        const workspaceId = this.getWorkspaceId(req);

        const created = await this.transactionalContextService.transactional(
            (service) =>
                service.createContextField(req.body, req.audit, workspaceId),
        );

        this.openApiService.respondWithValidation(
            201,
            res,
            contextFieldSchema.$id,
            serializeDates(created),
            { location: `context/${created.name}` },
        );
    }

    async updateContextField(
        req: IAuthRequest<ContextParam, void, UpdateContextFieldSchema>,
        res: Response,
    ): Promise<void> {
        const { contextField } = req.params;
        const workspaceId = this.getWorkspaceId(req);

        await this.transactionalContextService.transactional((service) =>
            service.updateContextField(
                { ...req.body, name: contextField },
                req.audit,
                workspaceId,
            ),
        );

        res.status(200).end();
    }

    async updateLegalValue(
        req: IAuthRequest<ContextParam, void, LegalValueSchema>,
        res: Response,
    ): Promise<void> {
        const { contextField } = req.params;
        const workspaceId = this.getWorkspaceId(req);

        await this.transactionalContextService.transactional((service) =>
            service.updateLegalValue(
                { name: contextField, legalValue: req.body },
                req.audit,
                workspaceId,
            ),
        );

        res.status(200).end();
    }

    async deleteLegalValue(
        req: IAuthRequest<DeleteLegalValueParam, void>,
        res: Response,
    ): Promise<void> {
        const { contextField, legalValue } = req.params;
        const workspaceId = this.getWorkspaceId(req);

        await this.transactionalContextService.transactional((service) =>
            service.deleteLegalValue(
                { name: contextField, legalValue },
                req.audit,
                workspaceId,
            ),
        );

        res.status(200).end();
    }

    async deleteContextField(
        req: IAuthRequest<ContextParam>,
        res: Response,
    ): Promise<void> {
        const { contextField } = req.params;
        const workspaceId = this.getWorkspaceId(req);

        await this.transactionalContextService.transactional((service) =>
            service.deleteContextField(contextField, req.audit, workspaceId),
        );

        res.status(200).end();
    }

    async validate(
        req: Request<{ workspaceId: string }, void, NameSchema>,
        res: Response,
    ): Promise<void> {
        const workspaceId = this.getWorkspaceId(req);
        await this.transactionalContextService.validateName(
            req.body.name,
            workspaceId,
        );

        res.status(200).end();
    }

    async getStrategiesByContextField(
        req: IAuthRequest<{ contextField: string; workspaceId: string }>,
        res: Response<ContextFieldStrategiesSchema>,
    ): Promise<void> {
        const { contextField } = req.params;
        const workspaceId = this.getWorkspaceId(req);
        const userId = extractUserIdFromUser(req.user);

        const data =
            await this.transactionalContextService.getStrategiesByContextField(
                contextField,
                userId,
                workspaceId,
            );

        this.openApiService.respondWithValidation(
            200,
            res,
            contextFieldStrategiesSchema.$id,
            serializeDates(data),
        );
    }
}

import type { Request, Response } from 'express';

import Controller from '../../routes/controller';

import {
    CREATE_CONTEXT_FIELD,
    UPDATE_CONTEXT_FIELD,
    DELETE_CONTEXT_FIELD,
    NONE,
} from '../../types/permissions';
import type { IUnleashConfig } from '../../types/option';
import type { IUnleashServices } from '../../types/services';
import type ContextService from './context-service';
import type { Logger } from '../../logger';
import type { IAuthRequest } from '../../routes/unleash-types';

import type { OpenApiService } from '../../services/openapi-service';
import {
    contextFieldSchema,
    type ContextFieldSchema,
} from '../../openapi/spec/context-field-schema';
import type { ContextFieldsSchema } from '../../openapi/spec/context-fields-schema';
import { createRequestSchema } from '../../openapi/util/create-request-schema';
import {
    createResponseSchema,
    resourceCreatedResponseSchema,
} from '../../openapi/util/create-response-schema';
import { serializeDates } from '../../types/serialize-dates';
import NotFoundError from '../../error/notfound-error';
import type { NameSchema } from '../../openapi/spec/name-schema';
import {
    emptyResponse,
    getStandardResponses,
} from '../../openapi/util/standard-responses';
import {
    type ContextFieldStrategiesSchema,
    contextFieldStrategiesSchema,
} from '../../openapi/spec/context-field-strategies-schema';
import type { UpdateContextFieldSchema } from '../../openapi/spec/update-context-field-schema';
import type { CreateContextFieldSchema } from '../../openapi/spec/create-context-field-schema';
import { extractUserIdFromUser } from '../../util';
import type { LegalValueSchema } from '../../openapi';
import type { WithTransactional } from '../../db/transaction';

interface ContextParam {
    contextField: string;
    workspaceId?: string;
}

interface DeleteLegalValueParam extends ContextParam {
    legalValue: string;
}

export class ContextController extends Controller {
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
        this.logger = config.getLogger('/admin-api/context.ts');
        this.transactionalContextService = transactionalContextService;

        this.route({
            method: 'get',
            path: '',
            handler: this.getContextFields,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Context'],
                    summary: 'Gets configured context fields',
                    description: 'Returns all configured [Context fields]...',
                    parameters: [
                        {
                            in: 'path',
                            name: 'workspaceId',
                            schema: {
                                type: 'string',
                            },
                            required: false,
                            description: 'Optional workspace ID',
                        },
                    ],
                    operationId: 'getContextFields',
                    responses: {
                        200: createResponseSchema('contextFieldsSchema'),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/:contextField',
            handler: this.getContextField,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Context'],
                    summary: 'Gets context field',
                    parameters: [
                        {
                            in: 'path',
                            name: 'workspaceId',
                            schema: {
                                type: 'string',
                            },
                            required: false,
                            description: 'Optional workspace ID',
                        },
                    ],
                    description:
                        'Returns specific [context field](https://docs.getunleash.io/reference/unleash-context) identified by the name in the path',
                    operationId: 'getContextField',
                    responses: {
                        200: createResponseSchema('contextFieldSchema'),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/:contextField/strategies',
            handler: this.getStrategiesByContextField,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Strategies'],
                    operationId: 'getStrategiesByContextField',
                    summary: 'Get strategies that use a context field',
                    parameters: [
                        {
                            in: 'path',
                            name: 'workspaceId',
                            schema: {
                                type: 'string',
                            },
                            required: false,
                            description: 'Optional workspace ID',
                        },
                    ],
                    description:
                        "Retrieves a list of all strategies that use the specified context field. If the context field doesn't exist, returns an empty list of strategies",
                    responses: {
                        200: createResponseSchema(
                            'contextFieldStrategiesSchema',
                        ),
                        ...getStandardResponses(401),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '',
            handler: this.createContextField,
            permission: CREATE_CONTEXT_FIELD,
            middleware: [
                openApiService.validPath({
                    tags: ['Context'],
                    operationId: 'createContextField',
                    summary: 'Create a context field',
                    parameters: [
                        {
                            in: 'path',
                            name: 'workspaceId',
                            schema: {
                                type: 'string',
                            },
                            required: false,
                            description: 'Optional workspace ID',
                        },
                    ],
                    description:
                        'Endpoint that allows creation of [custom context fields](https://docs.getunleash.io/reference/unleash-context#custom-context-fields)',
                    requestBody: createRequestSchema(
                        'createContextFieldSchema',
                    ),
                    responses: {
                        201: resourceCreatedResponseSchema(
                            'contextFieldSchema',
                        ),
                    },
                }),
            ],
        });

        this.route({
            method: 'put',
            path: '/:contextField',
            handler: this.updateContextField,
            permission: UPDATE_CONTEXT_FIELD,
            middleware: [
                openApiService.validPath({
                    tags: ['Context'],
                    summary: 'Update an existing context field',
                    description: `Endpoint that allows updating a custom context field. Used to toggle stickiness and add/remove legal values for this context field`,
                    parameters: [
                        {
                            in: 'path',
                            name: 'workspaceId',
                            schema: {
                                type: 'string',
                            },
                            required: false,
                            description: 'Optional workspace ID',
                        },
                    ],
                    operationId: 'updateContextField',
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
            path: '/:contextField/legal-values',
            handler: this.updateLegalValue,
            permission: UPDATE_CONTEXT_FIELD,
            middleware: [
                openApiService.validPath({
                    tags: ['Context'],
                    summary: 'Add or update legal value for the context field',
                    description: `Endpoint that allows adding or updating a single custom context field legal value. If the legal value already exists, it will be updated with the new description`,
                    parameters: [
                        {
                            in: 'path',
                            name: 'workspaceId',
                            schema: {
                                type: 'string',
                            },
                            required: false,
                            description: 'Optional workspace ID',
                        },
                    ],
                    operationId: 'updateContextFieldLegalValue',
                    requestBody: createRequestSchema('legalValueSchema'),
                    responses: {
                        200: emptyResponse,
                    },
                }),
            ],
        });

        this.route({
            method: 'delete',
            path: '/:contextField/legal-values/:legalValue',
            handler: this.deleteLegalValue,
            acceptAnyContentType: true,
            permission: UPDATE_CONTEXT_FIELD,
            middleware: [
                openApiService.validPath({
                    tags: ['Context'],
                    summary: 'Delete legal value for the context field',
                    parameters: [
                        {
                            in: 'path',
                            name: 'workspaceId',
                            schema: {
                                type: 'string',
                            },
                            required: false,
                            description: 'Optional workspace ID',
                        },
                    ],
                    description: `Removes the specified custom context field legal value. Does not validate that the legal value is not in use and does not remove usage from constraints that use it.`,
                    operationId: 'deleteContextFieldLegalValue',
                    responses: {
                        200: emptyResponse,
                    },
                }),
            ],
        });

        this.route({
            method: 'delete',
            path: '/:contextField',
            handler: this.deleteContextField,

            acceptAnyContentType: true,
            permission: DELETE_CONTEXT_FIELD,
            middleware: [
                openApiService.validPath({
                    tags: ['Context'],
                    summary: 'Delete an existing context field',
                    parameters: [
                        {
                            in: 'path',
                            name: 'workspaceId',
                            schema: {
                                type: 'string',
                            },
                            required: false,
                            description: 'Optional workspace ID',
                        },
                    ],
                    description:
                        'Endpoint that allows deletion of a custom context field. Does not validate that context field is not in use, but since context field configuration is stored in a json blob for the strategy, existing strategies are safe.',
                    operationId: 'deleteContextField',
                    responses: {
                        200: emptyResponse,
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '/validate',
            handler: this.validate,
            permission: UPDATE_CONTEXT_FIELD,
            middleware: [
                openApiService.validPath({
                    tags: ['Context'],
                    summary: 'Validate a context field',
                    parameters: [
                        {
                            in: 'path',
                            name: 'workspaceId',
                            schema: {
                                type: 'string',
                            },
                            required: false,
                            description: 'Optional workspace ID',
                        },
                    ],
                    description:
                        'Check whether the provided data can be used to create a context field. If the data is not valid, ...?',
                    operationId: 'validate',
                    requestBody: createRequestSchema('nameSchema'),
                    responses: {
                        200: emptyResponse,
                    },
                }),
            ],
        });
    }

    private getWorkspaceId(req: Request<{ workspaceId?: string }>): number {
        const workspaceId = req.params.workspaceId;
        return workspaceId ? Number(workspaceId) : 1;
    }

    async getContextFields(
        req: Request<{ workspaceId?: string }>,
        res: Response<ContextFieldsSchema>,
    ): Promise<void> {
        const workspaceId = this.getWorkspaceId(req);
        console.log('HIT', workspaceId);
        res.status(200)
            .json(
                serializeDates(
                    await this.transactionalContextService.getAll(workspaceId),
                ),
            )
            .end();
    }

    async getContextField(
        req: Request<ContextParam>,
        res: Response<ContextFieldSchema>,
    ): Promise<void> {
        try {
            const name = req.params.contextField;
            const workspaceId = this.getWorkspaceId(req);
            const contextField =
                await this.transactionalContextService.getContextField(
                    name,
                    workspaceId,
                );
            this.openApiService.respondWithValidation(
                200,
                res,
                contextFieldSchema.$id,
                serializeDates(contextField),
            );
        } catch (err) {
            throw new NotFoundError('Could not find context field');
        }
    }

    async createContextField(
        req: IAuthRequest<
            { workspaceId?: string },
            void,
            CreateContextFieldSchema
        >,
        res: Response<ContextFieldSchema>,
    ): Promise<void> {
        const value = req.body;
        const workspaceId = this.getWorkspaceId(req);

        const result = await this.transactionalContextService.transactional(
            (service) =>
                service.createContextField(value, req.audit, workspaceId),
        );

        this.openApiService.respondWithValidation(
            201,
            res,
            contextFieldSchema.$id,
            serializeDates(result),
            { location: `context/${result.name}` },
        );
    }

    async updateContextField(
        req: IAuthRequest<ContextParam, void, UpdateContextFieldSchema>,
        res: Response,
    ): Promise<void> {
        const name = req.params.contextField;
        const contextField = req.body;
        const workspaceId = this.getWorkspaceId(req);

        await this.transactionalContextService.transactional((service) =>
            service.updateContextField(
                { ...contextField, name },
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
        const name = req.params.contextField;
        const legalValue = req.body;
        const workspaceId = this.getWorkspaceId(req);

        await this.transactionalContextService.transactional((service) =>
            service.updateLegalValue(
                { name, legalValue },
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
        const name = req.params.contextField;
        const legalValue = req.params.legalValue;
        const workspaceId = this.getWorkspaceId(req);

        await this.transactionalContextService.transactional((service) =>
            service.deleteLegalValue(
                { name, legalValue },
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
        const name = req.params.contextField;
        const workspaceId = this.getWorkspaceId(req);

        await this.transactionalContextService.transactional((service) =>
            service.deleteContextField(name, req.audit, workspaceId),
        );
        res.status(200).end();
    }

    async validate(
        req: Request<{ workspaceId?: string }, void, NameSchema>,
        res: Response,
    ): Promise<void> {
        const { name } = req.body;
        const workspaceId = this.getWorkspaceId(req);

        await this.transactionalContextService.validateName(name, workspaceId);
        res.status(200).end();
    }

    async getStrategiesByContextField(
        req: IAuthRequest<{ contextField: string; workspaceId?: string }>,
        res: Response<ContextFieldStrategiesSchema>,
    ): Promise<void> {
        const { contextField } = req.params;
        const { user } = req;
        const workspaceId = this.getWorkspaceId(req);

        const contextFields =
            await this.transactionalContextService.getStrategiesByContextField(
                contextField,
                extractUserIdFromUser(user),
                workspaceId,
            );

        this.openApiService.respondWithValidation(
            200,
            res,
            contextFieldStrategiesSchema.$id,
            serializeDates(contextFields),
        );
    }
}

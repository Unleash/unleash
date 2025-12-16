import type { Request, Response } from 'express';

import Controller from '../../routes/controller.js';

import {
    CREATE_CONTEXT_FIELD,
    UPDATE_CONTEXT_FIELD,
    DELETE_CONTEXT_FIELD,
    NONE,
    UPDATE_PROJECT,
} from '../../types/permissions.js';
import type { IUnleashConfig } from '../../types/option.js';
import type { IUnleashServices } from '../../services/index.js';
import type ContextService from './context-service.js';
import type { IAuthRequest } from '../../routes/unleash-types.js';

import type { OpenApiService } from '../../services/openapi-service.js';
import {
    contextFieldSchema,
    type ContextFieldSchema,
} from '../../openapi/spec/context-field-schema.js';
import type { ContextFieldsSchema } from '../../openapi/spec/context-fields-schema.js';
import { createRequestSchema } from '../../openapi/util/create-request-schema.js';
import {
    createResponseSchema,
    resourceCreatedResponseSchema,
} from '../../openapi/util/create-response-schema.js';
import { serializeDates } from '../../types/serialize-dates.js';
import NotFoundError from '../../error/notfound-error.js';
import type { NameSchema } from '../../openapi/spec/name-schema.js';
import {
    emptyResponse,
    getStandardResponses,
} from '../../openapi/util/standard-responses.js';
import {
    type ContextFieldStrategiesSchema,
    contextFieldStrategiesSchema,
} from '../../openapi/spec/context-field-strategies-schema.js';
import type { UpdateContextFieldSchema } from '../../openapi/spec/update-context-field-schema.js';
import type { CreateContextFieldSchema } from '../../openapi/spec/create-context-field-schema.js';
import { extractUserIdFromUser } from '../../util/index.js';
import type { LegalValueSchema } from '../../openapi/index.js';
import type { WithTransactional } from '../../db/transaction.js';

interface ContextParam {
    contextField: string;
}

interface DeleteLegalValueParam extends ContextParam {
    legalValue: string;
}

export class ContextController extends Controller {
    private transactionalContextService: WithTransactional<ContextService>;

    private openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        {
            transactionalContextService,
            openApiService,
        }: Pick<
            IUnleashServices,
            'transactionalContextService' | 'openApiService'
        >,
        prefix = '',
    ) {
        super(config);
        this.openApiService = openApiService;
        this.transactionalContextService = transactionalContextService;

        this.route({
            method: 'get',
            path: prefix,
            handler: this.getContextFields,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Context'],
                    summary: 'Gets configured context fields',
                    description:
                        'Returns all configured [Context fields](https://docs.getunleash.io/concepts/unleash-context) that have been created.',
                    operationId: 'getContextFields',
                    responses: {
                        200: createResponseSchema('contextFieldsSchema'),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: `${prefix}/:contextField`,
            handler: this.getContextField,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Context'],
                    summary: 'Gets context field',
                    description:
                        'Returns specific [context field](https://docs.getunleash.io/concepts/unleash-context) identified by the name in the path',
                    operationId: 'getContextField',
                    responses: {
                        200: createResponseSchema('contextFieldSchema'),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: `${prefix}/:contextField/strategies`,
            handler: this.getStrategiesByContextField,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Strategies'],
                    operationId: 'getStrategiesByContextField',
                    summary: 'Get strategies that use a context field',
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
            path: prefix,
            handler: this.createContextField,
            permission: [CREATE_CONTEXT_FIELD, UPDATE_PROJECT],
            middleware: [
                openApiService.validPath({
                    tags: ['Context'],
                    operationId: 'createContextField',
                    summary: 'Create a context field',
                    description:
                        'Endpoint that allows creation of [custom context fields](https://docs.getunleash.io/concepts/unleash-context#custom-context-fields)',
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
            path: `${prefix}/:contextField`,
            handler: this.updateContextField,
            permission: [UPDATE_CONTEXT_FIELD, UPDATE_PROJECT],
            middleware: [
                openApiService.validPath({
                    tags: ['Context'],
                    summary: 'Update an existing context field',
                    description: `Endpoint that allows updating a custom context field. Used to toggle stickiness and add/remove legal values for this context field`,
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
            path: `${prefix}/:contextField/legal-values`,
            handler: this.updateLegalValue,
            permission: [UPDATE_CONTEXT_FIELD, UPDATE_PROJECT],
            middleware: [
                openApiService.validPath({
                    tags: ['Context'],
                    summary: 'Add or update legal value for the context field',
                    description: `Endpoint that allows adding or updating a single custom context field legal value. If the legal value already exists, it will be updated with the new description`,
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
            path: `${prefix}/:contextField/legal-values/:legalValue`,
            handler: this.deleteLegalValue,
            acceptAnyContentType: true,
            permission: [UPDATE_CONTEXT_FIELD, UPDATE_PROJECT],
            middleware: [
                openApiService.validPath({
                    tags: ['Context'],
                    summary: 'Delete legal value for the context field',
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
            path: `${prefix}/:contextField`,
            handler: this.deleteContextField,
            acceptAnyContentType: true,
            permission: [DELETE_CONTEXT_FIELD, UPDATE_PROJECT],
            middleware: [
                openApiService.validPath({
                    tags: ['Context'],
                    summary: 'Delete an existing context field',
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
            path: `${prefix}/validate`,
            handler: this.validate,
            permission: [UPDATE_CONTEXT_FIELD, UPDATE_PROJECT],
            middleware: [
                openApiService.validPath({
                    tags: ['Context'],
                    summary: 'Validate a context field',
                    description:
                        'Check whether the provided data can be used to create a context field. If the data is not valid, returns a 400 status code with the reason why it is not valid.',
                    operationId: 'validate',
                    requestBody: createRequestSchema('nameSchema'),
                    responses: {
                        200: emptyResponse,
                    },
                }),
            ],
        });
    }

    async getContextFields(
        _req: Request,
        res: Response<ContextFieldsSchema>,
    ): Promise<void> {
        res.status(200)
            .json(
                serializeDates(await this.transactionalContextService.getAll()),
            )
            .end();
    }

    async getContextField(
        req: Request<ContextParam>,
        res: Response<ContextFieldSchema>,
    ): Promise<void> {
        try {
            const name = req.params.contextField;
            const contextField =
                await this.transactionalContextService.getContextField(name);
            this.openApiService.respondWithValidation(
                200,
                res,
                contextFieldSchema.$id,
                serializeDates(contextField),
            );
        } catch (_err) {
            throw new NotFoundError('Could not find context field');
        }
    }

    async createContextField(
        req: IAuthRequest<
            { projectId?: string },
            void,
            CreateContextFieldSchema
        >,
        res: Response<ContextFieldSchema>,
    ): Promise<void> {
        const value = req.body;

        const result = await this.transactionalContextService.transactional(
            (service) =>
                service.createContextField(
                    { ...value, project: req.params.projectId },
                    req.audit,
                ),
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

        await this.transactionalContextService.transactional((service) =>
            service.updateContextField({ ...contextField, name }, req.audit),
        );
        res.status(200).end();
    }

    async updateLegalValue(
        req: IAuthRequest<ContextParam, void, LegalValueSchema>,
        res: Response,
    ): Promise<void> {
        const name = req.params.contextField;
        const legalValue = req.body;

        await this.transactionalContextService.transactional((service) =>
            service.updateLegalValue({ name, legalValue }, req.audit),
        );
        res.status(200).end();
    }

    async deleteLegalValue(
        req: IAuthRequest<DeleteLegalValueParam, void>,
        res: Response,
    ): Promise<void> {
        const name = req.params.contextField;
        const legalValue = req.params.legalValue;

        await this.transactionalContextService.transactional((service) =>
            service.deleteLegalValue({ name, legalValue }, req.audit),
        );
        res.status(200).end();
    }

    async deleteContextField(
        req: IAuthRequest<ContextParam>,
        res: Response,
    ): Promise<void> {
        const name = req.params.contextField;

        await this.transactionalContextService.transactional((service) =>
            service.deleteContextField(name, req.audit),
        );
        res.status(200).end();
    }

    async validate(
        req: Request<void, void, NameSchema>,
        res: Response,
    ): Promise<void> {
        const { name } = req.body;

        await this.transactionalContextService.validateName(name);
        res.status(200).end();
    }

    async getStrategiesByContextField(
        req: IAuthRequest<{ contextField: string }>,
        res: Response<ContextFieldStrategiesSchema>,
    ): Promise<void> {
        const { contextField } = req.params;
        const { user } = req;
        const contextFields =
            await this.transactionalContextService.getStrategiesByContextField(
                contextField,
                extractUserIdFromUser(user),
            );

        this.openApiService.respondWithValidation(
            200,
            res,
            contextFieldStrategiesSchema.$id,
            serializeDates(contextFields),
        );
    }
}

import type { Request, Response } from 'express';

import Controller from '../controller';

import {
    CREATE_CONTEXT_FIELD,
    UPDATE_CONTEXT_FIELD,
    DELETE_CONTEXT_FIELD,
    NONE,
} from '../../types/permissions';
import type { IUnleashConfig } from '../../types/option';
import type { IUnleashServices } from '../../types/services';
import type ContextService from '../../services/context-service';
import type { Logger } from '../../logger';
import type { IAuthRequest } from '../unleash-types';

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

interface ContextParam {
    contextField: string;
}

export class ContextController extends Controller {
    private contextService: ContextService;

    private openApiService: OpenApiService;

    private logger: Logger;

    constructor(
        config: IUnleashConfig,
        {
            contextService,
            openApiService,
        }: Pick<IUnleashServices, 'contextService' | 'openApiService'>,
    ) {
        super(config);
        this.openApiService = openApiService;
        this.logger = config.getLogger('/admin-api/context.ts');
        this.contextService = contextService;

        this.route({
            method: 'get',
            path: '',
            handler: this.getContextFields,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Context'],
                    summary: 'Gets configured context fields',
                    description:
                        'Returns all configured [Context fields](https://docs.getunleash.io/how-to/how-to-define-custom-context-fields) that have been created.',
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
            method: 'delete',
            path: '/:contextField',
            handler: this.deleteContextField,
            acceptAnyContentType: true,
            permission: DELETE_CONTEXT_FIELD,
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
            path: '/validate',
            handler: this.validate,
            permission: UPDATE_CONTEXT_FIELD,
            middleware: [
                openApiService.validPath({
                    tags: ['Context'],
                    summary: 'Validate a context field',
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

    async getContextFields(
        req: Request,
        res: Response<ContextFieldsSchema>,
    ): Promise<void> {
        res.status(200)
            .json(serializeDates(await this.contextService.getAll()))
            .end();
    }

    async getContextField(
        req: Request<ContextParam>,
        res: Response<ContextFieldSchema>,
    ): Promise<void> {
        try {
            const name = req.params.contextField;
            const contextField =
                await this.contextService.getContextField(name);
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
        req: IAuthRequest<void, void, CreateContextFieldSchema>,
        res: Response<ContextFieldSchema>,
    ): Promise<void> {
        const value = req.body;

        const result = await this.contextService.createContextField(
            value,
            req.audit,
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

        await this.contextService.updateContextField(
            { ...contextField, name },
            req.audit,
        );
        res.status(200).end();
    }

    async deleteContextField(
        req: IAuthRequest<ContextParam>,
        res: Response,
    ): Promise<void> {
        const name = req.params.contextField;

        await this.contextService.deleteContextField(name, req.audit);
        res.status(200).end();
    }

    async validate(
        req: Request<void, void, NameSchema>,
        res: Response,
    ): Promise<void> {
        const { name } = req.body;

        await this.contextService.validateName(name);
        res.status(200).end();
    }

    async getStrategiesByContextField(
        req: IAuthRequest<{ contextField: string }>,
        res: Response<ContextFieldStrategiesSchema>,
    ): Promise<void> {
        const { contextField } = req.params;
        const { user } = req;
        const contextFields =
            await this.contextService.getStrategiesByContextField(
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

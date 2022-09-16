import { Request, Response } from 'express';

import Controller from '../controller';

import { extractUsername } from '../../util/extract-user';

import {
    CREATE_CONTEXT_FIELD,
    UPDATE_CONTEXT_FIELD,
    DELETE_CONTEXT_FIELD,
    NONE,
} from '../../types/permissions';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import ContextService from '../../services/context-service';
import { Logger } from '../../logger';
import { IAuthRequest } from '../unleash-types';

import { OpenApiService } from '../../services/openapi-service';
import {
    contextFieldSchema,
    ContextFieldSchema,
} from '../../openapi/spec/context-field-schema';
import { ContextFieldsSchema } from '../../openapi/spec/context-fields-schema';
import { UpsertContextFieldSchema } from '../../openapi/spec/upsert-context-field-schema';
import { createRequestSchema } from '../../openapi/util/create-request-schema';
import {
    createResponseSchema,
    resourceCreatedResponseSchema,
} from '../../openapi/util/create-response-schema';
import { serializeDates } from '../../types/serialize-dates';
import NotFoundError from '../../error/notfound-error';
import { NameSchema } from '../../openapi/spec/name-schema';
import { emptyResponse } from '../../openapi/util/standard-responses';

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
                    operationId: 'getContextField',
                    responses: {
                        200: createResponseSchema('contextFieldSchema'),
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
                    requestBody: createRequestSchema(
                        'upsertContextFieldSchema',
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
                    operationId: 'updateContextField',
                    requestBody: createRequestSchema(
                        'upsertContextFieldSchema',
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
            const contextField = await this.contextService.getContextField(
                name,
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
        req: IAuthRequest<void, void, UpsertContextFieldSchema>,
        res: Response<ContextFieldSchema>,
    ): Promise<void> {
        const value = req.body;
        const userName = extractUsername(req);

        const result = await this.contextService.createContextField(
            value,
            userName,
        );
        res.status(201)
            .header('location', `context/${result.name}`)
            .json(serializeDates(result))
            .end();
    }

    async updateContextField(
        req: IAuthRequest<ContextParam, void, UpsertContextFieldSchema>,
        res: Response,
    ): Promise<void> {
        const name = req.params.contextField;
        const userName = extractUsername(req);
        const contextField = req.body;

        contextField.name = name;

        await this.contextService.updateContextField(contextField, userName);
        res.status(200).end();
    }

    async deleteContextField(
        req: IAuthRequest<ContextParam>,
        res: Response,
    ): Promise<void> {
        const name = req.params.contextField;
        const userName = extractUsername(req);

        await this.contextService.deleteContextField(name, userName);
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
}

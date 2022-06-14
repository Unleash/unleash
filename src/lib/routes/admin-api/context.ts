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
import { ContextSchema } from '../../openapi/spec/context-schema';
import { createResponseSchema } from '../../openapi';
import { serializeDates } from 'lib/types/serialize-dates';

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
                    tags: ['admin'],
                    operationId: 'getContextFields',
                    responses: {
                        200: createResponseSchema('contextSchema'),
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
                    tags: ['admin'],
                    operationId: 'createContextField',
                    responses: {
                        200: createResponseSchema('contextSchema'),
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
                    tags: ['admin'],
                    operationId: 'getContextField',
                    responses: {
                        200: createResponseSchema('contextSchema'),
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
                    tags: ['admin'],
                    operationId: 'updateContextField',
                    responses: {
                        200: createResponseSchema('contextSchema'),
                    },
                }),
            ],
        });

        this.route({
            method: 'delete',
            path: '/:contextField',
            handler: this.deleteContextField,
            permission: DELETE_CONTEXT_FIELD,
            middleware: [
                openApiService.validPath({
                    tags: ['admin'],
                    operationId: 'deleteContextField',
                    responses: {
                        200: createResponseSchema('contextSchema'),
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
                    tags: ['admin'],
                    operationId: 'validate',
                    responses: {
                        200: createResponseSchema('contextSchema'),
                    },
                }),
            ],
        });
    }

    async getContextFields(
        req: Request,
        res: Response<ContextSchema[]>,
    ): Promise<void> {
        res.status(200)
            .json(serializeDates(await this.contextService.getAll()))
            .end();
    }

    async getContextField(
        req: Request<ContextParam>,
        res: Response<ContextSchema>,
    ): Promise<void> {
        try {
            const name = req.params.contextField;
            const contextField = await this.contextService.getContextField(
                name,
            );
            res.json(serializeDates(contextField)).end();
        } catch (err) {
            res.status(404).json({ error: 'Could not find context field' });
        }
    }

    async createContextField(req: IAuthRequest, res: Response): Promise<void> {
        const value = req.body;
        const userName = extractUsername(req);

        await this.contextService.createContextField(value, userName);
        res.status(201).end();
    }

    async updateContextField(
        req: IAuthRequest<ContextParam>,
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

    async validate(req: Request, res: Response): Promise<void> {
        const { name } = req.body;

        await this.contextService.validateName(name);
        res.status(200).end();
    }
}

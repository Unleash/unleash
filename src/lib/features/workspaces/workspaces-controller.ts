import type { Request, Response } from 'express';
import Controller from '../../routes/controller';
import { ADMIN } from '../../types/permissions';
import type { IUnleashConfig } from '../../types/option';
import type { IUnleashServices } from '../../types/services';
import type { Logger } from '../../logger';
import type { IAuthRequest } from '../../routes/unleash-types';
import type { OpenApiService } from '../../services/openapi-service';
import { createRequestSchema } from '../../openapi/util/create-request-schema';
import {
    createResponseSchema,
    resourceCreatedResponseSchema,
} from '../../openapi/util/create-response-schema';
import { serializeDates } from '../../types/serialize-dates';
import NotFoundError from '../../error/notfound-error';
import {
    emptyResponse,
    getStandardResponses,
} from '../../openapi/util/standard-responses';
import {
    workspaceSchema,
    type WorkspaceSchema,
} from '../../openapi/spec/workspace-schema';

import type { WorkspacesService } from './workspaces-service';
import type { CreateWorkspaceSchema } from '../../openapi/spec/create-workspace-schema';
import type { UpdateWorkspaceSchema } from '../../openapi/spec/update-workspace-schema';

interface WorkspaceParam {
    id: string;
}

export class WorkspacesController extends Controller {
    private logger: Logger;
    private openApiService: OpenApiService;
    private workspacesService: WorkspacesService;

    constructor(
        config: IUnleashConfig,
        {
            workspacesService,
            openApiService,
        }: Pick<IUnleashServices, 'workspacesService' | 'openApiService'>,
    ) {
        super(config);
        this.logger = config.getLogger('workspaces-controller.ts');
        this.openApiService = openApiService;
        this.workspacesService = workspacesService;

        this.route({
            method: 'get',
            path: '',
            handler: this.getWorkspaces,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Workspaces'],
                    summary: 'Get all workspaces',
                    description: 'Retrieves all workspaces.',
                    operationId: 'getWorkspaces',
                    responses: {
                        200: createResponseSchema('workspacesSchema'),
                        ...getStandardResponses(401),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/:id',
            handler: this.getWorkspace,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Workspaces'],
                    summary: 'Get workspace by id',
                    description: 'Retrieves a specific workspace by ID',
                    operationId: 'getWorkspace',
                    responses: {
                        200: createResponseSchema('workspaceSchema'),
                        ...getStandardResponses(401, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '',
            handler: this.createWorkspace,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Workspaces'],
                    summary: 'Create workspace',
                    description: 'Creates a new workspace',
                    operationId: 'createWorkspace',
                    requestBody: createRequestSchema('createWorkspaceSchema'),
                    responses: {
                        201: resourceCreatedResponseSchema('workspaceSchema'),
                        ...getStandardResponses(401),
                    },
                }),
            ],
        });

        this.route({
            method: 'put',
            path: '/:id',
            handler: this.updateWorkspace,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Workspaces'],
                    summary: 'Update workspace',
                    description: 'Updates an existing workspace',
                    operationId: 'updateWorkspace',
                    requestBody: createRequestSchema('updateWorkspaceSchema'),
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(401, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'delete',
            path: '/:id',
            handler: this.deleteWorkspace,
            permission: ADMIN,
            acceptAnyContentType: true,
            middleware: [
                openApiService.validPath({
                    tags: ['Workspaces'],
                    summary: 'Delete workspace',
                    description: 'Deletes a workspace',
                    operationId: 'deleteWorkspace',
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(401, 404),
                    },
                }),
            ],
        });
    }

    async getWorkspaces(
        req: Request,
        res: Response<WorkspaceSchema[]>,
    ): Promise<void> {
        const workspaces = await this.workspacesService.getAll();
        res.json(serializeDates(workspaces));
    }

    async getWorkspace(
        req: Request<WorkspaceParam>,
        res: Response<WorkspaceSchema>,
    ): Promise<void> {
        try {
            const workspace = await this.workspacesService.get(
                Number(req.params.id),
            );
            this.openApiService.respondWithValidation(
                200,
                res,
                workspaceSchema.$id,
                serializeDates(workspace),
            );
        } catch (err) {
            throw new NotFoundError('Could not find workspace');
        }
    }

    async createWorkspace(
        req: IAuthRequest<void, void, CreateWorkspaceSchema>,
        res: Response<WorkspaceSchema>,
    ): Promise<void> {
        const workspace = await this.workspacesService.create(
            req.body,
            req.audit,
        );
        this.openApiService.respondWithValidation(
            201,
            res,
            workspaceSchema.$id,
            serializeDates(workspace),
            { location: `workspaces/${workspace.id}` },
        );
    }

    async updateWorkspace(
        req: IAuthRequest<WorkspaceParam, void, UpdateWorkspaceSchema>,
        res: Response,
    ): Promise<void> {
        await this.workspacesService.update(
            Number(req.params.id),
            req.body,
            req.audit,
        );
        res.status(200).end();
    }

    async deleteWorkspace(
        req: IAuthRequest<WorkspaceParam>,
        res: Response,
    ): Promise<void> {
        await this.workspacesService.delete(Number(req.params.id), req.audit);
        res.status(200).end();
    }
}

export default WorkspacesController;

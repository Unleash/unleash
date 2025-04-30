import type { Response } from 'express';
import Controller from '../../routes/controller.js';
import {
    type IFlagResolver,
    type IProjectParam,
    type IUnleashConfig,
    NONE,
    serializeDates,
} from '../../types/index.js';

import { getStandardResponses } from '../../openapi/util/standard-responses.js';
import type { OpenApiService, IUnleashServices } from '../../services/index.js';
import type { IAuthRequest } from '../../routes/unleash-types.js';
import {
    createResponseSchema,
    projectStatusSchema,
    type ProjectStatusSchema,
} from '../../openapi/index.js';
import type { ProjectStatusService } from './project-status-service.js';

export default class ProjectStatusController extends Controller {
    private projectStatusService: ProjectStatusService;

    private openApiService: OpenApiService;

    private flagResolver: IFlagResolver;

    constructor(config: IUnleashConfig, services: IUnleashServices) {
        super(config);
        this.projectStatusService = services.projectStatusService;
        this.openApiService = services.openApiService;
        this.flagResolver = config.flagResolver;

        this.route({
            method: 'get',
            path: '/:projectId/status',
            handler: this.getProjectStatus,
            permission: NONE,
            middleware: [
                this.openApiService.validPath({
                    tags: ['Unstable'],
                    operationId: 'getProjectStatus',
                    summary: 'Get project status',
                    description:
                        'This endpoint returns information on the status the project, including activities, health, resources, and aggregated flag lifecycle data.',
                    responses: {
                        200: createResponseSchema('projectStatusSchema'),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });
    }

    async getProjectStatus(
        req: IAuthRequest<IProjectParam, unknown, unknown, unknown>,
        res: Response<ProjectStatusSchema>,
    ): Promise<void> {
        const { projectId } = req.params;
        const status: ProjectStatusSchema =
            await this.projectStatusService.getProjectStatus(projectId);

        this.openApiService.respondWithValidation(
            200,
            res,
            projectStatusSchema.$id,
            serializeDates(status),
        );
    }
}

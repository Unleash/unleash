import type { Response } from 'express';
import Controller from '../../routes/controller.js';
import {
    type IFlagResolver,
    type IProjectParam,
    type IUnleashConfig,
    NONE,
    serializeDates,
} from '../../types/index.js';
import type { ProjectInsightsService } from './project-insights-service.js';
import {
    createResponseSchema,
    projectInsightsSchema,
    type ProjectInsightsSchema,
} from '../../openapi/index.js';
import { getStandardResponses } from '../../openapi/util/standard-responses.js';
import type { IUnleashServices, OpenApiService } from '../../services/index.js';
import type { IAuthRequest } from '../../routes/unleash-types.js';

export default class ProjectInsightsController extends Controller {
    private projectInsightsService: ProjectInsightsService;

    private openApiService: OpenApiService;

    private flagResolver: IFlagResolver;

    constructor(config: IUnleashConfig, services: IUnleashServices) {
        super(config);
        this.projectInsightsService = services.projectInsightsService;
        this.openApiService = services.openApiService;
        this.flagResolver = config.flagResolver;

        // TODO: Remove in v8. This endpoint is deprecated and no longer used by the UI.
        this.route({
            method: 'get',
            path: '/:projectId/insights',
            handler: this.getProjectInsights,
            permission: NONE,
            middleware: [
                this.openApiService.validPath({
                    deprecated: true,
                    tags: ['Projects'],
                    operationId: 'getProjectInsights',
                    summary: 'Get an overview of a project insights.',
                    description:
                        'This endpoint returns insights into the specified projects stats, health, lead time for changes, feature types used, members and change requests.',
                    responses: {
                        200: createResponseSchema('projectInsightsSchema'),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });
    }

    async getProjectInsights(
        req: IAuthRequest<IProjectParam, unknown, unknown>,
        res: Response<ProjectInsightsSchema>,
    ): Promise<void> {
        const { projectId } = req.params;
        const insights =
            await this.projectInsightsService.getProjectInsights(projectId);

        this.openApiService.respondWithValidation(
            200,
            res,
            projectInsightsSchema.$id,
            serializeDates(insights),
        );
    }
}

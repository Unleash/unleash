import type { Request, Response } from 'express';
import Controller from '../../controller.js';
import type { IUnleashServices } from '../../../services/index.js';
import type { IUnleashConfig } from '../../../types/option.js';
import type ProjectHealthService from '../../../services/project-health-service.js';
import type { Logger } from '../../../logger.js';
import type { IProjectParam } from '../../../types/model.js';
import { NONE } from '../../../types/permissions.js';
import type { OpenApiService } from '../../../services/openapi-service.js';
import { createResponseSchema } from '../../../openapi/util/create-response-schema.js';
import { getStandardResponses } from '../../../openapi/util/standard-responses.js';
import { serializeDates } from '../../../types/serialize-dates.js';
import {
    healthReportSchema,
    type HealthReportSchema,
} from '../../../openapi/spec/health-report-schema.js';

export default class ProjectHealthReport extends Controller {
    private projectHealthService: ProjectHealthService;

    private openApiService: OpenApiService;

    private logger: Logger;

    constructor(
        config: IUnleashConfig,
        {
            projectHealthService,
            openApiService,
        }: Pick<IUnleashServices, 'projectHealthService' | 'openApiService'>,
    ) {
        super(config);
        this.logger = config.getLogger('/admin-api/project/health-report');
        this.projectHealthService = projectHealthService;
        this.openApiService = openApiService;

        this.route({
            method: 'get',
            path: '/:projectId/health-report',
            handler: this.getProjectHealthReport,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Projects'],
                    deprecated: true,
                    operationId: 'getProjectHealthReport',
                    summary: 'Get a health report for a project.',
                    description:
                        'This endpoint returns a health report for the specified project. This data is used for [the technical debt insights](https://docs.getunleash.io/concepts/technical-debt)',
                    responses: {
                        200: createResponseSchema('healthReportSchema'),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });
    }

    async getProjectHealthReport(
        req: Request<IProjectParam>,
        res: Response<HealthReportSchema>,
    ): Promise<void> {
        const { projectId } = req.params;
        const overview =
            await this.projectHealthService.getProjectHealthReport(projectId);
        this.openApiService.respondWithValidation(
            200,
            res,
            healthReportSchema.$id,
            serializeDates(overview),
        );
    }
}

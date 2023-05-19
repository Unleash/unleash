import { Request, Response } from 'express';
import Controller from '../../controller';
import { IUnleashServices } from '../../../types/services';
import { IUnleashConfig } from '../../../types/option';
import ProjectHealthService from '../../../services/project-health-service';
import { Logger } from '../../../logger';
import { IProjectParam } from '../../../types/model';
import { NONE } from '../../../types/permissions';
import { OpenApiService } from '../../../services/openapi-service';
import { createResponseSchema } from '../../../openapi/util/create-response-schema';
import { getStandardResponses } from '../../../openapi/util/standard-responses';
import { serializeDates } from '../../../types/serialize-dates';
import {
    healthReportSchema,
    HealthReportSchema,
} from '../../../openapi/spec/health-report-schema';

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
                    operationId: 'getProjectHealthReport',
                    summary: 'Get a health report for a project.',
                    description:
                        'This endpoint returns a health report for the specified project. This data is used for [the technical debt dashboard](https://docs.getunleash.io/reference/technical-debt#the-technical-debt-dashboard)',
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
        const overview = await this.projectHealthService.getProjectHealthReport(
            projectId,
        );
        this.openApiService.respondWithValidation(
            200,
            res,
            healthReportSchema.$id,
            serializeDates(overview),
        );
    }
}

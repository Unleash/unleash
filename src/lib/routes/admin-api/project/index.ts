import { Response } from 'express';
import Controller from '../../controller';
import { IUnleashConfig } from '../../../types/option';
import { IUnleashServices } from '../../../types/services';
import ProjectFeaturesController from './features';
import EnvironmentsController from './environments';
import ProjectHealthReport from './health-report';
import ProjectService from '../../../services/project-service';
import VariantsController from './variants';
import { NONE } from '../../../types/permissions';
import {
    projectsSchema,
    ProjectsSchema,
} from '../../../openapi/spec/projects-schema';
import { OpenApiService } from '../../../services/openapi-service';
import { serializeDates } from '../../../types/serialize-dates';
import { createResponseSchema } from '../../../openapi/util/create-response-schema';
import { IAuthRequest } from '../../unleash-types';
import {
    ProjectOverviewSchema,
    projectOverviewSchema,
} from '../../../../lib/openapi';
import { IArchivedQuery, IProjectParam } from '../../../types/model';

export default class ProjectApi extends Controller {
    private projectService: ProjectService;

    private openApiService: OpenApiService;

    constructor(config: IUnleashConfig, services: IUnleashServices) {
        super(config);
        this.projectService = services.projectService;
        this.openApiService = services.openApiService;

        this.route({
            path: '',
            method: 'get',
            handler: this.getProjects,
            permission: NONE,
            middleware: [
                services.openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'getProjects',
                    responses: {
                        200: createResponseSchema('projectsSchema'),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/:projectId',
            handler: this.getProjectOverview,
            permission: NONE,
            middleware: [
                services.openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'getProjectOverview',
                    responses: {
                        200: createResponseSchema('projectOverviewSchema'),
                    },
                }),
            ],
        });

        this.use('/', new ProjectFeaturesController(config, services).router);
        this.use('/', new EnvironmentsController(config, services).router);
        this.use('/', new ProjectHealthReport(config, services).router);
        this.use('/', new VariantsController(config, services).router);
    }

    async getProjects(
        req: IAuthRequest,
        res: Response<ProjectsSchema>,
    ): Promise<void> {
        const { user } = req;
        const projects = await this.projectService.getProjects(
            {
                id: 'default',
            },
            user.id,
        );

        this.openApiService.respondWithValidation(
            200,
            res,
            projectsSchema.$id,
            { version: 1, projects: serializeDates(projects) },
        );
    }

    async getProjectOverview(
        req: IAuthRequest<IProjectParam, unknown, unknown, IArchivedQuery>,
        res: Response<ProjectOverviewSchema>,
    ): Promise<void> {
        const { projectId } = req.params;
        const { archived } = req.query;
        const { user } = req;
        const overview = await this.projectService.getProjectOverview(
            projectId,
            archived,
            user.id,
        );
        this.openApiService.respondWithValidation(
            200,
            res,
            projectOverviewSchema.$id,
            serializeDates(overview),
        );
    }
}

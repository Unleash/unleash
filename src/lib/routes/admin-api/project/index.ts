import { Response } from 'express';
import Controller from '../../controller';
import {
    IArchivedQuery,
    IProjectParam,
    IUnleashConfig,
    IUnleashServices,
    NONE,
    serializeDates,
} from '../../../types';
import ProjectFeaturesController from './project-features';
import EnvironmentsController from './environments';
import ProjectHealthReport from './health-report';
import ProjectService from '../../../services/project-service';
import VariantsController from './variants';
import {
    createResponseSchema,
    ProjectOverviewSchema,
    projectOverviewSchema,
    projectsSchema,
    ProjectsSchema,
} from '../../../openapi';
import { getStandardResponses } from '../../../openapi/util/standard-responses';
import { OpenApiService, SettingService } from '../../../services';
import { IAuthRequest } from '../../unleash-types';
import { ProjectApiTokenController } from './api-token';
import ProjectArchiveController from './project-archive';

export default class ProjectApi extends Controller {
    private projectService: ProjectService;

    private settingService: SettingService;

    private openApiService: OpenApiService;

    constructor(config: IUnleashConfig, services: IUnleashServices) {
        super(config);
        this.projectService = services.projectService;
        this.openApiService = services.openApiService;
        this.settingService = services.settingService;

        this.route({
            path: '',
            method: 'get',
            handler: this.getProjects,
            permission: NONE,
            middleware: [
                services.openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'getProjects',
                    summary: 'Get a list of all projects.',
                    description:
                        'This endpoint returns an list of all the projects in the Unleash instance.',
                    responses: {
                        200: createResponseSchema('projectsSchema'),
                        ...getStandardResponses(401, 403),
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
                    summary: 'Get an overview of a project.',
                    description:
                        'This endpoint returns an overview of the specified project.',
                    responses: {
                        200: createResponseSchema('projectOverviewSchema'),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.use('/', new ProjectFeaturesController(config, services).router);
        this.use('/', new EnvironmentsController(config, services).router);
        this.use('/', new ProjectHealthReport(config, services).router);
        this.use('/', new VariantsController(config, services).router);
        this.use('/', new ProjectApiTokenController(config, services).router);
        this.use('/', new ProjectArchiveController(config, services).router);
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

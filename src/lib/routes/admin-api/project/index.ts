import { Response } from 'express';
import Controller from '../../controller';
import {
    IArchivedQuery,
    IProjectParam,
    IUnleashConfig,
    IUnleashServices,
    NONE,
    serializeDates,
    UPDATE_PROJECT,
} from '../../../types';
import ProjectFeaturesController from './project-features';
import EnvironmentsController from './environments';
import ProjectHealthReport from './health-report';
import ProjectService from '../../../services/project-service';
import VariantsController from './variants';
import {
    createResponseSchema,
    emptyResponse,
    ProjectOverviewSchema,
    projectOverviewSchema,
    ProjectSettingsSchema,
    projectSettingsSchema,
    projectsSchema,
    ProjectsSchema,
} from '../../../openapi';
import { OpenApiService, SettingService } from '../../../services';
import { IAuthRequest } from '../../unleash-types';
import { ProjectApiTokenController } from './api-token';
import ProjectArchiveController from './project-archive';
import NotFoundError from '../../../error/notfound-error';

const STICKINESS_KEY = 'stickiness';
const DEFAULT_STICKINESS = 'default';

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

        this.route({
            method: 'get',
            path: '/:projectId/settings',
            handler: this.getProjectSettings,
            permission: NONE,
            middleware: [
                services.openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'getProjectSettings',
                    responses: {
                        200: createResponseSchema('projectSettingsSchema'),
                        404: emptyResponse,
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '/:projectId/settings',
            handler: this.setProjectSettings,
            permission: UPDATE_PROJECT,
            middleware: [
                services.openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'setProjectSettings',
                    responses: {
                        200: createResponseSchema('projectSettingsSchema'),
                        404: emptyResponse,
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

    async getProjectSettings(
        req: IAuthRequest<IProjectParam, unknown, unknown, unknown>,
        res: Response<ProjectSettingsSchema>,
    ): Promise<void> {
        if (!this.config.flagResolver.isEnabled('projectScopedStickiness')) {
            throw new NotFoundError('Project scoped stickiness is not enabled');
        }
        const { projectId } = req.params;
        const stickinessSettings = await this.settingService.get<object>(
            STICKINESS_KEY,
            {
                [projectId]: 'default',
            },
        );
        this.openApiService.respondWithValidation(
            200,
            res,
            projectSettingsSchema.$id,
            { defaultStickiness: stickinessSettings[projectId] },
        );
    }

    async setProjectSettings(
        req: IAuthRequest<
            IProjectParam,
            ProjectSettingsSchema,
            ProjectSettingsSchema,
            unknown
        >,
        res: Response<ProjectSettingsSchema>,
    ): Promise<void> {
        if (!this.config.flagResolver.isEnabled('projectScopedStickiness')) {
            throw new NotFoundError('Project scoped stickiness is not enabled');
        }
        const { projectId } = req.params;
        const { defaultStickiness } = req.body;
        const stickinessSettings = await this.settingService.get<{}>(
            STICKINESS_KEY,
            {
                [projectId]: DEFAULT_STICKINESS,
            },
        );
        stickinessSettings[projectId] = defaultStickiness;
        await this.settingService.insert(
            STICKINESS_KEY,
            stickinessSettings,
            req.user.name,
        );

        this.openApiService.respondWithValidation(
            200,
            res,
            projectSettingsSchema.$id,
            { defaultStickiness },
        );
    }
}

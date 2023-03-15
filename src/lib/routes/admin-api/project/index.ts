import { Response } from 'express';
import Controller from '../../controller';
import { IUnleashConfig } from '../../../types/option';
import { IUnleashServices } from '../../../types/services';
import ProjectFeaturesController from './project-features';
import EnvironmentsController from './environments';
import ProjectHealthReport from './health-report';
import ProjectService from '../../../services/project-service';
import VariantsController from './variants';
import { NONE, UPDATE_PROJECT } from '../../../types/permissions';
import {
    projectsSchema,
    ProjectsSchema,
} from '../../../openapi/spec/projects-schema';
import { OpenApiService } from '../../../services/openapi-service';
import { serializeDates } from '../../../types/serialize-dates';
import { createResponseSchema } from '../../../openapi/util/create-response-schema';
import { IAuthRequest } from '../../unleash-types';
import {
    emptyResponse,
    ProjectOverviewSchema,
    projectOverviewSchema,
    stickinessSchema,
    StickinessSchema,
} from '../../../../lib/openapi';
import { IArchivedQuery, IProjectParam } from '../../../types/model';
import { ProjectApiTokenController } from './api-token';
import { SettingService } from '../../../services';
import ProjectArchiveController from './project-archive';

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
            path: '/:projectId/stickiness',
            handler: this.getProjectDefaultStickiness,
            permission: NONE,
            middleware: [
                services.openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'getProjectDefaultStickiness',
                    responses: {
                        200: createResponseSchema('stickinessSchema'),
                        404: emptyResponse,
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '/:projectId/stickiness',
            handler: this.setProjectDefaultStickiness,
            permission: UPDATE_PROJECT,
            middleware: [
                services.openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'setProjectDefaultStickiness',
                    responses: {
                        200: createResponseSchema('stickinessSchema'),
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

    async getProjectDefaultStickiness(
        req: IAuthRequest<IProjectParam, unknown, unknown, unknown>,
        res: Response<StickinessSchema>,
    ): Promise<void> {
        if (!this.config.flagResolver.isEnabled('projectScopedStickiness')) {
            res.status(404);
            return Promise.resolve();
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
            stickinessSchema.$id,
            { stickiness: stickinessSettings[projectId] },
        );
    }

    async setProjectDefaultStickiness(
        req: IAuthRequest<
            IProjectParam,
            StickinessSchema,
            StickinessSchema,
            unknown
        >,
        res: Response<StickinessSchema>,
    ): Promise<void> {
        if (!this.config.flagResolver.isEnabled('projectScopedStickiness')) {
            res.status(404);
            return Promise.resolve();
        }
        const { projectId } = req.params;
        const { stickiness } = req.body;
        const stickinessSettings = await this.settingService.get<{}>(
            STICKINESS_KEY,
            {
                [projectId]: DEFAULT_STICKINESS,
            },
        );
        stickinessSettings[projectId] = stickiness;
        await this.settingService.insert(
            STICKINESS_KEY,
            stickinessSettings,
            req.user.name,
        );

        this.openApiService.respondWithValidation(
            200,
            res,
            stickinessSchema.$id,
            { stickiness: stickiness },
        );
    }
}

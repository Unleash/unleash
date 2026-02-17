import type { Response } from 'express';
import Controller from '../../routes/controller.js';
import {
    type IArchivedQuery,
    type IFlagResolver,
    type IProjectParam,
    type IUnleashConfig,
    NONE,
    serializeDates,
} from '../../types/index.js';
import ProjectFeaturesController from '../feature-toggle/feature-toggle-controller.js';
import ProjectEnvironmentsController from '../project-environments/project-environments-controller.js';
import ProjectHealthReport from '../../routes/admin-api/project/health-report.js';
import type ProjectService from './project-service.js';
import VariantsController from '../../routes/admin-api/project/variants.js';
import {
    createResponseSchema,
    outdatedSdksSchema,
    type OutdatedSdksSchema,
    type ProjectDoraMetricsSchema,
    projectDoraMetricsSchema,
    projectOverviewSchema,
    type ProjectsSchema,
    projectsSchema,
} from '../../openapi/index.js';
import { getStandardResponses } from '../../openapi/util/standard-responses.js';
import type { IUnleashServices, OpenApiService } from '../../services/index.js';
import type { IAuthRequest } from '../../routes/unleash-types.js';
import { ProjectApiTokenController } from '../../routes/admin-api/project/api-token.js';
import ProjectArchiveController from '../../routes/admin-api/project/project-archive.js';
import type { Db } from '../../db/db.js';
import DependentFeaturesController from '../dependent-features/dependent-features-controller.js';
import type { ProjectOverviewSchema } from '../../openapi/spec/project-overview-schema.js';
import {
    projectApplicationsSchema,
    type ProjectApplicationsSchema,
} from '../../openapi/spec/project-applications-schema.js';
import { projectApplicationsQueryParameters } from '../../openapi/spec/project-applications-query-parameters.js';
import { normalizeQueryParams } from '../feature-search/search-utils.js';
import ProjectInsightsController from '../project-insights/project-insights-controller.js';
import FeatureLifecycleController from '../feature-lifecycle/feature-lifecycle-controller.js';
import type ClientInstanceService from '../metrics/instance/instance-service.js';
import {
    projectFlagCreatorsSchema,
    type ProjectFlagCreatorsSchema,
} from '../../openapi/spec/project-flag-creators-schema.js';
import ProjectStatusController from '../project-status/project-status-controller.js';
import FeatureLinkController from '../feature-links/feature-link-controller.js';
import { ContextController } from '../context/context.js';
import ProjectJsonSchemaController from '../project-json-schemas/project-json-schema-controller.js';

export default class ProjectController extends Controller {
    private projectService: ProjectService;

    private openApiService: OpenApiService;

    private clientInstanceService: ClientInstanceService;

    private flagResolver: IFlagResolver;

    constructor(config: IUnleashConfig, services: IUnleashServices, _db: Db) {
        super(config);
        this.projectService = services.projectService;
        this.clientInstanceService = services.clientInstanceService;
        this.openApiService = services.openApiService;
        this.flagResolver = config.flagResolver;

        this.route({
            path: '',
            method: 'get',
            handler: this.getProjects,
            permission: NONE,
            middleware: [
                this.openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'getProjects',
                    summary: 'Get a list of all projects.',
                    description:
                        'This endpoint returns an list of all the projects in the Unleash instance.',
                    parameters: [
                        {
                            name: 'archived',
                            in: 'query',
                            required: false,
                            schema: {
                                type: 'boolean',
                            },
                        },
                    ],
                    responses: {
                        200: createResponseSchema('projectsSchema'),
                        ...getStandardResponses(401, 403),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/:projectId/overview',
            handler: this.getProjectOverview,
            permission: NONE,
            middleware: [
                this.openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'getProjectOverview',
                    summary: 'Get an overview of a project.',
                    description:
                        'This endpoint returns an overview of the specified projects stats, project health, number of members, which environments are configured, and the features types in the project.',
                    responses: {
                        200: createResponseSchema('projectOverviewSchema'),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        /** @deprecated use project insights instead */
        this.route({
            method: 'get',
            path: '/:projectId/dora',
            handler: this.getProjectDora,
            permission: NONE,
            middleware: [
                this.openApiService.validPath({
                    deprecated: true,
                    tags: ['Projects'],
                    operationId: 'getProjectDora',
                    summary: 'Get an overview project dora metrics.',
                    description:
                        'This endpoint returns an overview of the specified dora metrics',
                    responses: {
                        200: createResponseSchema('projectDoraMetricsSchema'),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/:projectId/applications',
            handler: this.getProjectApplications,
            permission: NONE,
            middleware: [
                this.openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'getProjectApplications',
                    summary: 'Get a list of all applications for a project.',
                    description:
                        'This endpoint returns an list of all the applications for a project.',
                    parameters: [...projectApplicationsQueryParameters],
                    responses: {
                        200: createResponseSchema('projectApplicationsSchema'),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/:projectId/flag-creators',
            handler: this.getProjectFlagCreators,
            permission: NONE,
            middleware: [
                this.openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'getProjectFlagCreators',
                    summary: 'Get a list of all flag creators for a project.',
                    description:
                        'This endpoint returns every user who created a flag in the project.',
                    responses: {
                        200: createResponseSchema('projectFlagCreatorsSchema'),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/:projectId/sdks/outdated',
            handler: this.getOutdatedProjectSdks,
            permission: NONE,
            middleware: [
                this.openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'getOutdatedProjectSdks',
                    summary: 'Get outdated project SDKs',
                    description:
                        'Returns a list of the outdated SDKS with the applications using them.',
                    responses: {
                        200: createResponseSchema('outdatedSdksSchema'),
                        ...getStandardResponses(404),
                    },
                }),
            ],
        });

        this.use('/', new ProjectFeaturesController(config, services).router);
        this.use('/', new DependentFeaturesController(config, services).router);
        this.use(
            '/',
            new ProjectEnvironmentsController(config, services).router,
        );
        this.use('/', new ProjectHealthReport(config, services).router);
        this.use('/', new VariantsController(config, services).router);
        this.use('/', new ProjectApiTokenController(config, services).router);
        this.use('/', new ProjectArchiveController(config, services).router);
        this.use('/', new ProjectInsightsController(config, services).router);
        this.use('/', new ProjectStatusController(config, services).router);
        this.use('/', new FeatureLifecycleController(config, services).router);
        this.use('/', new FeatureLinkController(config, services).router);
        this.use(
            '/',
            new ContextController(config, services, 'project').router,
        );
        this.use('/', new ProjectJsonSchemaController(config, services).router);
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

        const projectsWithOwners =
            await this.projectService.addOwnersToProjects(projects);

        this.openApiService.respondWithValidation(
            200,
            res,
            projectsSchema.$id,
            { version: 1, projects: serializeDates(projectsWithOwners) },
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

    /** @deprecated use projectInsights instead */
    async getProjectDora(
        req: IAuthRequest,
        res: Response<ProjectDoraMetricsSchema>,
    ): Promise<void> {
        const { projectId } = req.params;

        const dora = await this.projectService.getDoraMetrics(projectId);

        this.openApiService.respondWithValidation(
            200,
            res,
            projectDoraMetricsSchema.$id,
            dora,
        );
    }

    async getProjectApplications(
        req: IAuthRequest,
        res: Response<ProjectApplicationsSchema>,
    ): Promise<void> {
        const { projectId } = req.params;

        const {
            normalizedQuery,
            normalizedSortOrder,
            normalizedOffset,
            normalizedLimit,
        } = normalizeQueryParams(req.query, {
            limitDefault: 50,
            maxLimit: 100,
        });

        const applications = await this.projectService.getApplications({
            searchParams: normalizedQuery,
            project: projectId,
            offset: normalizedOffset,
            limit: normalizedLimit,
            sortBy: req.query.sortBy,
            sortOrder: normalizedSortOrder,
        });

        this.openApiService.respondWithValidation(
            200,
            res,
            projectApplicationsSchema.$id,
            serializeDates(applications),
        );
    }

    async getProjectFlagCreators(
        req: IAuthRequest<IProjectParam>,
        res: Response<ProjectFlagCreatorsSchema>,
    ): Promise<void> {
        const { projectId } = req.params;

        const flagCreators =
            await this.projectService.getProjectFlagCreators(projectId);

        this.openApiService.respondWithValidation(
            200,
            res,
            projectFlagCreatorsSchema.$id,
            serializeDates(flagCreators),
        );
    }

    async getOutdatedProjectSdks(
        req: IAuthRequest<IProjectParam>,
        res: Response<OutdatedSdksSchema>,
    ) {
        const { projectId } = req.params;
        const outdatedSdks =
            await this.clientInstanceService.getOutdatedSdksByProject(
                projectId,
            );

        this.openApiService.respondWithValidation(
            200,
            res,
            outdatedSdksSchema.$id,
            { sdks: outdatedSdks },
        );
    }
}

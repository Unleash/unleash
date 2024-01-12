import { Response } from 'express';
import Controller from '../../routes/controller';
import {
    IUnleashConfig,
    IUnleashServices,
    serializeDates,
    SYSTEM_USER_ID,
    UPDATE_PROJECT,
} from '../../types';
import { Logger } from '../../logger';
import EnvironmentService from './environment-service';
import {
    createFeatureStrategySchema,
    CreateFeatureStrategySchema,
    createRequestSchema,
    createResponseSchema,
    emptyResponse,
    getStandardResponses,
    ProjectEnvironmentSchema,
} from '../../openapi';
import { OpenApiService, ProjectService } from '../../services';
import { extractUsername } from '../../util';
import { IAuthRequest } from '../../routes/unleash-types';
import { WithTransactional } from '../../db/transaction';

const PREFIX = '/:projectId/environments';

interface IProjectEnvironmentParams {
    projectId: string;
    environment: string;
}

export default class EnvironmentsController extends Controller {
    private logger: Logger;

    private environmentService: WithTransactional<EnvironmentService>;

    private openApiService: OpenApiService;

    private projectService: ProjectService;

    constructor(
        config: IUnleashConfig,
        {
            transactionalEnvironmentService,
            openApiService,
            projectService,
        }: Pick<
            IUnleashServices,
            | 'transactionalEnvironmentService'
            | 'openApiService'
            | 'projectService'
        >,
    ) {
        super(config);

        this.logger = config.getLogger('admin-api/project/environments.ts');
        this.environmentService = transactionalEnvironmentService;
        this.openApiService = openApiService;
        this.projectService = projectService;

        this.route({
            method: 'post',
            path: PREFIX,
            handler: this.addEnvironmentToProject,
            permission: UPDATE_PROJECT,
            middleware: [
                openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'addEnvironmentToProject',
                    summary: 'Add an environment to a project.',
                    description:
                        'This endpoint adds the provided environment to the specified project, with optional support for enabling and disabling change requests for the environment and project.',
                    requestBody: createRequestSchema(
                        'projectEnvironmentSchema',
                    ),
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(401, 403, 409),
                    },
                }),
            ],
        });

        this.route({
            method: 'delete',
            path: `${PREFIX}/:environment`,
            acceptAnyContentType: true,
            handler: this.removeEnvironmentFromProject,
            permission: UPDATE_PROJECT,
            middleware: [
                openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'removeEnvironmentFromProject',
                    summary: 'Remove an environment from a project.',
                    description:
                        'This endpoint removes the specified environment from the project.',
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(400, 401, 403),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: `${PREFIX}/:environment/default-strategy`,
            handler: this.updateDefaultStrategyForProjectEnvironment,
            permission: UPDATE_PROJECT,
            middleware: [
                openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'addDefaultStrategyToProjectEnvironment',
                    summary: 'Set environment-default strategy',
                    description:
                        'Sets a default strategy for this environment. Unleash will use this strategy by default when enabling a toggle. Use the wild card "*" for `:environment` to add to all environments. ',
                    requestBody: createRequestSchema(
                        'createFeatureStrategySchema',
                    ),
                    responses: {
                        200: createResponseSchema(
                            'createFeatureStrategySchema',
                        ),
                        ...getStandardResponses(400),
                    },
                }),
            ],
        });
    }

    async addEnvironmentToProject(
        req: IAuthRequest<
            Omit<IProjectEnvironmentParams, 'environment'>,
            void,
            ProjectEnvironmentSchema
        >,
        res: Response,
    ): Promise<void> {
        const { projectId } = req.params;
        const { environment } = req.body;
        await this.projectService.getProject(projectId); // Validates that the project exists

        await this.environmentService.transactional((service) =>
            service.addEnvironmentToProject(
                environment,
                projectId,
                extractUsername(req),
                req.user.id,
            ),
        );

        res.status(200).end();
    }

    async removeEnvironmentFromProject(
        req: IAuthRequest<IProjectEnvironmentParams>,
        res: Response<void>,
    ): Promise<void> {
        const { projectId, environment } = req.params;

        await this.environmentService.transactional((service) =>
            service.removeEnvironmentFromProject(
                environment,
                projectId,
                extractUsername(req),
                req.user.id,
            ),
        );

        res.status(200).end();
    }

    async updateDefaultStrategyForProjectEnvironment(
        req: IAuthRequest<
            IProjectEnvironmentParams,
            CreateFeatureStrategySchema
        >,
        res: Response<CreateFeatureStrategySchema>,
    ): Promise<void> {
        const { projectId, environment } = req.params;
        const strategy = req.body;

        const saved = await this.environmentService.transactional((service) =>
            service.updateDefaultStrategy(
                environment,
                projectId,
                strategy,
                extractUsername(req),
                req.user.id || SYSTEM_USER_ID,
            ),
        );

        this.openApiService.respondWithValidation(
            200,
            res,
            createFeatureStrategySchema.$id,
            serializeDates(saved),
        );
    }
}

import { Request, Response } from 'express';
import Controller from '../../controller';
import {
    IUnleashConfig,
    IUnleashServices,
    serializeDates,
    UPDATE_PROJECT,
} from '../../../types';
import { Logger } from '../../../logger';
import EnvironmentService from '../../../services/environment-service';
import {
    createFeatureStrategySchema,
    CreateFeatureStrategySchema,
    createRequestSchema,
    createResponseSchema,
    emptyResponse,
    getStandardResponses,
    ProjectEnvironmentSchema,
} from '../../../openapi';
import { OpenApiService } from '../../../services';

const PREFIX = '/:projectId/environments';

interface IProjectEnvironmentParams {
    projectId: string;
    environment: string;
}

export default class EnvironmentsController extends Controller {
    private logger: Logger;

    private environmentService: EnvironmentService;

    private openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        {
            environmentService,
            openApiService,
        }: Pick<IUnleashServices, 'environmentService' | 'openApiService'>,
    ) {
        super(config);

        this.logger = config.getLogger('admin-api/project/environments.ts');
        this.environmentService = environmentService;
        this.openApiService = openApiService;

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
            handler: this.addDefaultStrategyToProjectEnvironment,
            permission: UPDATE_PROJECT,
            middleware: [
                openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'addDefaultStrategyToProjectEnvironment',
                    description:
                        'Adds a default strategy for this environment. Unleash will use this strategy by default when enabling a toggle. Use the wild card "*" for `:environment` to add to all environments. ',
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
        req: Request<
            Omit<IProjectEnvironmentParams, 'environment'>,
            void,
            ProjectEnvironmentSchema
        >,
        res: Response,
    ): Promise<void> {
        const { projectId } = req.params;
        const { environment } = req.body;

        await this.environmentService.addEnvironmentToProject(
            environment,
            projectId,
        );

        res.status(200).end();
    }

    async removeEnvironmentFromProject(
        req: Request<IProjectEnvironmentParams>,
        res: Response<void>,
    ): Promise<void> {
        const { projectId, environment } = req.params;

        await this.environmentService.removeEnvironmentFromProject(
            environment,
            projectId,
        );

        res.status(200).end();
    }

    async addDefaultStrategyToProjectEnvironment(
        req: Request<IProjectEnvironmentParams, CreateFeatureStrategySchema>,
        res: Response<CreateFeatureStrategySchema>,
    ): Promise<void> {
        const { projectId, environment } = req.params;
        const strategy = req.body;

        const saved = await this.environmentService.addDefaultStrategy(
            environment,
            projectId,
            strategy,
        );

        this.openApiService.respondWithValidation(
            200,
            res,
            createFeatureStrategySchema.$id,
            serializeDates(saved),
        );
    }
}

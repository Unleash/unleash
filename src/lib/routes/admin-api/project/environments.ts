import { Request, Response } from 'express';
import Controller from '../../controller';
import { IUnleashConfig } from '../../../types/option';
import { IUnleashServices } from '../../../types/services';
import { Logger } from '../../../logger';
import EnvironmentService from '../../../services/environment-service';
import { UPDATE_PROJECT } from '../../../types/permissions';
import { createRequestSchema } from '../../../openapi/util/create-request-schema';
import { ProjectEnvironmentSchema } from '../../../openapi/spec/project-environment-schema';
import { emptyResponse } from '../../../openapi/util/standard-responses';

const PREFIX = '/:projectId/environments';

interface IProjectEnvironmentParams {
    projectId: string;
    environment: string;
}

export default class EnvironmentsController extends Controller {
    private logger: Logger;

    private environmentService: EnvironmentService;

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

        this.route({
            method: 'post',
            path: PREFIX,
            handler: this.addEnvironmentToProject,
            permission: UPDATE_PROJECT,
            middleware: [
                openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'addEnvironmentToProject',
                    requestBody: createRequestSchema(
                        'projectEnvironmentSchema',
                    ),
                    responses: { 200: emptyResponse },
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
                    responses: { 200: emptyResponse },
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
}

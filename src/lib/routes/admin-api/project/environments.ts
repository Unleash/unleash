import { Request, Response } from 'express';
import Controller from '../../controller';
import { IUnleashConfig } from '../../../types/option';
import { IUnleashServices } from '../../../types/services';
import { Logger } from '../../../logger';
import EnvironmentService from '../../../services/environment-service';
import { handleErrors } from '../../util';
import { UPDATE_PROJECT } from '../../../types/permissions';

const PREFIX = '/:projectId/environments';

interface IProjectEnvironmentParams {
    projectId: string;
    environment: string;
}

interface EnvironmentBody {
    environment: string;
}

export default class EnvironmentsController extends Controller {
    private logger: Logger;

    private environmentService: EnvironmentService;

    constructor(
        config: IUnleashConfig,
        { environmentService }: Pick<IUnleashServices, 'environmentService'>,
    ) {
        super(config);

        this.logger = config.getLogger('admin-api/project/environments.ts');
        this.environmentService = environmentService;
        this.post(PREFIX, this.addEnvironmentToProject, UPDATE_PROJECT);
        this.delete(
            `${PREFIX}/:environment`,
            this.removeEnvironmentFromProject,
            UPDATE_PROJECT,
        );
    }

    async addEnvironmentToProject(
        req: Request<
            Omit<IProjectEnvironmentParams, 'environment'>,
            any,
            EnvironmentBody,
            any
        >,
        res: Response,
    ): Promise<void> {
        const { projectId } = req.params;
        try {
            await this.environmentService.connectProjectToEnvironment(
                req.body.environment,
                projectId,
            );
            res.status(200).end();
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    async removeEnvironmentFromProject(
        req: Request<IProjectEnvironmentParams, any, any, any>,
        res: Response,
    ): Promise<void> {
        const { projectId, environment } = req.params;
        try {
            await this.environmentService.removeEnvironmentFromProject(
                environment,
                projectId,
            );
            res.status(200).end();
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }
}

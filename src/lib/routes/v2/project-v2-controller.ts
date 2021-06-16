import { Request, Response } from 'express';
import Controller from '../controller';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import { Logger } from '../../logger';
import FeatureToggleServiceV2 from '../../services/feature-toggle-service-v2';
import { handleErrors } from '../admin-api/util';
import ProjectService from '../../services/project-service';
import { IProjectParam } from '../../types/model';

export default class ProjectV2Controller extends Controller {
    private logger: Logger;

    private service: FeatureToggleServiceV2;

    private projectService: ProjectService;

    constructor(config: IUnleashConfig, services: IUnleashServices) {
        super(config);
        this.logger = config.getLogger('routes/v2/project-v2-controller.ts');
        this.service = services.featureToggleServiceV2;
        this.projectService = services.projectService;
        this.get('/', this.getProjects);
        this.get('/:projectId', this.getProjectOverview);
    }

    async getProjects(req: Request, res: Response): Promise<void> {
        this.logger.info('All projects');
        try {
            const projects = await this.projectService.getProjects();
            res.json(projects);
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    async getProjectOverview(
        req: Request<IProjectParam, any, any, any>,
        res: Response,
    ): Promise<void> {
        const { projectId } = req.params;
        this.logger.info(projectId);
        try {
            const overview = await this.service.getProjectOverview(projectId);
            res.json(overview);
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }
}

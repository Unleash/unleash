import { Request, Response } from 'express';
import Controller from '../../controller';
import { IUnleashConfig } from '../../../types/option';
import { IUnleashServices } from '../../../types/services';
import ProjectFeaturesController from './features';
import EnvironmentsController from './environments';
import ProjectHealthReport from './health-report';
import ProjectService from '../../../services/project-service';

export default class ProjectApi extends Controller {
    private projectService: ProjectService;

    constructor(config: IUnleashConfig, services: IUnleashServices) {
        super(config);
        this.projectService = services.projectService;
        this.get('/', this.getProjects);
        this.use('/', new ProjectFeaturesController(config, services).router);
        this.use('/', new EnvironmentsController(config, services).router);
        this.use('/', new ProjectHealthReport(config, services).router);
    }

    async getProjects(req: Request, res: Response): Promise<void> {
        const projects = await this.projectService.getProjects({
            id: 'default',
        });
        res.json({ version: 1, projects }).end();
    }
}

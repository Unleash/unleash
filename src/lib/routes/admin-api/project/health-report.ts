import { Request, Response } from 'express';
import Controller from '../../controller';
import { IUnleashServices } from '../../../types/services';
import { IUnleashConfig } from '../../../types/option';
import ProjectHealthService from '../../../services/project-health-service';
import { Logger } from '../../../logger';
import { IArchivedQuery, IProjectParam } from '../../../types/model';

export default class ProjectHealthReport extends Controller {
    private projectHealthService: ProjectHealthService;

    private logger: Logger;

    constructor(
        config: IUnleashConfig,
        {
            projectHealthService,
        }: Pick<IUnleashServices, 'projectHealthService'>,
    ) {
        super(config);
        this.logger = config.getLogger('/admin-api/project/health-report');
        this.projectHealthService = projectHealthService;
        this.get('/:projectId', this.getProjectOverview);
        this.get('/:projectId/health-report', this.getProjectHealthReport);
    }

    async getProjectOverview(
        req: Request<IProjectParam, any, any, IArchivedQuery>,
        res: Response,
    ): Promise<void> {
        const { projectId } = req.params;
        const { archived } = req.query;
        const overview = await this.projectHealthService.getProjectOverview(
            projectId,
            archived,
        );
        res.json(overview);
    }

    async getProjectHealthReport(
        req: Request<IProjectParam, any, any, any>,
        res: Response,
    ): Promise<void> {
        const { projectId } = req.params;
        const overview = await this.projectHealthService.getProjectHealthReport(
            projectId,
        );
        res.json({
            version: 2,
            ...overview,
        });
    }
}

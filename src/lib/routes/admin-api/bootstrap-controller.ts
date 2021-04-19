import { Request, Response } from 'express';
import Controller from '../controller';
import { IUnleashConfig } from '../../types/core';
import { Logger } from '../../logger';
import ContextService from '../../services/context-service';
import FeatureTypeStore, { IFeatureType } from '../../db/feature-type-store';
import TagTypeService from '../../services/tag-type-service';
import StrategyService from '../../services/strategy-service';
import ProjectService from '../../services/project-service';
import { IContextField } from '../../db/context-field-store';
import { ITagType } from '../../db/tag-type-store';
import { IProject } from '../../db/project-store';
import { IStrategy } from '../../db/strategy-store';

export default class BootstrapController extends Controller {
    private logger: Logger;

    private contextService: ContextService;

    private featureTypeStore: FeatureTypeStore;

    private tagTypeService: TagTypeService;

    private strategyService: StrategyService;

    private projectService: ProjectService;

    constructor(
        config: IUnleashConfig,
        { contextService, tagTypeService, strategyService, projectService },
    ) {
        super(config);
        this.contextService = contextService;
        this.tagTypeService = tagTypeService;
        this.strategyService = strategyService;
        this.projectService = projectService;
        this.featureTypeStore = config.stores.featureTypeStore;

        this.logger = config.getLogger(
            'routes/admin-api/bootstrap-controller.ts',
        );

        this.get('/', this.bootstrap);
    }

    async bootstrap(req: Request, res: Response): Promise<void> {
        const jobs: [
            Promise<IContextField[]>,
            Promise<IFeatureType[]>,
            Promise<ITagType[]>,
            Promise<IStrategy[]>,
            Promise<IProject[]>,
        ] = [
            this.contextService.getAll(),
            this.featureTypeStore.getAll(),
            this.tagTypeService.getAll(),
            this.strategyService.getStrategies(),
            this.projectService.getProjects(),
        ];
        const [
            context,
            featureTypes,
            tagTypes,
            strategies,
            projects,
        ] = await Promise.all(jobs);

        res.json({
            ...this.config.ui,
            unleashUrl: this.config.unleashUrl,
            baseUriPath: this.config.baseUriPath,
            version: this.config.version,
            // @ts-ignore
            user: req.user,
            context,
            featureTypes,
            tagTypes,
            strategies,
            projects,
        });
    }
}

module.exports = BootstrapController;

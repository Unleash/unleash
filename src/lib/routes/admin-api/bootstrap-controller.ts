import { Response } from 'express';
import Controller from '../controller';
import { AuthedRequest, IUnleashConfig } from '../../types/core';
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
import { IUserPermission } from '../../db/access-store';
import { AccessService } from '../../services/access-service';
import { EmailService } from '../../services/email-service';

export default class BootstrapController extends Controller {
    private logger: Logger;

    private contextService: ContextService;

    private featureTypeStore: FeatureTypeStore;

    private tagTypeService: TagTypeService;

    private strategyService: StrategyService;

    private projectService: ProjectService;

    private accessService: AccessService;

    private emailService: EmailService;

    constructor(
        config: IUnleashConfig,
        {
            contextService,
            tagTypeService,
            strategyService,
            projectService,
            accessService,
            emailService,
        },
    ) {
        super(config);
        this.contextService = contextService;
        this.tagTypeService = tagTypeService;
        this.strategyService = strategyService;
        this.projectService = projectService;
        this.accessService = accessService;
        this.featureTypeStore = config.stores.featureTypeStore;
        this.emailService = emailService;

        this.logger = config.getLogger(
            'routes/admin-api/bootstrap-controller.ts',
        );

        this.get('/', this.bootstrap);
    }

    private isContextEnabled(): boolean {
        return this.config.ui && this.config.ui.flags && this.config.ui.flags.C;
    }

    private isProjectEnabled(): boolean {
        return this.config.ui && this.config.ui.flags && this.config.ui.flags.P;
    }

    async bootstrap(req: AuthedRequest, res: Response): Promise<void> {
        const jobs: [
            Promise<IContextField[]>,
            Promise<IFeatureType[]>,
            Promise<ITagType[]>,
            Promise<IStrategy[]>,
            Promise<IProject[]>,
            Promise<IUserPermission[]>,
        ] = [
            this.isContextEnabled()
                ? this.contextService.getAll()
                : Promise.resolve([]),
            this.featureTypeStore.getAll(),
            this.tagTypeService.getAll(),
            this.strategyService.getStrategies(),
            this.isProjectEnabled()
                ? this.projectService.getProjects()
                : Promise.resolve([]),
            this.accessService.getPermissionsForUser(req.user),
        ];
        const [
            context,
            featureTypes,
            tagTypes,
            strategies,
            projects,
            userPermissions,
        ] = await Promise.all(jobs);

        res.json({
            ...this.config.ui,
            unleashUrl: this.config.unleashUrl,
            baseUriPath: this.config.baseUriPath,
            version: this.config.version,
            user: { ...req.user, permissions: userPermissions },
            email: this.emailService.isEnabled(),
            context,
            featureTypes,
            tagTypes,
            strategies,
            projects,
        });
    }
}

module.exports = BootstrapController;

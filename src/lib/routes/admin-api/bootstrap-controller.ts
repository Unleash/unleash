import { Response } from 'express';
import Controller from '../controller';
import { AuthedRequest } from '../../types/core';
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
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import VersionService from '../../services/version-service';
import FeatureTypeService from '../../services/feature-type-service';

class BootstrapController extends Controller {
    private logger: Logger;

    private accessService: AccessService;

    private contextService: ContextService;

    private emailService: EmailService;

    private featureTypeService: FeatureTypeService;

    private projectService: ProjectService;

    private strategyService: StrategyService;

    private tagTypeService: TagTypeService;

    private versionService: VersionService;

    constructor(
        config: IUnleashConfig,
        {
            contextService,
            tagTypeService,
            strategyService,
            projectService,
            accessService,
            emailService,
            versionService,
            featureTypeService,
        }: Pick<
        IUnleashServices,
            | 'contextService'
            | 'tagTypeService'
            | 'strategyService'
            | 'projectService'
            | 'accessService'
            | 'emailService'
            | 'versionService'
            | 'featureTypeService'
        >,
    ) {
        super(config);
        this.contextService = contextService;
        this.tagTypeService = tagTypeService;
        this.strategyService = strategyService;
        this.projectService = projectService;
        this.accessService = accessService;
        this.featureTypeService = featureTypeService;
        this.emailService = emailService;
        this.versionService = versionService;

        this.logger = config.getLogger(
            'routes/admin-api/bootstrap-controller.ts',
        );

        this.get('/', this.bootstrap);
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
            this.contextService.getAll(),
            this.featureTypeService.getAll(),
            this.tagTypeService.getAll(),
            this.strategyService.getStrategies(),
            this.projectService.getProjects(),
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
            unleashUrl: this.config.server.unleashUrl,
            baseUriPath: this.config.server.baseUriPath,
            version: this.versionService.getVersionInfo(),
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

export default BootstrapController;
module.exports = BootstrapController;

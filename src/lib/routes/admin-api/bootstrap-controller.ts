import { Response } from 'express';
import Controller from '../controller';
import { AuthedRequest } from '../../types/core';
import { Logger } from '../../logger';
import ContextService from '../../services/context-service';
import TagTypeService from '../../services/tag-type-service';
import StrategyService from '../../services/strategy-service';
import ProjectService from '../../services/project-service';
import { AccessService } from '../../services/access-service';
import { EmailService } from '../../services/email-service';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import VersionService from '../../services/version-service';
import FeatureTypeService from '../../services/feature-type-service';
import version from '../../util/version';
import { IContextField } from '../../types/stores/context-field-store';
import { IFeatureType } from '../../types/stores/feature-type-store';
import { ITagType } from '../../types/stores/tag-type-store';
import { IStrategy } from '../../types/stores/strategy-store';
import { IProject } from '../../types/model';
import { IUserPermission } from '../../types/stores/access-store';

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

        const authenticationType =
            this.config.authentication && this.config.authentication.type;
        const versionInfo = this.versionService.getVersionInfo();

        const uiConfig = {
            ...this.config.ui,
            authenticationType,
            unleashUrl: this.config.server.unleashUrl,
            version,
            baseUriPath: this.config.server.baseUriPath,
            versionInfo,
        };

        res.json({
            uiConfig,
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

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
import { OpenApiService } from '../../services/openapi-service';
import { NONE } from '../../types/permissions';
import { createResponseSchema } from '../../openapi';
import {
    BootstrapUiSchema,
    bootstrapUiSchema,
} from '../../openapi/spec/bootstrap-ui-schema';
import { serializeDates } from '../../types/serialize-dates';

/**
 * Provides admin UI configuration.
 * Not to be confused with SDK bootstrapping.
 */
class BootstrapUIController extends Controller {
    private logger: Logger;

    private accessService: AccessService;

    private contextService: ContextService;

    private emailService: EmailService;

    private featureTypeService: FeatureTypeService;

    private projectService: ProjectService;

    private strategyService: StrategyService;

    private tagTypeService: TagTypeService;

    private versionService: VersionService;

    private openApiService: OpenApiService;

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
            openApiService,
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
            | 'openApiService'
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
        this.openApiService = openApiService;

        this.logger = config.getLogger('routes/admin-api/bootstrap-ui.ts');
        this.route({
            method: 'get',
            path: '',
            handler: this.bootstrap,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['other'],
                    operationId: 'bootstrapUiSchema',
                    responses: {
                        202: createResponseSchema('bootstrapUiSchema'),
                    },
                }),
            ],
        });
    }

    async bootstrap(
        req: AuthedRequest,
        res: Response<BootstrapUiSchema>,
    ): Promise<void> {
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

        this.openApiService.respondWithValidation(
            200,
            res,
            bootstrapUiSchema.$id,
            {
                uiConfig,
                user: {
                    ...serializeDates(req.user),
                    permissions: userPermissions,
                },
                email: this.emailService.isEnabled(),
                context: serializeDates(context),
                featureTypes,
                tagTypes,
                strategies,
                projects: serializeDates(projects),
            },
        );
    }
}

export default BootstrapUIController;
module.exports = BootstrapUIController;

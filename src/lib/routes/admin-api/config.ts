import { Response } from 'express';
import { AuthedRequest } from '../../types/core';
import { IUnleashServices } from '../../types/services';
import { IAuthType, IUnleashConfig } from '../../types/option';
import version from '../../util/version';
import Controller from '../controller';
import VersionService from '../../services/version-service';
import SettingService from '../../services/setting-service';
import {
    SimpleAuthSettings,
    simpleAuthSettingsKey,
} from '../../types/settings/simple-auth-settings';
import { ADMIN, NONE } from '../../types/permissions';
import { createResponseSchema } from '../../openapi/util/create-response-schema';
import {
    uiConfigSchema,
    UiConfigSchema,
} from '../../openapi/spec/ui-config-schema';
import { OpenApiService } from '../../services/openapi-service';
import { EmailService } from '../../services/email-service';
import { emptyResponse } from '../../openapi/util/standard-responses';
import { IAuthRequest } from '../unleash-types';
import { extractUsername } from '../../util/extract-user';
import NotFoundError from '../../error/notfound-error';
import { SetUiConfigSchema } from '../../openapi/spec/set-ui-config-schema';
import { createRequestSchema } from '../../openapi/util/create-request-schema';
import { ProxyService } from '../../services';
import MaintenanceService from '../../features/maintenance/maintenance-service';
import memoizee from 'memoizee';
import { minutesToMilliseconds } from 'date-fns';
import ClientInstanceService from '../../features/metrics/instance/instance-service';

class ConfigController extends Controller {
    private versionService: VersionService;

    private settingService: SettingService;

    private proxyService: ProxyService;

    private emailService: EmailService;

    private clientInstanceService: ClientInstanceService;

    private maintenanceService: MaintenanceService;

    private usesOldEdgeFunction: () => Promise<boolean>;

    private readonly openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        {
            versionService,
            settingService,
            emailService,
            openApiService,
            proxyService,
            maintenanceService,
            clientInstanceService,
        }: Pick<
            IUnleashServices,
            | 'versionService'
            | 'settingService'
            | 'emailService'
            | 'openApiService'
            | 'proxyService'
            | 'maintenanceService'
            | 'clientInstanceService'
        >,
    ) {
        super(config);
        this.versionService = versionService;
        this.settingService = settingService;
        this.emailService = emailService;
        this.openApiService = openApiService;
        this.proxyService = proxyService;
        this.maintenanceService = maintenanceService;
        this.clientInstanceService = clientInstanceService;
        this.usesOldEdgeFunction = memoizee(
            async () =>
                this.clientInstanceService.usesSdkOlderThan(
                    'unleash-edge',
                    '17.0.0',
                ),
            {
                promise: true,
                maxAge: minutesToMilliseconds(10),
            },
        );

        this.route({
            method: 'get',
            path: '',
            handler: this.getUiConfig,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Admin UI'],
                    summary: 'Get UI configuration',
                    description:
                        'Retrieves the full configuration used to set up the Unleash Admin UI.',
                    operationId: 'getUiConfig',
                    responses: {
                        200: createResponseSchema('uiConfigSchema'),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '',
            handler: this.setUiConfig,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Admin UI'],
                    summary: 'Set UI configuration',
                    description:
                        'Sets the UI configuration for this Unleash instance.',
                    operationId: 'setUiConfig',
                    requestBody: createRequestSchema('setUiConfigSchema'),
                    responses: { 200: emptyResponse },
                }),
            ],
        });
    }

    async getUiConfig(
        req: AuthedRequest,
        res: Response<UiConfigSchema>,
    ): Promise<void> {
        const [
            frontendSettings,
            simpleAuthSettings,
            maintenanceMode,
            usesOldEdge,
        ] = await Promise.all([
            this.proxyService.getFrontendSettings(false),
            this.settingService.get<SimpleAuthSettings>(simpleAuthSettingsKey),
            this.maintenanceService.isMaintenanceMode(),
            this.usesOldEdgeFunction(),
        ]);

        const disablePasswordAuth =
            simpleAuthSettings?.disabled ||
            this.config.authentication.type === IAuthType.NONE;

        const expFlags = this.config.flagResolver.getAll({
            email: req.user.email,
        });

        const flags = {
            ...this.config.ui.flags,
            ...expFlags,
            displayUpgradeEdgeBanner:
                usesOldEdge ||
                this.config.flagResolver.isEnabled('displayEdgeBanner'),
        };

        const response: UiConfigSchema = {
            ...this.config.ui,
            flags,
            version,
            emailEnabled: this.emailService.isEnabled(),
            unleashUrl: this.config.server.unleashUrl,
            baseUriPath: this.config.server.baseUriPath,
            authenticationType: this.config.authentication?.type,
            segmentValuesLimit: this.config.resourceLimits.segmentValues,
            strategySegmentsLimit: this.config.resourceLimits.strategySegments,
            frontendApiOrigins: frontendSettings.frontendApiOrigins,
            versionInfo: await this.versionService.getVersionInfo(),
            networkViewEnabled: this.config.prometheusApi !== undefined,
            resourceLimits: this.config.resourceLimits,
            disablePasswordAuth,
            maintenanceMode,
            feedbackUriPath: this.config.feedbackUriPath,
        };

        this.openApiService.respondWithValidation(
            200,
            res,
            uiConfigSchema.$id,
            response,
        );
    }

    async setUiConfig(
        req: IAuthRequest<void, void, SetUiConfigSchema>,
        res: Response<string>,
    ): Promise<void> {
        if (req.body.frontendSettings) {
            await this.proxyService.setFrontendSettings(
                req.body.frontendSettings,
                extractUsername(req),
                req.user.id,
            );
            res.sendStatus(204);
            return;
        }

        throw new NotFoundError();
    }
}

export default ConfigController;

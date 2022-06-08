import { Request, Response } from 'express';
import { IUnleashServices } from '../../types/services';
import { IAuthType, IUnleashConfig } from '../../types/option';
import version from '../../util/version';
import Controller from '../controller';
import VersionService from '../../services/version-service';
import SettingService from '../../services/setting-service';
import {
    simpleAuthKey,
    SimpleAuthSettings,
} from '../../types/settings/simple-auth-settings';
import { NONE } from '../../types/permissions';
import { createResponseSchema } from '../../openapi';
import {
    uiConfigSchema,
    UiConfigSchema,
} from '../../openapi/spec/ui-config-schema';
import { OpenApiService } from '../../services/openapi-service';

class ConfigController extends Controller {
    private versionService: VersionService;

    private settingService: SettingService;

    private readonly openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        {
            versionService,
            settingService,
            openApiService,
        }: Pick<
            IUnleashServices,
            'versionService' | 'settingService' | 'openApiService'
        >,
    ) {
        super(config);
        this.versionService = versionService;
        this.settingService = settingService;
        this.openApiService = openApiService;

        this.route({
            method: 'get',
            path: '',
            handler: this.getUIConfig,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['admin'],
                    operationId: 'getUIConfig',
                    responses: {
                        200: createResponseSchema('uiConfigSchema'),
                    },
                }),
            ],
        });
    }

    async getUIConfig(
        req: Request,
        res: Response<UiConfigSchema>,
    ): Promise<void> {
        const simpleAuthSettings =
            await this.settingService.get<SimpleAuthSettings>(simpleAuthKey);

        const disablePasswordAuth =
            simpleAuthSettings?.disabled ||
            this.config.authentication.type == IAuthType.NONE;

        const response: UiConfigSchema = {
            ...this.config.ui,
            version,
            unleashUrl: this.config.server.unleashUrl,
            baseUriPath: this.config.server.baseUriPath,
            authenticationType: this.config.authentication?.type,
            segmentValuesLimit: this.config.segmentValuesLimit,
            strategySegmentsLimit: this.config.strategySegmentsLimit,
            versionInfo: this.versionService.getVersionInfo(),
            disablePasswordAuth,
        };

        this.openApiService.respondWithValidation(
            200,
            res,
            uiConfigSchema.$id,
            response,
        );
    }
}
export default ConfigController;

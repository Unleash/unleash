import { Response } from 'express';
import { ADMIN, IUnleashConfig, IUnleashServices } from '../../types';
import Controller from '../controller';
import VersionService from '../../services/version-service';
import SettingService from '../../services/setting-service';
import { EmailService, OpenApiService } from '../../services';
import {
    createRequestSchema,
    emptyResponse,
    SetUiConfigSchema,
} from '../../openapi';
import { IAuthRequest } from '../unleash-types';
import { extractUsername } from '../../util';
import NotFoundError from '../../error/notfound-error';

class ConfigController extends Controller {
    private versionService: VersionService;

    private settingService: SettingService;

    private emailService: EmailService;

    private readonly openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        {
            versionService,
            settingService,
            emailService,
            openApiService,
        }: Pick<
            IUnleashServices,
            | 'versionService'
            | 'settingService'
            | 'emailService'
            | 'openApiService'
        >,
    ) {
        super(config);
        this.versionService = versionService;
        this.settingService = settingService;
        this.emailService = emailService;
        this.openApiService = openApiService;

        this.route({
            method: 'post',
            path: '',
            handler: this.setUiConfig,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Admin UI'],
                    operationId: 'setUiConfig',
                    requestBody: createRequestSchema('setUiConfigSchema'),
                    responses: { 200: emptyResponse },
                }),
            ],
        });
    }

    async setUiConfig(
        req: IAuthRequest<void, void, SetUiConfigSchema>,
        res: Response<string>,
    ): Promise<void> {
        if (req.body.frontendSettings) {
            await this.settingService.setFrontendSettings(
                req.body.frontendSettings,
                extractUsername(req),
            );
            res.sendStatus(204);
            return;
        }

        throw new NotFoundError();
    }
}

export default ConfigController;

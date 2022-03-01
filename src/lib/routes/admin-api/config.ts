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

class ConfigController extends Controller {
    private versionService: VersionService;

    private settingService: SettingService;

    private uiConfig: any;

    constructor(
        config: IUnleashConfig,
        {
            versionService,
            settingService,
        }: Pick<IUnleashServices, 'versionService' | 'settingService'>,
    ) {
        super(config);
        this.versionService = versionService;
        this.settingService = settingService;
        const authenticationType =
            config.authentication && config.authentication.type;
        this.uiConfig = {
            ...config.ui,
            authenticationType,
            unleashUrl: config.server.unleashUrl,
            baseUriPath: config.server.baseUriPath,
            version,
        };
        this.get('/', this.getUIConfig);
    }

    async getUIConfig(req: Request, res: Response): Promise<void> {
        const config = this.uiConfig;
        const simpleAuthSettings =
            await this.settingService.get<SimpleAuthSettings>(simpleAuthKey);

        const versionInfo = this.versionService.getVersionInfo();
        const disablePasswordAuth =
            simpleAuthSettings?.disabled ||
            this.config.authentication.type == IAuthType.NONE;
        res.json({ ...config, versionInfo, disablePasswordAuth });
    }
}
export default ConfigController;

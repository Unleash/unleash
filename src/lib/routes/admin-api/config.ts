import { Request, Response } from 'express';
import { IUnleashServices } from '../../types/services';
import { IAuthType, IUIConfig, IUnleashConfig } from '../../types/option';
import version from '../../util/version';
import Controller from '../controller';
import VersionService, { IVersionHolder } from '../../services/version-service';
import SettingService from '../../services/setting-service';
import {
    simpleAuthKey,
    SimpleAuthSettings,
} from '../../types/settings/simple-auth-settings';

interface IUIConfigResponse extends IUIConfig {
    version: string;
    unleashUrl: string;
    baseUriPath: string;
    authenticationType?: IAuthType;
    versionInfo: IVersionHolder;
    disablePasswordAuth: boolean;
    segmentValuesLimit: number;
    strategySegmentsLimit: number;
}

class ConfigController extends Controller {
    private versionService: VersionService;

    private settingService: SettingService;

    private uiConfig: Omit<
        IUIConfigResponse,
        'versionInfo' | 'disablePasswordAuth'
    >;

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
            version,
            unleashUrl: config.server.unleashUrl,
            baseUriPath: config.server.baseUriPath,
            authenticationType,
            segmentValuesLimit: config.segmentValuesLimit,
            strategySegmentsLimit: config.strategySegmentsLimit,
        };
        this.get('/', this.getUIConfig);
    }

    async getUIConfig(
        req: Request,
        res: Response<IUIConfigResponse>,
    ): Promise<void> {
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

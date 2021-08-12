import { Request, Response } from 'express';
import { IUnleashServices } from '../../types/services';
import { IUnleashConfig } from '../../types/option';
import version from '../../util/version';

const Controller = require('../controller');

class ConfigController extends Controller {
    constructor(
        config: IUnleashConfig,
        { versionService }: Pick<IUnleashServices, 'versionService'>,
    ) {
        super(config);
        this.versionService = versionService;
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
        if (this.versionService) {
            const versionInfo = this.versionService.getVersionInfo();
            res.json({ ...config, versionInfo });
        } else {
            res.json(config);
        }
    }
}
export default ConfigController;
module.exports = ConfigController;

import { Response } from 'express';

import Controller from '../controller';
import { Logger } from '../../logger';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import UserSplashService from '../../services/user-splash-service';
import { IAuthRequest } from '../unleash-types';

interface ISplashBody {
    seen: boolean;
    splashId: string;
}

class UserSplashController extends Controller {
    private logger: Logger;

    private userSplashService: UserSplashService;

    constructor(
        config: IUnleashConfig,
        { userSplashService }: Pick<IUnleashServices, 'userSplashService'>,
    ) {
        super(config);
        this.logger = config.getLogger('splash-controller.ts');
        this.userSplashService = userSplashService;

        this.post('/:id', this.updateSplashSettings);
    }

    private async updateSplashSettings(
        req: IAuthRequest<any, any, ISplashBody, any>,
        res: Response,
    ): Promise<void> {
        const { user } = req;
        const { id } = req.params;

        const splash = {
            splashId: id,
            userId: user.id,
            seen: true,
        };
        const updated = await this.userSplashService.updateSplash(splash);
        res.json(updated);
    }
}

module.exports = UserSplashController;
export default UserSplashController;

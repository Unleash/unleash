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

        this.post('/', this.recordSplash);
        this.put('/:id', this.updateSplashSettings);
    }

    private async recordSplash(
        req: IAuthRequest<any, any, ISplashBody, any>,
        res: Response,
    ): Promise<void> {
        const BAD_REQUEST = 400;
        const { user } = req;

        const { splashId } = req.body;

        if (!splashId) {
            res.status(BAD_REQUEST).json({
                error: 'splashId must be present.',
            });
            return;
        }

        const splash = {
            ...req.body,
            userId: user.id,
            seen: req.body.seen || false,
        };

        const updated = await this.userSplashService.updateSplash(splash);
        res.json(updated);
    }

    private async updateSplashSettings(
        req: IAuthRequest<any, any, ISplashBody, any>,
        res: Response,
    ): Promise<void> {
        const { user } = req;
        const { id } = req.params;

        const splash = {
            ...req.body,
            splashId: id,
            userId: user.id,
            seen: req.body.seen || false,
        };

        const updated = await this.userSplashService.updateSplash(splash);
        res.json(updated);
    }
}

module.exports = UserSplashController;

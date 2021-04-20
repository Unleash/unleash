'use strict';

import { Response } from 'express';
import { IUnleashConfig } from '../../types/core';
import { IAuthRequest } from '../unleash-types';
import Controller from '../controller';
import { AccessService } from '../../services/access-service';

interface IService {
    accessService: AccessService;
}

class UserController extends Controller {
    private accessService: AccessService;

    constructor(config: IUnleashConfig, { accessService }: IService) {
        super(config);
        this.accessService = accessService;

        this.get('/', this.getUser);
        this.get('/logout', this.logout);
    }

    async getUser(req: IAuthRequest, res: Response): Promise<void> {
        const { user } = req;
        if (user) {
            const permissions = await this.accessService.getPermissionsForUser(
                user,
            );
            delete user.permissions; // TODO: remove
            return res
                .status(200)
                .json({ user, permissions })
                .end();
        }
        return res.status(404).end();
    }

    // Deprecated, use "/logout" instead.  Will be removed in v4.
    logout(req: IAuthRequest, res: Response): void {
        if (req.session) {
            req.session = null;
        }
        if (req.logout) {
            req.logout();
        }
        res.redirect(`${this.config.baseUriPath}/`);
    }
}

module.exports = UserController;
export default UserController;

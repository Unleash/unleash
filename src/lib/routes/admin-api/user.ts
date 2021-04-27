'use strict';

import { Request, Response } from 'express';
import { IAuthRequest } from '../unleash-types';
import Controller from '../controller';
import { AccessService } from '../../services/access-service';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import UserService from '../../services/user-service';
import User from '../../types/user';
import { Logger } from '../../logger';
import { handleErrors } from './util';
import SessionService from '../../services/session-service';

interface IChangeUserRequest {
    password: string;
    confirmPassword: string;
}

interface UserRequest<PARAM, QUERY, BODY, RESPONSE>
    extends Request<PARAM, QUERY, BODY, RESPONSE> {
    user: User;
}

class UserController extends Controller {
    private accessService: AccessService;

    private userService: UserService;

    private sessionService: SessionService;

    private logger: Logger;

    constructor(
        config: IUnleashConfig,
        {
            accessService,
            userService,
            sessionService,
        }: Pick<
        IUnleashServices,
        'accessService' | 'userService' | 'sessionService'
        >,
    ) {
        super(config);
        this.accessService = accessService;
        this.userService = userService;
        this.sessionService = sessionService;
        this.logger = config.getLogger('lib/routes/admin-api/user.ts');

        this.get('/', this.getUser);
        this.post('/change-password', this.updateUserPass);
        this.get('/my-sessions', this.mySessions);
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

    async updateUserPass(
        req: UserRequest<any, any, IChangeUserRequest, any>,
        res: Response,
    ): Promise<void> {
        const { user } = req;
        if (user) {
            const { password, confirmPassword } = req.body;
            try {
                if (password === confirmPassword) {
                    this.userService.validatePassword(password);
                    await this.userService.changePassword(user.id, password);
                    res.status(200).end();
                } else {
                    res.status(400).end();
                }
            } catch (e) {
                handleErrors(res, this.logger, e);
            }
        } else {
            res.status(401).end();
        }
    }

    async mySessions(
        req: UserRequest<any, any, any, any>,
        res: Response,
    ): Promise<void> {
        const { user } = req;
        if (user) {
            try {
                const sessions = await this.sessionService.getSessionsForUser(
                    user.id,
                );
                res.json(sessions);
            } catch (e) {
                handleErrors(res, this.logger, e);
            }
        } else {
            res.status(401).end();
        }
    }
}

module.exports = UserController;
export default UserController;

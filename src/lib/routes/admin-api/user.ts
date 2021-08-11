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
import UserFeedbackService from '../../services/user-feedback-service';

interface IChangeUserRequest {
    password: string;
    confirmPassword: string;
}

export interface IUserRequest<PARAM, QUERY, BODY, RESPONSE>
    extends Request<PARAM, QUERY, BODY, RESPONSE> {
    user: User;
}

class UserController extends Controller {
    private accessService: AccessService;

    private userService: UserService;

    private userFeedbackService: UserFeedbackService;

    private sessionService: SessionService;

    private logger: Logger;

    constructor(
        config: IUnleashConfig,
        {
            accessService,
            userService,
            sessionService,
            userFeedbackService,
        }: Pick<
            IUnleashServices,
            | 'accessService'
            | 'userService'
            | 'sessionService'
            | 'userFeedbackService'
        >,
    ) {
        super(config);
        this.accessService = accessService;
        this.userService = userService;
        this.sessionService = sessionService;
        this.userFeedbackService = userFeedbackService;
        this.logger = config.getLogger('lib/routes/admin-api/user.ts');

        this.get('/', this.getUser);
        this.post('/change-password', this.updateUserPass);
        this.get('/my-sessions', this.mySessions);
    }

    async getUser(req: IAuthRequest, res: Response): Promise<void> {
        res.setHeader('cache-control', 'no-store');
        const { user } = req;
        const permissions = await this.accessService.getPermissionsForUser(
            user,
        );
        const feedback = await this.userFeedbackService.getAllUserFeedback(
            user,
        );

        // TODO: remove this line after we remove it from db.
        delete user.permissions;

        return res.status(200).json({ user, permissions, feedback }).end();
    }

    async updateUserPass(
        req: IUserRequest<any, any, IChangeUserRequest, any>,
        res: Response,
    ): Promise<void> {
        const { user } = req;
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
    }

    async mySessions(req: IAuthRequest, res: Response): Promise<void> {
        const { user } = req;
        try {
            const sessions = await this.sessionService.getSessionsForUser(
                user.id,
            );
            res.json(sessions);
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }
}

module.exports = UserController;
export default UserController;

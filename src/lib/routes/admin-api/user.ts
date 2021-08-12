import { Response } from 'express';
import { IAuthRequest } from '../unleash-types';
import Controller from '../controller';
import { AccessService } from '../../services/access-service';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import UserService from '../../services/user-service';
import SessionService from '../../services/session-service';
import UserFeedbackService from '../../services/user-feedback-service';

interface IChangeUserRequest {
    password: string;
    confirmPassword: string;
}

class UserController extends Controller {
    private accessService: AccessService;

    private userService: UserService;

    private userFeedbackService: UserFeedbackService;

    private sessionService: SessionService;

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
        req: IAuthRequest<any, any, IChangeUserRequest, any>,
        res: Response,
    ): Promise<void> {
        const { user } = req;
        const { password, confirmPassword } = req.body;
        if (password === confirmPassword) {
            this.userService.validatePassword(password);
            await this.userService.changePassword(user.id, password);
            res.status(200).end();
        } else {
            res.status(400).end();
        }
    }

    async mySessions(req: IAuthRequest, res: Response): Promise<void> {
        const { user } = req;
        const sessions = await this.sessionService.getSessionsForUser(user.id);
        res.json(sessions);
    }
}

module.exports = UserController;
export default UserController;

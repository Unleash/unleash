import { Response } from 'express';
import { IAuthRequest } from '../unleash-types';
import Controller from '../controller';
import { AccessService } from '../../services/access-service';
import { IAuthType, IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import UserService from '../../services/user-service';
import UserFeedbackService from '../../services/user-feedback-service';
import UserSplashService from '../../services/user-splash-service';
import { ADMIN, NONE } from '../../types/permissions';

interface IChangeUserRequest {
    password: string;
    confirmPassword: string;
}

class UserController extends Controller {
    private accessService: AccessService;

    private userService: UserService;

    private userFeedbackService: UserFeedbackService;

    private userSplashService: UserSplashService;

    constructor(
        config: IUnleashConfig,
        {
            accessService,
            userService,
            userFeedbackService,
            userSplashService,
        }: Pick<
            IUnleashServices,
            | 'accessService'
            | 'userService'
            | 'userFeedbackService'
            | 'userSplashService'
        >,
    ) {
        super(config);
        this.accessService = accessService;
        this.userService = userService;
        this.userFeedbackService = userFeedbackService;
        this.userSplashService = userSplashService;

        this.get('/', this.getUser);
        this.post('/change-password', this.updateUserPass, NONE);
    }

    async getUser(req: IAuthRequest, res: Response): Promise<void> {
        res.setHeader('cache-control', 'no-store');
        const { user } = req;
        let permissions;
        if (this.config.authentication.type === IAuthType.NONE) {
            permissions = [{ permission: ADMIN }];
        } else {
            permissions = await this.accessService.getPermissionsForUser(user);
        }
        const feedback = await this.userFeedbackService.getAllUserFeedback(
            user,
        );
        const splash = await this.userSplashService.getAllUserSplashs(user);

        return res
            .status(200)
            .json({ user, permissions, feedback, splash })
            .end();
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
}

module.exports = UserController;
export default UserController;

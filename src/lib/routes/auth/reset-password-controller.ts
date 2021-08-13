import { Request, Response } from 'express';
import Controller from '../controller';
import UserService from '../../services/user-service';
import { Logger } from '../../logger';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';

interface IValidateQuery {
    token: string;
}

interface IChangePasswordBody {
    token: string;
    password: string;
}

interface SessionRequest<PARAMS, QUERY, BODY, K>
    extends Request<PARAMS, QUERY, BODY, K> {
    user?;
}

class ResetPasswordController extends Controller {
    private userService: UserService;

    private logger: Logger;

    constructor(config: IUnleashConfig, { userService }: IUnleashServices) {
        super(config);
        this.logger = config.getLogger(
            'lib/routes/auth/reset-password-controller.ts',
        );
        this.userService = userService;
        this.get('/validate', this.validateToken);
        this.post('/password', this.changePassword);
        this.post('/validate-password', this.validatePassword);
        this.post('/password-email', this.sendResetPasswordEmail);
    }

    async sendResetPasswordEmail(req: Request, res: Response): Promise<void> {
        const { email } = req.body;

        await this.userService.createResetPasswordEmail(email);
        res.status(200).end();
    }

    async validatePassword(req: Request, res: Response): Promise<void> {
        const { password } = req.body;

        this.userService.validatePassword(password);
        res.status(200).end();
    }

    async validateToken(
        req: Request<unknown, unknown, unknown, IValidateQuery>,
        res: Response,
    ): Promise<void> {
        const { token } = req.query;
        const user = await this.userService.getUserForToken(token);
        await this.logout(req);
        res.status(200).json(user);
    }

    async changePassword(
        req: Request<unknown, unknown, IChangePasswordBody, unknown>,
        res: Response,
    ): Promise<void> {
        await this.logout(req);
        const { token, password } = req.body;
        await this.userService.resetPassword(token, password);
        res.status(200).end();
    }

    private async logout(req: SessionRequest<any, any, any, any>) {
        if (req.session) {
            req.session.destroy(() => {});
        }
    }
}

export default ResetPasswordController;
module.exports = ResetPasswordController;

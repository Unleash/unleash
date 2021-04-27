import { Request, Response } from 'express';
import Controller from '../controller';
import UserService from '../../services/user-service';
import { Logger } from '../../logger';
import { handleErrors } from '../admin-api/util';
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
    session?;
    user?;
}

const UNLEASH = 'Unleash';
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

        try {
            await this.userService.createResetPasswordEmail(email, UNLEASH);
            res.status(200).end();
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    async validatePassword(req: Request, res: Response): Promise<void> {
        const { password } = req.body;

        try {
            this.userService.validatePassword(password);
            res.status(200).end();
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    async validateToken(
        req: Request<unknown, unknown, unknown, IValidateQuery>,
        res: Response,
    ): Promise<void> {
        const { token } = req.query;
        try {
            const user = await this.userService.getUserForToken(token);
            await this.logout(req);
            res.status(200).json(user);
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    async changePassword(
        req: Request<unknown, unknown, IChangePasswordBody, unknown>,
        res: Response,
    ): Promise<void> {
        await this.logout(req);
        const { token, password } = req.body;
        try {
            await this.userService.resetPassword(token, password);
            res.status(200).end();
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    private async logout(req: SessionRequest<any, any, any, any>) {
        if (req.session) {
            req.session.destroy();
        }
    }
}

export default ResetPasswordController;
module.exports = ResetPasswordController;

import { Request, Response } from 'express';
import Controller from '../controller';
import UserService from '../../services/user-service';
import { IUnleashConfig } from '../../types/core';
import { Logger } from '../../logger';
import { handleErrors } from '../admin-api/util';

interface IServices {
    userService: UserService;
}

interface IValidateQuery {
    token: string;
}

class ResetPasswordController extends Controller {
    userService: UserService;

    logger: Logger;

    constructor(config: IUnleashConfig, { userService }: IServices) {
        super(config);
        this.logger = config.getLogger(
            'lib/routes/auth/reset-password-controller.ts',
        );
        this.userService = userService;
        this.get('/validate', this.validateToken);
        this.post('/password', this.changePassword);
    }

    async validateToken(
        req: Request<unknown, unknown, unknown, IValidateQuery>,
        res: Response,
    ): Promise<void> {
        const { token } = req.query;
        try {
            const user = await this.userService.getUserForToken(token);
            res.status(200).json(user);
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    async changePassword(req: Request, res: Response): Promise<void> {
        const { token, password, email } = req.body;
        try {
            await this.userService.resetPassword(email, token, password);
            res.status(200).end();
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }
}

export default ResetPasswordController;
module.exports = ResetPasswordController;

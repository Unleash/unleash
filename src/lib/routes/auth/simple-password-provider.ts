import { Request, Response } from 'express';
import { Logger } from '../../logger';
import { IUnleashConfig } from '../../server-impl';
import UserService from '../../services/user-service';
import { IUnleashServices } from '../../types';
import { NONE } from '../../types/permissions';
import Controller from '../controller';
import { IAuthRequest } from '../unleash-types';

class PasswordProvider extends Controller {
    private userService: UserService;

    private logger: Logger;

    constructor(config: IUnleashConfig, { userService }: Pick<IUnleashServices, 'userService'>) {
        super(config);
        this.logger = config.getLogger('/auth/password-provider.js');
        this.userService = userService;

        this.post('/login', this.login, NONE);
    }

    async login(req: IAuthRequest, res: Response): Promise<void> {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({
                message: 'You must provide username and password',
            });
            return;
        }

        const user = await this.userService.loginUser(username, password);
        req.session.user = user;
        res.status(200).json(user);
    }
}

export default PasswordProvider;

import { Response } from 'express';
import Controller from '../controller';
import { IUnleashServices } from '../../types';
import { IUnleashConfig } from '../../types/option';
import { Logger } from '../../logger';
import ClientInstanceService from '../../services/client-metrics/instance-service';
import { IAuthRequest, User } from '../../server-impl';
import { IClientApp } from '../../types/model';
import ApiUser from '../../types/api-user';
import { ALL } from '../../types/models/api-token';
import { NONE } from '../../types/permissions';

export default class RegisterController extends Controller {
    logger: Logger;

    metrics: ClientInstanceService;

    constructor(
        {
            clientInstanceService,
        }: Pick<IUnleashServices, 'clientInstanceService'>,
        config: IUnleashConfig,
    ) {
        super(config);
        this.logger = config.getLogger('/api/client/register');
        this.metrics = clientInstanceService;

        // NONE permission is not optimal here in terms of readability.
        this.post('/', this.handleRegister, NONE);
    }

    private resolveEnvironment(user: User, data: IClientApp) {
        if (user instanceof ApiUser) {
            if (user.environment !== ALL) {
                return user.environment;
            } else if (user.environment === ALL && data.environment) {
                return data.environment;
            }
        }
        return 'default';
    }

    async handleRegister(req: IAuthRequest, res: Response): Promise<void> {
        const { body: data, ip: clientIp, user } = req;
        data.environment = this.resolveEnvironment(user, data);
        await this.metrics.registerClient(data, clientIp);
        return res.status(202).end();
    }
}

import { Response } from 'express';
import Controller from '../controller';
import { IUnleashServices } from '../../types';
import { IUnleashConfig } from '../../types/option';
import { Logger } from '../../logger';
import ClientMetricsService from '../../services/client-metrics';
import { IAuthRequest, User } from '../../server-impl';
import { IClientApp } from '../../types/model';
import ApiUser from '../../types/api-user';
import { ALL } from '../../types/models/api-token';

export default class RegisterController extends Controller {
    logger: Logger;

    metrics: ClientMetricsService;

    constructor(
        {
            clientMetricsService,
        }: Pick<IUnleashServices, 'clientMetricsService'>,
        config: IUnleashConfig,
    ) {
        super(config);
        this.logger = config.getLogger('/api/client/register');
        this.metrics = clientMetricsService;
        this.post('/', this.handleRegister);
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

import { Request, Response } from 'express';
import Controller from '../controller';
import { IUnleashServices } from '../../types';
import { IUnleashConfig } from '../../types/option';
import ClientMetricsService from '../../services/client-metrics';
import { Logger } from '../../logger';
import { IAuthRequest } from '../unleash-types';
import ApiUser from '../../types/api-user';
import { ALL } from '../../types/models/api-token';

export default class ClientMetricsController extends Controller {
    logger: Logger;

    metrics: ClientMetricsService;

    constructor(
        {
            clientMetricsService,
        }: Pick<IUnleashServices, 'clientMetricsService'>,
        config: IUnleashConfig,
    ) {
        super(config);
        this.logger = config.getLogger('/api/client/metrics');
        this.metrics = clientMetricsService;

        this.post('/', this.registerMetrics);
    }

    async registerMetrics(req: IAuthRequest, res: Response): Promise<void> {
        const { body: data, ip: clientIp, user } = req;
        if (user instanceof ApiUser) {
            if (user.environment !== ALL) {
                data.environment = user.environment;
            }
        }
        await this.metrics.registerClientMetrics(data, clientIp);
        return res.status(202).end();
    }
}

module.exports = ClientMetricsController;

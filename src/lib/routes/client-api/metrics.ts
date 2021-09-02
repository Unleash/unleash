import { Request, Response } from 'express';
import Controller from '../controller';
import { IUnleashServices } from '../../types';
import { IUnleashConfig } from '../../types/option';
import ClientMetricsService from '../../services/client-metrics';
import { Logger } from '../../logger';

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

    async registerMetrics(
        req: Request<any, any, any, any>,
        res: Response,
    ): Promise<void> {
        const data = req.body;
        const clientIp = req.ip;

        await this.metrics.registerClientMetrics(data, clientIp);
        return res.status(202).end();
    }
}

module.exports = ClientMetricsController;

import { Request, Response } from 'express';
import Controller from '../controller';
import { IUnleashServices } from '../../types';
import { IUnleashConfig } from '../../types/option';
import { Logger } from '../../logger';
import ClientMetricsService from '../../services/client-metrics';

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

    async handleRegister(req: Request, res: Response): Promise<void> {
        const data = req.body;
        const clientIp = req.ip;
        await this.metrics.registerClient(data, clientIp);
        return res.status(202).end();
    }
}

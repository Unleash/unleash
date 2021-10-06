import { Response } from 'express';
import Controller from '../controller';
import { IUnleashServices } from '../../types';
import { IUnleashConfig } from '../../types/option';
import ClientMetricsService from '../../services/client-metrics';
import { Logger } from '../../logger';
import { IAuthRequest } from '../unleash-types';
import ApiUser from '../../types/api-user';
import { ALL } from '../../types/models/api-token';
import ClientMetricsServiceV2 from '../../services/client-metrics/client-metrics-service-v2';

export default class ClientMetricsController extends Controller {
    logger: Logger;

    metrics: ClientMetricsService;

    metricsV2: ClientMetricsServiceV2;

    newServiceEnabled: boolean = false;

    constructor(
        {
            clientMetricsService,
            clientMetricsServiceV2,
        }: Pick<
            IUnleashServices,
            'clientMetricsService' | 'clientMetricsServiceV2'
        >,
        config: IUnleashConfig,
    ) {
        super(config);
        const { experimental, getLogger } = config;
        if (experimental && experimental.metricsV2) {
            //@ts-ignore
            this.newServiceEnabled = experimental.metricsV2.enabled;
        }

        this.logger = getLogger('/api/client/metrics');
        this.metrics = clientMetricsService;
        this.metricsV2 = clientMetricsServiceV2;

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

        if (this.newServiceEnabled) {
            await this.metricsV2.registerClientMetrics(data, clientIp);
        }

        return res.status(202).end();
    }
}

module.exports = ClientMetricsController;

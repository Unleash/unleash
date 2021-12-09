import { Request, Response } from 'express';
import Controller from '../controller';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import { Logger } from '../../logger';
import ClientMetricsServiceV2 from '../../services/client-metrics/client-metrics-service-v2';

class ClientMetricsController extends Controller {
    private logger: Logger;

    private metrics: ClientMetricsServiceV2;

    constructor(
        config: IUnleashConfig,
        {
            clientMetricsServiceV2,
        }: Pick<IUnleashServices, 'clientMetricsServiceV2'>,
    ) {
        super(config);
        this.logger = config.getLogger('/admin-api/client-metrics.ts');

        this.metrics = clientMetricsServiceV2;

        this.get('/features/:name/raw', this.getRawToggleMetrics);
        this.get('/features/:name', this.getToggleMetricsSummary);
    }

    async getRawToggleMetrics(req: Request, res: Response): Promise<void> {
        const { name } = req.params;
        const data = await this.metrics.getClientMetricsForToggle(name);
        res.json({
            version: 1,
            maturity: 'stable',
            data,
        });
    }

    async getToggleMetricsSummary(req: Request, res: Response): Promise<void> {
        const { name } = req.params;
        const data = await this.metrics.getFeatureToggleMetricsSummary(name);
        res.json({
            version: 1,
            maturity: 'stable',
            ...data,
        });
    }
}
export default ClientMetricsController;

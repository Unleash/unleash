'use strict';

const Controller = require('../controller');

class ClientMetricsController extends Controller {
    constructor({ clientMetricsService }, getLogger) {
        super();
        this.logger = getLogger('/api/client/metrics');
        this.metrics = clientMetricsService;

        this.post('/', this.registerMetrics);
    }

    async registerMetrics(req, res) {
        const data = req.body;
        const clientIp = req.ip;

        try {
            await this.metrics.registerClientMetrics(data, clientIp);
            return res.status(202).end();
        } catch (e) {
            this.logger.error('Failed to store metrics', e);
            switch (e.name) {
                case 'ValidationError':
                    return res.status(400).end();
                default:
                    return res.status(500).end();
            }
        }
    }
}

module.exports = ClientMetricsController;

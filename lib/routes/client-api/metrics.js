'use strict';

const Controller = require('../controller');
const { clientMetricsSchema } = require('./metrics-schema');

class ClientMetricsController extends Controller {
    constructor(
        { clientMetricsStore, clientInstanceStore, featureToggleStore },
        getLogger,
    ) {
        super();
        this.logger = getLogger('/api/client/metrics');
        this.clientMetricsStore = clientMetricsStore;
        this.clientInstanceStore = clientInstanceStore;
        this.featureToggleStore = featureToggleStore;

        this.post('/', this.registerMetrics);
    }

    async registerMetrics(req, res) {
        const data = req.body;
        const clientIp = req.ip;

        const { error, value } = clientMetricsSchema.validate(data);

        if (error) {
            this.logger.warn('Invalid metrics posted', error);
            return res.status(400).json(error);
        }

        try {
            const toggleNames = Object.keys(value.bucket.toggles);
            await this.featureToggleStore.lastSeenToggles(toggleNames);
            await this.clientMetricsStore.insert(value);
            await this.clientInstanceStore.insert({
                appName: value.appName,
                instanceId: value.instanceId,
                clientIp,
            });
            return res.status(202).end();
        } catch (e) {
            this.logger.error('failed to store metrics', e);
            return res.status(500).end();
        }
    }
}

module.exports = ClientMetricsController;

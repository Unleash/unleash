'use strict';

const joi = require('joi');
const logger = require('../../logger')('client-api/metrics.js');

const Controller = require('../controller');
const { clientMetricsSchema } = require('./metrics-schema');

class ClientMetricsController extends Controller {
    constructor({ clientMetricsStore, clientInstanceStore }) {
        super();
        this.clientMetricsStore = clientMetricsStore;
        this.clientInstanceStore = clientInstanceStore;

        this.post('/', this.registerMetrics);
    }

    async registerMetrics(req, res) {
        const data = req.body;
        const clientIp = req.ip;

        const { error, value } = joi.validate(data, clientMetricsSchema);

        if (error) {
            logger.warn('Invalid metrics posted', error);
            return res.status(400).json(error);
        }

        try {
            await this.clientMetricsStore.insert(value);
            await this.clientInstanceStore.insert({
                appName: value.appName,
                instanceId: value.instanceId,
                clientIp,
            });
            res.status(202).end();
        } catch (e) {
            logger.error('failed to store metrics', e);
            res.status(500).end();
        }
    }
}

module.exports = ClientMetricsController;

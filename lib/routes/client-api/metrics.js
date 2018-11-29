'use strict';

const { Router } = require('express');
const joi = require('joi');
const logger = require('../../logger')('client-api/metrics.js');

const { clientMetricsSchema } = require('./metrics-schema');

class ClientMetricsController {
    constructor({ clientMetricsStore, clientInstanceStore }) {
        const router = Router();
        this.clientMetricsStore = clientMetricsStore;
        this.clientInstanceStore = clientInstanceStore;
        this._router = router;

        router.post('/', (req, res) => this.registerMetrics(req, res));
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

    router() {
        return this._router;
    }
}

module.exports = ClientMetricsController;

'use strict';

const logger = require('../logger');
const ClientMetrics = require('../client-metrics');
const ClientMetricsService = require('../client-metrics-service');

module.exports = function (app, config) {
    const metricsDb = config.metricsDb;
    const metrics = new ClientMetrics();
    const service = new ClientMetricsService(metricsDb);

    service.on('metrics', (entries) => {
        entries.forEach((m) => metrics.addPayload(m.metrics));
    });

    app.get('/service-metrics', (req, res) => {
        res.json(service.getMetrics());
    });

    app.get('/metrics', (req, res) => {
        res.json(metrics.getState());
    });

    app.post('/client/metrics', (req, res) => {
        try {
            const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            metrics.addPayload(data);
            service.insert(data);
        } catch (e) {
            logger.error('Error receiving metrics', e);
        }

        res.end();
    });

    app.post('/client/register', (req, res) => {
        try {
            const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            metrics.registerClient(data);
        } catch (e) {
            logger.error('Error registering client', e);
        }

        res.end();
    });
};

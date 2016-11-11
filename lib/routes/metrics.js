'use strict';

const logger = require('../logger');
const ClientMetrics = require('../client-metrics');
const ClientMetricsService = require('../client-metrics/service');
const joi = require('joi');
const { clientMetricsSchema, clientRegisterSchema } = require('./metrics-schema');

module.exports = function (app, config) {
    const {
        clientMetricsStore,
        clientStrategyStore,
        clientInstanceStore,
    } = config.stores;
    
    const metrics = new ClientMetrics();
    const service = new ClientMetricsService(clientMetricsStore);

    service.on('metrics', (entries) => {
        entries.forEach((m) => {
            metrics.addPayload(m.metrics);
        });
    });

    app.get('/metrics', (req, res) => {
        res.json(metrics.getMetricsOverview());
    });

    app.get('/metrics/features', (req, res) => {
        res.json(metrics.getTogglesMetrics());
    });

    app.post('/client/metrics', (req, res) => {
        const data = req.body;
        joi.validate(data, clientMetricsSchema, (err, cleaned) => {
            if (err) {
                return res.status(400).json(err);
            }
            service.insert(cleaned)
                .catch(e => logger.error('Error inserting metrics data', e));
            
            res.status(202).end();
        });
    });

    app.post('/client/register', (req, res) => {
        const data = req.body;
        const clientIp = req.ip;

        joi.validate(data, clientRegisterSchema, (err, cleaned) => {
            if (err) {
                return res.status(400).json(err);
            }

            clientStrategyStore.insert(cleaned.appName, cleaned.strategies)
                .then(() => clientInstanceStore.insert({
                    appName: cleaned.appName,
                    instanceId: cleaned.instanceId,
                    clientIp,
                }))
                .then(() => logger.info('New client registered!'))
                .catch((error) => logger.error('Error registering client', error));

            res.status(202).end();
        });
    });

    app.get('/client/strategies', (req, res) => {
        clientStrategyStore.getAll().then(data => res.json(data));
    });

    app.get('/client/instances', (req, res) => {
        clientInstanceStore.getAll()
            .then(data => res.json(data))
            .catch(err => logger.error(err));
    });
};

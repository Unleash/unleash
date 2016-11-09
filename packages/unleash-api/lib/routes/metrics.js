'use strict';

const logger = require('../logger');
const ClientMetrics = require('../client-metrics');
const ClientMetricsService = require('../client-metrics/service');
const joi = require('joi');

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

    const clientMetricsSchema = joi.object().keys({
        appName: joi.string().required(),
        instanceId: joi.string().required(),
        bucket: joi.object().required()
        .keys({
            start: joi.date().required(),
            stop: joi.date().required(),
            toggles: joi.object()
                .required()
                .unknown()
                .min(1)
                .max(1000),
        }),
    });

    app.post('/client/metrics', (req, res) => {
        try {
            const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            const result = joi.validate(data, clientMetricsSchema);
            if (result.error) {
                throw result.error;
            }
            service
                .insert(result.value)
                .catch(e => logger.error('Error inserting metrics data', e));
        } catch (e) {
            logger.error('Error receiving metrics', e);
        }
        res.end();
    });

    const clientRegisterSchema = joi.object().keys({
        appName: joi.string().required(),
        instanceId: joi.string().required(),
        strategies: joi.array()
            .required()
            .items(joi.string(), joi.any().strip()),
        started: joi.date().required(),
        interval: joi.number().required(),
    });

    app.post('/client/register', (req, res) => {
        const data = req.body;
        const clientIp = req.ip;

        joi.validate(data, clientRegisterSchema, (err, cleaned) => {
            if (err) {
                return res.json(400, err);
            }

            clientStrategyStore.insert(cleaned.appName, cleaned.strategies)
                .then(() => clientInstanceStore.insert({
                    appName: cleaned.appName,
                    instanceId: cleaned.instanceId,
                    clientIp,
                }))
                .then(() => console.log('new client registerd'))
                .catch((error) => logger.error('Error registering client', error));

            res.end();
        });
    });

    app.get('/client/strategies', (req, res) => {
        clientStrategyStore.getAll().then(data => res.json(data));
    });

    app.get('/client/instances', (req, res) => {
        clientInstanceStore.getAll()
            .then(data => res.json(data))
            .catch(err => console.error(err));
    });
};

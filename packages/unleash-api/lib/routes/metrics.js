'use strict';

const logger = require('../logger');
const ClientMetrics = require('../client-metrics');
const ClientMetricsService = require('../client-metrics-service');

module.exports = function (app, config) {
    const metricsDb = config.metricsDb;
    const metrics = new ClientMetrics();
    const service = new ClientMetricsService(metricsDb);

    app.get('/metrics', (req, res) => {
        res.json(service.getMetrics());

        // Your stuff:
        // res.json(metrics.getState());
    });

    app.post('/metrics', (req, res) => {
        
        // TODO: validate input and reply with http errorcode
        try {
            // not required with header: Content-Type: application/json
            // const data = JSON.parse(req.body);
            // metrics.addPayload(data);
            service.insert(req.body);
        } catch (e) {
            logger.error('Error recieving metrics', e);
        }

        res.end();
    });

    app.get('/metrics', (req, res) => {
        res.json(metrics.getState());
    });
};

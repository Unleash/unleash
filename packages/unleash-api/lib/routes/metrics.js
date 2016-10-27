'use strict';

const logger = require('../logger');
const ClientMetrics = require('../client-metrics');

module.exports = function (app) {
    const metrics = new ClientMetrics();

    app.get('/metrics', (req, res) => {
        res.json(metrics.getState());
    });

    app.post('/metrics', (req, res) => {
        // TODO: validate input and reply with http errorcode
        try {
            const data = JSON.parse(req.body);
            metrics.addPayload(data);
        } catch (e) {
            logger.error('Error recieving metrics', e);
        }

        res.end();
    });
};

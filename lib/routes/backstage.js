'use strict';

const prometheusRegister = require('prom-client/lib/register');

module.exports = function (app, config) {
    if (config.serverMetrics) {
        app.get('/internal-backstage/prometheus', (req, res) => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(prometheusRegister.metrics());
        });
    }
};

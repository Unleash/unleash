'use strict';

const { Router } = require('express');
const prometheusRegister = require('prom-client/lib/register');

exports.router = config => {
    const router = Router();

    if (config.serverMetrics) {
        router.get('/prometheus', (req, res) => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(prometheusRegister.metrics());
        });
    }

    return router;
};

'use strict';

const { Router } = require('express');
const { register: prometheusRegister } = require('prom-client');

exports.router = config => {
    const router = Router();

    if (config.serverMetrics) {
        router.get('/prometheus', (req, res) => {
            res.set('Content-Type', prometheusRegister.contentType);
            res.end(prometheusRegister.metrics());
        });
    }

    return router;
};

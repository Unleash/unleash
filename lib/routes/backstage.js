'use strict';

const { Router } = require('express');
const { register: prometheusRegister } = require('prom-client');

class BackstageController {
    constructor(config) {
        const router = Router();

        if (config.serverMetrics) {
            router.get('/prometheus', (req, res) => {
                res.set('Content-Type', prometheusRegister.contentType);
                res.end(prometheusRegister.metrics());
            });
        }

        this.app = router;
    }

    router() {
        return this.app;
    }
}

module.exports = BackstageController;

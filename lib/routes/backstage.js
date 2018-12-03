'use strict';

const { register: prometheusRegister } = require('prom-client');
const Controller = require('./controller');

class BackstageController extends Controller {
    constructor(config) {
        super();

        if (config.serverMetrics) {
            this.get('/prometheus', (req, res) => {
                res.set('Content-Type', prometheusRegister.contentType);
                res.end(prometheusRegister.metrics());
            });
        }
    }
}

module.exports = BackstageController;

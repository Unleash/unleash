'use strict';

const { register: prometheusRegister } = require('prom-client');
const Controller = require('./controller');

class BackstageController extends Controller {
    constructor(config) {
        super();

        this.logger = config.getLogger('backstage.js');

        if (config.serverMetrics) {
            this.get('/prometheus', async (req, res) => {
                res.set('Content-Type', prometheusRegister.contentType);
                res.end(await prometheusRegister.metrics());
            });
        }
    }
}

module.exports = BackstageController;

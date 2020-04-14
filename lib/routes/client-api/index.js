'use strict';

const Controller = require('../controller');
const FeatureController = require('./feature.js');
const MetricsController = require('./metrics.js');
const RegisterController = require('./register.js');
const apiDef = require('./api-def.json');

class ClientApi extends Controller {
    constructor(config) {
        super();

        const { stores } = config;
        const { getLogger } = config;

        this.get('/', this.index);
        this.use('/features', new FeatureController(stores, getLogger).router);
        this.use('/metrics', new MetricsController(stores, getLogger).router);
        this.use('/register', new RegisterController(stores, getLogger).router);
    }

    index(req, res) {
        res.json(apiDef);
    }
}

module.exports = ClientApi;

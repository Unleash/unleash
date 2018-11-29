'use strict';

const { Router } = require('express');
const FeatureController = require('./feature.js');
const MetricsController = require('./metrics.js');
const RegisterController = require('./register.js');
const apiDef = require('./api-def.json');

class ClientApi {
    constructor(config) {
        const router = Router();
        this._router = router;

        const stores = config.stores;

        router.get('/', this.index);
        router.use('/features', new FeatureController(stores).router());
        router.use('/metrics', new MetricsController(stores).router());
        router.use('/register', new RegisterController(stores).router());
    }

    index(req, res) {
        res.json(apiDef);
    }

    router() {
        return this._router;
    }
}

module.exports = ClientApi;

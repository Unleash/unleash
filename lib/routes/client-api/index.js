'use strict';

const { Router } = require('express');
const FeatureController = require('./feature.js');
const MetricsController = require('./metrics.js');
const RegisterController = require('./register.js');
const clientApiSpec = require('./client-api.json');

class ClientApi {
    constructor(config) {
        const router = Router();
        this._router = router;

        router.get('/', this.index);
        router.use('/features', new FeatureController(config).router());
        router.use('/metrics', new MetricsController(config).router());
        router.use('/register', new RegisterController(config).router());
    }

    index(req, res) {
        res.json(clientApiSpec);
    }

    router() {
        return this._router;
    }
}

ClientApi.api = clientApiSpec;

module.exports = ClientApi;

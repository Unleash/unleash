'use strict';

const { Router } = require('express');
const FeatureController = require('./feature.js');
const ClientMetricsController = require('./metrics.js');
const register = require('./register.js');
const clientApi = require('./client-api.json');

class ClientApi {
    constructor(config) {
        const router = Router();
        this._router = router;

        router.get('/', this.index);
        router.use('/features', new FeatureController(config).router());
        router.use('/metrics', new ClientMetricsController(config).router());
        router.use('/register', register.router(config));
    }

    index(req, res) {
        res.json(clientApi);
    }

    router() {
        return this._router;
    }
}

ClientApi.api = clientApi;

module.exports = ClientApi;

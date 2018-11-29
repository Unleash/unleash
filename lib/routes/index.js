'use strict';

const { Router } = require('express');
const AdminApi = require('./admin-api');
const ClientApi = require('./client-api');
const FeatureController = require('./client-api/feature.js');

const HealthCheckController = require('./health-check');
const BackstageCTR = require('./backstage.js');
const api = require('./api-def');

class IndexRouter {
    constructor(config) {
        const router = Router();
        this._router = router;

        router.use('/health', new HealthCheckController(config).router());
        router.use('/internal-backstage', new BackstageCTR(config).router());
        router.get(api.uri, (req, res) => res.json(api));
        router.use(api.links.admin.uri, new AdminApi(config).router());
        router.use(api.links.client.uri, new ClientApi(config).router());

        // legacy support (remove in 4.x)
        if (config.enableLegacyRoutes) {
            router.use(
                '/api/features',
                new FeatureController(config.stores).router()
            );
        }
    }

    router() {
        return this._router;
    }
}

module.exports = IndexRouter;

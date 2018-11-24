'use strict';

const { Router } = require('express');
// export module version
require('pkginfo')(module, 'version');

const version = module.exports.version;

const adminApi = require('./admin-api');
const ClientApi = require('./client-api');
const FeatureController = require('./client-api/feature.js');

const HealthCheckController = require('./health-check');
const BackstageController = require('./backstage.js');

class IndexRouter {
    constructor(config) {
        const router = Router();
        this._router = router;

        router.use('/health', new HealthCheckController(config).router());
        router.use(
            '/internal-backstage',
            new BackstageController(config).router()
        );
        router.get('/api', (req, res) => this.api(req, res));
        router.use('/api/admin', adminApi.router(config));
        router.use('/api/client', new ClientApi(config).router());

        // legacy support (remove in 4.x)
        if (config.enableLegacyRoutes) {
            router.use('/api/features', new FeatureController(config).router());
        }
    }

    api(req, res) {
        res.json({
            name: 'unleash-server',
            version,
            links: {
                admin: {
                    uri: '/api/admin',
                    links: adminApi.apiDef.links,
                },
                client: {
                    uri: '/api/client',
                    links: ClientApi.api.links,
                },
            },
        });
    }

    router() {
        return this._router;
    }
}

module.exports = IndexRouter;

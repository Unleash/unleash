'use strict';

const { Router } = require('express');
// export module version
require('pkginfo')(module, 'version');

const version = module.exports.version;

const adminApi = require('./admin-api');
const clientApi = require('./client-api');
const clientFeatures = require('./client-api/feature.js');

const HealthCheckController = require('./health-check');
const BackstageController = require('./backstage.js');

exports.router = function(config) {
    const router = Router();

    router.use('/health', new HealthCheckController(config).router());
    router.use('/internal-backstage', new BackstageController(config).router());

    router.get('/api', (req, res) => {
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
                    links: clientApi.apiDef.links,
                },
            },
        });
    });

    router.use('/api/admin', adminApi.router(config));
    router.use('/api/client', clientApi.router(config));

    // legacy support
    // $root/features
    // $root/client/register
    // $root/client/metrics
    if (config.enableLegacyRoutes) {
        router.use('/api/features', clientFeatures.router(config));
    }

    return router;
};

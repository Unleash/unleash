'use strict';

const { Router } = require('express');
const version = require('project-version');

const adminApi = require('./admin-api');
const clientApi = require('./client-api');
const clientFeatures = require('./client-api/feature.js');

const health = require('./health-check');
const backstage = require('./backstage.js');

exports.router = function(config) {
    const router = Router();

    router.use('/health', health.router(config));
    router.use('/internal-backstage', backstage.router(config));

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

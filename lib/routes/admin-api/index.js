'use strict';

const { Router } = require('express');

const features = require('./feature.js');
const featureArchive = require('./archive.js');
const events = require('./event.js');
const strategies = require('./strategy');
const metrics = require('./metrics');
const user = require('./user');

const apiDef = {
    version: 2,
    links: {
        'feature-toggles': { uri: '/api/admin/features' },
        'feature-archive': { uri: '/api/admin/archive' },
        strategies: { uri: '/api/admin/strategies' },
        events: { uri: '/api/admin/events' },
        metrics: { uri: '/api/admin/metrics' },
    },
};

exports.apiDef = apiDef;

exports.router = config => {
    const router = Router();

    router.get('/', (req, res) => res.json(apiDef));

    router.use('/features', features.router(config));
    router.use('/archive', featureArchive.router(config));
    router.use('/strategies', strategies.router(config));
    router.use('/events', events.router(config));
    router.use('/metrics', metrics.router(config));
    router.use('/user', user.router(config));

    return router;
};

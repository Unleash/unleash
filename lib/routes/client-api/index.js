'use strict';

const { Router } = require('express');
const features = require('./feature.js');
const metrics = require('./metrics.js');
const register = require('./register.js');

const apiDef = {
    version: 2,
    links: {
        'feature-toggles': { uri: '/api/client/features' },
        register: { uri: '/api/client/register' },
        metrics: { uri: '/api/client/metrics' },
    },
};

exports.apiDef = apiDef;

exports.router = config => {
    const router = Router();
    router.get('/', (req, res) => {
        res.json(apiDef);
    });

    router.use('/features', features.router(config));
    router.use('/metrics', metrics.router(config));
    router.use('/register', register.router(config));

    return router;
};

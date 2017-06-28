'use strict';

const { Router } = require('express');

const version = 1;

exports.router = config => {
    const router = Router();
    const { featureToggleStore } = config.stores;

    router.get('/', (req, res) => {
        featureToggleStore
            .getFeatures()
            .then(features => res.json({ version, features }));
    });

    return router;
};

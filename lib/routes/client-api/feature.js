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

    router.get('/:featureName', (req, res) => {
        featureToggleStore
            .getFeature(req.params.featureName)
            .then(feature => res.json(feature).end())
            .catch(() =>
                res.status(404).json({ error: 'Could not find feature' })
            );
    });

    return router;
};

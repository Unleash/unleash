'use strict';

const { Router } = require('express');

const logger = require('../../logger')('/admin-api/archive.js');
const { FEATURE_REVIVED } = require('../../event-type');
const ValidationError = require('../../error/validation-error');
const validateRequest = require('../../error/validate-request');

const handleErrors = (req, res, error) => {
    switch (error.constructor) {
        case ValidationError:
            return res
                .status(400)
                .json(req.validationErrors())
                .end();
        default:
            logger.error('Server failed executing request', error);
            return res.status(500).end();
    }
};

module.exports.router = function(config) {
    const { featureToggleStore, eventStore } = config.stores;
    const router = Router();

    router.get('/features', (req, res) => {
        featureToggleStore.getArchivedFeatures().then(archivedFeatures => {
            res.json({ features: archivedFeatures });
        });
    });

    router.post('/revive/:name', (req, res) => {
        req.checkParams('name', 'Name is required').notEmpty();

        validateRequest(req)
            .then(() =>
                eventStore.store({
                    type: FEATURE_REVIVED,
                    createdBy: req.connection.remoteAddress,
                    data: { name: req.params.name },
                })
            )
            .then(() => res.status(200).end())
            .catch(error => handleErrors(req, res, error));
    });

    return router;
};

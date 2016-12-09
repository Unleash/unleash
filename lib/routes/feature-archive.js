'use strict';

const logger = require('../logger');
const { FEATURE_REVIVED } = require('../event-type');
const ValidationError = require('../error/validation-error');
const validateRequest = require('../error/validate-request');

const handleErrors = (req, res, error) => {
    switch (error.constructor) {
        case ValidationError:
            return res
                .status(400)
                .json(req.validationErrors())
                .end();
        default:
            logger.error('Server failed executing request', error);
            return res
                .status(500)
                .end();
    }
};

module.exports = function (app, config) {
    const { featureToggleStore, eventStore } = config.stores;

    app.get('/archive/features', (req, res) => {
        featureToggleStore.getArchivedFeatures().then(archivedFeatures => {
            res.json({ features: archivedFeatures });
        });
    });

    app.post('/archive/revive', (req, res) => {
        req.checkBody('name', 'Name is required').notEmpty();

        validateRequest(req)
            .then(() => eventStore.store({
                type: FEATURE_REVIVED,
                createdBy: req.connection.remoteAddress,
                data: req.body,
            }))
            .then(() => res.status(200).end())
            .catch(error => handleErrors(req, res, error));
    });
};

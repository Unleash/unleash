'use strict';
const logger = require('../logger');
const eventType = require('../eventType');
const ValidationError = require('../error/ValidationError');
const validateRequest = require('../error/validateRequest');

module.exports = function (app, config) {
    const featureDb = config.featureDb;
    const eventStore = config.eventStore;

    app.get('/archive/features', (req, res) => {
        featureDb.getArchivedFeatures().then(archivedFeatures => {
            res.json({ features: archivedFeatures });
        });
    });

    app.post('/archive/revive', (req, res) => {
        req.checkBody('name', 'Name is required').notEmpty();

        validateRequest(req)
            .then(() => eventStore.create({
                type: eventType.featureRevived,
                createdBy: req.connection.remoteAddress,
                data: req.body,
            })).then(() => {
                res.status(200).end();
            }).catch(ValidationError, () => {
                res.status(400).json(req.validationErrors());
            })
            .catch(err => {
                logger.error('Could not revive feature toggle', err);
                res.status(500).end();
            });
    });
};

'use strict';
const Promise             = require("bluebird");
const logger              = require('../logger');
const eventType           = require('../eventType');
const NameExistsError     = require('../error/NameExistsError');
const NotFoundError       = require('../error/NotFoundError');
const ValidationError     = require('../error/ValidationError');
const validateRequest     = require('../error/validateRequest');
const extractUser         = require('../extractUser');

module.exports = function (app, config) {
    const featureDb = config.featureDb;
    const eventStore = config.eventStore;

    app.get('/features', (req, res) => {
        featureDb.getFeatures().then(features => {
            res.json({ features });
        });
    });

    app.get('/features/:featureName', (req, res) => {
        featureDb.getFeature(req.params.featureName)
            .then(feature => {
                res.json(feature);
            })
            .catch(() => {
                res.status(404).json({ error: 'Could not find feature' });
            });
    });

    app.post('/features', (req, res) => {
        req.checkBody('name', 'Name is required').notEmpty();
        req.checkBody('name', 'Name must match format ^[a-zA-Z\\.\\-]+$').matches(/^[a-zA-Z\\.\\-]+$/i);

        validateRequest(req)
            .then(validateUniqueName)
            .then(() => eventStore.create({
            type: eventType.featureCreated,
            createdBy: extractUser(req),
            data: req.body
        }))
            .then(() => {
                res.status(201).end();
            })
            .catch(NameExistsError, () => {
                res.status(403).json([{
                    msg: `A feature named '${req.body.name}' already exists. It could be archived.`
                }]).end();
            })
            .catch(ValidationError, () => {
                res.status(400).json(req.validationErrors());
            })
            .catch(err => {
                logger.error("Could not create feature toggle", err);
                res.status(500).end();
            });
    });

    app.put('/features/:featureName', (req, res) => {
        const featureName    = req.params.featureName;
        const userName       = extractUser(req);
        const updatedFeature = req.body;

        updatedFeature.name = featureName;

        featureDb.getFeature(featureName)
            .then(() => eventStore.create({
            type: eventType.featureUpdated,
            createdBy: userName,
            data: updatedFeature
        }))
            .then(() => {
                res.status(200).end();
            })
            .catch(NotFoundError, () => {
                res.status(404).end();
            })
            .catch(err => {
                logger.error(`Could not update feature toggle=${featureName}`, err);
                res.status(500).end();
            });
    });

    app.delete('/features/:featureName', (req, res) => {
        const featureName    = req.params.featureName;
        const userName       = extractUser(req);

        featureDb.getFeature(featureName)
            .then(() => eventStore.create({
            type: eventType.featureArchived,
            createdBy: userName,
            data: {
                name: featureName
            }
        }))
            .then(() => {
                res.status(200).end();
            })
            .catch(NotFoundError, () => {
                res.status(404).end();
            })
            .catch(err => {
                logger.error(`Could not archive feature=${featureName}`, err);
                res.status(500).end();
            });
    });

    function validateUniqueName(req) {
        return new Promise((resolve, reject) => {
            featureDb.getFeature(req.body.name)
                .then(() => {
                    reject(new NameExistsError("Feature name already exist"));
                }, () => {
                    resolve(req);
                });
        });
    }
};

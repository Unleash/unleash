'use strict';

const logger = require('../logger');
const eventType = require('../event-type');
const NameExistsError = require('../error/name-exists-error');
const NotFoundError = require('../error/notfound-error');
const ValidationError = require('../error/validation-error.js');
const validateRequest = require('../error/validate-request');
const extractUser = require('../extract-user');

const legacyFeatureMapper = require('../data-helper/legacy-feature-mapper');
const version = 1;

const handleErrors = (req, res, error) => {
    switch (error.constructor) {
        case NotFoundError:
            return res
                .status(404)
                .end();
        case NameExistsError:
            return res
                .status(403)
                .json([{ msg: `A feature named '${req.body.name}' already exists.` }])
                .end();
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

    app.get('/features', (req, res) => {
        featureToggleStore.getFeatures()
            .then((features) => features.map(legacyFeatureMapper.addOldFields))
            .then(features => res.json({ version, features }));
    });

    app.get('/features/:featureName', (req, res) => {
        featureToggleStore.getFeature(req.params.featureName)
            .then(legacyFeatureMapper.addOldFields)
            .then(feature => res.json(feature).end())
            .catch(() => res.status(404).json({ error: 'Could not find feature' }));
    });

    app.post('/features-validate', (req, res) => {
        req.checkBody('name', 'Name is required').notEmpty();
        req.checkBody('name', 'Name must match format ^[0-9a-zA-Z\\.\\-]+$').matches(/^[0-9a-zA-Z\\.\\-]+$/i);

        validateRequest(req)
            .then(validateFormat)
            .then(validateUniqueName)
            .then(() => res.status(201).end())
            .catch(error => handleErrors(req, res, error));
    });

    app.post('/features', (req, res) => {
        req.checkBody('name', 'Name is required').notEmpty();
        req.checkBody('name', 'Name must match format ^[0-9a-zA-Z\\.\\-]+$').matches(/^[0-9a-zA-Z\\.\\-]+$/i);

        validateRequest(req)
            .then(validateFormat)
            .then(validateUniqueName)
            .then(() => eventStore.store({
                type: eventType.featureCreated,
                createdBy: extractUser(req),
                data: legacyFeatureMapper.toNewFormat(req.body),
            }))
            .then(() => res.status(201).end())
            .catch(error => handleErrors(req, res, error));
    });

    app.put('/features/:featureName', (req, res) => {
        const featureName    = req.params.featureName;
        const userName       = extractUser(req);
        const updatedFeature = legacyFeatureMapper.toNewFormat(req.body);

        updatedFeature.name = featureName;

        featureToggleStore.getFeature(featureName)
            .then(() => eventStore.store({
                type: eventType.featureUpdated,
                createdBy: userName,
                data: updatedFeature,
            }))
            .then(() => res.status(200).end())
            .catch(error => handleErrors(req, res, error));
    });

    app.delete('/features/:featureName', (req, res) => {
        const featureName    = req.params.featureName;
        const userName       = extractUser(req);

        featureToggleStore.getFeature(featureName)
            .then(() => eventStore.store({
                type: eventType.featureArchived,
                createdBy: userName,
                data: {
                    name: featureName,
                },
            }))
            .then(() => res.status(200).end())
            .catch(error => handleErrors(req, res, error));
    });

    function validateUniqueName (req) {
        return new Promise((resolve, reject) => {
            featureToggleStore.getFeature(req.body.name)
                .then(() => reject(new NameExistsError('Feature name already exist')))
                .catch(() => resolve(req));
        });
    }

    function validateFormat (req) {
        if (req.body.strategy && req.body.strategies) {
            return Promise.reject(new ValidationError('Cannot use both "strategy" and "strategies".'));
        }

        return Promise.resolve(req);
    }
};

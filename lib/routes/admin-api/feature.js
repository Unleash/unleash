'use strict';

const { Router } = require('express');
const joi = require('joi');

const logger = require('../../logger')('/admin-api/feature.js');
const {
    FEATURE_CREATED,
    FEATURE_UPDATED,
    FEATURE_ARCHIVED,
} = require('../../event-type');
const NameExistsError = require('../../error/name-exists-error');
const NotFoundError = require('../../error/notfound-error');
const ValidationError = require('../../error/validation-error.js');
const validateRequest = require('../../error/validate-request');
const extractUser = require('../../extract-user');

const handleErrors = (req, res, error) => {
    logger.warn('Error creating or updating feature', error);
    switch (error.constructor) {
        case NotFoundError:
            return res.status(404).end();
        case NameExistsError:
            return res
                .status(403)
                .json([{ msg: error.message }])
                .end();
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

const strategiesSchema = joi.object().keys({
    name: joi
        .string()
        .regex(/^[a-zA-Z0-9\\.\\-]{3,100}$/)
        .required(),
    parameters: joi.object(),
});

function validateStrategy(featureToggle) {
    return new Promise((resolve, reject) => {
        if (
            !featureToggle.strategies ||
            featureToggle.strategies.length === 0
        ) {
            return reject(
                new ValidationError('You must define at least one strategy')
            );
        }

        featureToggle.strategies = featureToggle.strategies.map(
            strategyConfig => {
                const result = joi.validate(strategyConfig, strategiesSchema);
                if (result.error) {
                    throw result.error;
                }
                return result.value;
            }
        );

        return resolve(featureToggle);
    });
}

const variationsSchema = joi.array().unique('name');

const variationSchema = joi.object().keys({
    name: joi
        .string()
        .regex(/^[a-zA-Z0-9.-]{3,100}$/)
        .required(),
});

function validateVariations(featureToggle) {
    return new Promise((resolve, reject) => {
        let result = joi.validate(featureToggle.variations, variationsSchema);

        if (result.error) {
            let variationsError = result.error;
            if (result.error.message.indexOf('duplicate') > 0) {
                variationsError = new NameExistsError(
                    'Variations with duplicate name exist'
                );
            }
            return reject(variationsError);
        }

        featureToggle.variations = result.value;

        featureToggle.variations = featureToggle.variations.map(
            variationConfig => {
                result = joi.validate(variationConfig, variationSchema);
                if (result.error) {
                    throw result.error;
                }
                return result.value;
            }
        );

        return resolve(featureToggle);
    });
}

const version = 1;

module.exports.router = function(config) {
    const { featureToggleStore, eventStore } = config.stores;
    const router = Router();

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

    function validateUniqueName(req) {
        return new Promise((resolve, reject) => {
            featureToggleStore
                .hasFeature(req.body.name)
                .then(definition => {
                    const msg = definition.archived
                        ? 'An archived toggle with that name already exist'
                        : 'A toggle with that name already exist';
                    reject(new NameExistsError(msg));
                })
                .catch(() => resolve(req));
        });
    }

    router.post('/validate', (req, res) => {
        req.checkBody('name', 'Name is required').notEmpty();
        req.checkBody('name', 'Name must be URL friendly').isUrlFriendlyName();

        validateRequest(req)
            .then(validateUniqueName)
            .then(() => res.status(201).end())
            .catch(error => handleErrors(req, res, error));
    });

    router.post('/', (req, res) => {
        req.checkBody('name', 'Name is required').notEmpty();
        req.checkBody('name', 'Name must be URL friendly').isUrlFriendlyName();

        const userName = extractUser(req);

        validateRequest(req)
            .then(validateUniqueName)
            .then(_req => _req.body)
            .then(validateStrategy)
            .then(validateVariations)
            .then(featureToggle =>
                eventStore.store({
                    type: FEATURE_CREATED,
                    createdBy: userName,
                    data: featureToggle,
                })
            )
            .then(() => res.status(201).end())
            .catch(error => handleErrors(req, res, error));
    });

    router.put('/:featureName', (req, res) => {
        const featureName = req.params.featureName;
        const userName = extractUser(req);
        const updatedFeature = req.body;

        updatedFeature.name = featureName;

        featureToggleStore
            .getFeature(featureName)
            .then(() => validateStrategy(updatedFeature))
            .then(() => validateVariations(updatedFeature))
            .then(() =>
                eventStore.store({
                    type: FEATURE_UPDATED,
                    createdBy: userName,
                    data: updatedFeature,
                })
            )
            .then(() => res.status(200).end())
            .catch(error => handleErrors(req, res, error));
    });

    router.post('/:featureName/toggle', (req, res) => {
        const featureName = req.params.featureName;
        const userName = extractUser(req);

        featureToggleStore
            .getFeature(featureName)
            .then(feature => {
                feature.enabled = !feature.enabled;
                return eventStore.store({
                    type: FEATURE_UPDATED,
                    createdBy: userName,
                    data: feature,
                });
            })
            .then(() => res.status(200).end())
            .catch(error => handleErrors(req, res, error));
    });

    router.delete('/:featureName', (req, res) => {
        const featureName = req.params.featureName;
        const userName = extractUser(req);

        featureToggleStore
            .getFeature(featureName)
            .then(() =>
                eventStore.store({
                    type: FEATURE_ARCHIVED,
                    createdBy: userName,
                    data: {
                        name: featureName,
                    },
                })
            )
            .then(() => res.status(200).end())
            .catch(error => handleErrors(req, res, error));
    });

    return router;
};

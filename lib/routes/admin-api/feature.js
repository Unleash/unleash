'use strict';

const Controller = require('../controller');
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

const version = 1;

class FeatureController extends Controller {
    constructor({ featureToggleStore, eventStore }) {
        super();
        this.featureToggleStore = featureToggleStore;
        this.eventStore = eventStore;

        this.get('/', this.getAllToggles);
        this.post('/', this.createToggle);
        this.get('/:featureName', this.getToggle);
        this.put('/:featureName', this.updateToggle);
        this.delete('/:featureName', this.deleteToggle);
        this.post('/validate', this.validate);
        this.post('/:featureName/toggle', this.toggle);
    }

    async getAllToggles(req, res) {
        const features = await this.featureToggleStore.getFeatures();
        res.json({ version, features });
    }

    async getToggle(req, res) {
        try {
            const featureName = req.params.featureName;
            const feature = await this.featureToggleStore.getFeature(
                featureName
            );
            res.json(feature).end();
        } catch (err) {
            res.status(404).json({ error: 'Could not find feature' });
        }
    }

    async validate(req, res) {
        req.checkBody('name', 'Name is required').notEmpty();
        req.checkBody('name', 'Name must be URL friendly').isUrlFriendlyName();

        try {
            await validateRequest(req);
            await this.validateUniqueName(req);
            res.status(201).end();
        } catch (error) {
            handleErrors(req, res, error);
        }
    }

    validateUniqueName(req) {
        return new Promise((resolve, reject) => {
            this.featureToggleStore
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

    async createToggle(req, res) {
        req.checkBody('name', 'Name is required').notEmpty();
        req.checkBody('name', 'Name must be URL friendly').isUrlFriendlyName();

        const userName = extractUser(req);

        try {
            await validateRequest(req);
            await this.validateUniqueName(req);
            const featureToggle = await validateStrategy(req.body);
            await this.eventStore.store({
                type: FEATURE_CREATED,
                createdBy: userName,
                data: featureToggle,
            });
            res.status(201).end();
        } catch (error) {
            handleErrors(req, res, error);
        }
    }

    async updateToggle(req, res) {
        const featureName = req.params.featureName;
        const userName = extractUser(req);
        const updatedFeature = req.body;

        updatedFeature.name = featureName;

        try {
            await this.featureToggleStore.getFeature(featureName);
            await validateStrategy(updatedFeature);
            await this.eventStore.store({
                type: FEATURE_UPDATED,
                createdBy: userName,
                data: updatedFeature,
            });
            res.status(200).end();
        } catch (error) {
            handleErrors(req, res, error);
        }
    }

    async toggle(req, res) {
        const featureName = req.params.featureName;
        const userName = extractUser(req);

        try {
            const feature = await this.featureToggleStore.getFeature(
                featureName
            );

            feature.enabled = !feature.enabled;
            await this.eventStore.store({
                type: FEATURE_UPDATED,
                createdBy: userName,
                data: feature,
            });
            res.status(200).end();
        } catch (error) {
            handleErrors(req, res, error);
        }
    }

    async deleteToggle(req, res) {
        const featureName = req.params.featureName;
        const userName = extractUser(req);

        try {
            await this.featureToggleStore.getFeature(featureName);
            await this.eventStore.store({
                type: FEATURE_ARCHIVED,
                createdBy: userName,
                data: {
                    name: featureName,
                },
            });
            res.status(200).end();
        } catch (error) {
            handleErrors(req, res, error);
        }
    }
}

module.exports = FeatureController;

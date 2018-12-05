'use strict';

const Controller = require('../controller');
const joi = require('joi');

const {
    FEATURE_CREATED,
    FEATURE_UPDATED,
    FEATURE_ARCHIVED,
} = require('../../event-type');
const NameExistsError = require('../../error/name-exists-error');
const NameInvalidError = require('../../error/name-invalid-error');
const { isUrlFriendlyName, handleErrors } = require('./util');
const extractUser = require('../../extract-user');
const { featureShema } = require('./feature-schema');
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
        const name = req.body.name;

        try {
            await this.validateNameFormat(name);
            await this.validateUniqueName(name);
            res.status(201).end();
        } catch (error) {
            handleErrors(res, error);
        }
    }

    // TODO: cleanup this validation
    async validateUniqueName(name) {
        let msg;
        try {
            const definition = await this.featureToggleStore.hasFeature(name);
            msg = definition.archived
                ? 'An archived toggle with that name already exist'
                : 'A toggle with that name already exist';
        } catch (error) {
            // No conflict, everything ok!
            return;
        }

        // Interntional throw here!
        throw new NameExistsError(msg);
    }

    // TODO: this should be part of the schema validation!
    validateNameFormat(name) {
        if (!isUrlFriendlyName(name)) {
            throw new NameInvalidError('Name must be URL friendly');
        }
    }

    async createToggle(req, res) {
        const toggleName = req.body.name;
        const userName = extractUser(req);

        try {
            await this.validateNameFormat(toggleName);
            await this.validateUniqueName(toggleName);
            const featureToggle = await joi.validate(req.body, featureShema);
            await this.eventStore.store({
                type: FEATURE_CREATED,
                createdBy: userName,
                data: featureToggle,
            });
            res.status(201).end();
        } catch (error) {
            handleErrors(res, error);
        }
    }

    async updateToggle(req, res) {
        const featureName = req.params.featureName;
        const userName = extractUser(req);
        const updatedFeature = req.body;

        updatedFeature.name = featureName;

        try {
            await this.featureToggleStore.getFeature(featureName);
            await joi.validate(updatedFeature, featureShema);
            await this.eventStore.store({
                type: FEATURE_UPDATED,
                createdBy: userName,
                data: updatedFeature,
            });
            res.status(200).end();
        } catch (error) {
            handleErrors(res, error);
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
            handleErrors(res, error);
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
            handleErrors(res, error);
        }
    }
}

module.exports = FeatureController;

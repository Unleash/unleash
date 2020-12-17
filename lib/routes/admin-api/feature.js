const Controller = require('../controller');

const {
    FEATURE_CREATED,
    FEATURE_UPDATED,
    FEATURE_ARCHIVED,
} = require('../../event-type');
const NameExistsError = require('../../error/name-exists-error');
const { handleErrors } = require('./util');
const extractUser = require('../../extract-user');
const {
    UPDATE_FEATURE,
    DELETE_FEATURE,
    CREATE_FEATURE,
} = require('../../permissions');
const { featureShema, nameSchema } = require('./feature-schema');

const version = 1;

class FeatureController extends Controller {
    constructor(config) {
        super(config);
        this.featureToggleStore = config.stores.featureToggleStore;
        this.eventStore = config.stores.eventStore;
        this.logger = config.getLogger('/admin-api/feature.js');

        this.get('/', this.getAllToggles);
        this.post('/', this.createToggle, CREATE_FEATURE);
        this.get('/:featureName', this.getToggle);
        this.put('/:featureName', this.updateToggle, UPDATE_FEATURE);
        this.delete('/:featureName', this.deleteToggle, DELETE_FEATURE);
        this.post('/validate', this.validate);
        this.post('/:featureName/toggle', this.toggle, UPDATE_FEATURE);
        this.post('/:featureName/toggle/on', this.toggleOn, UPDATE_FEATURE);
        this.post('/:featureName/toggle/off', this.toggleOff, UPDATE_FEATURE);
        this.post('/:featureName/stale/on', this.staleOn, UPDATE_FEATURE);
        this.post('/:featureName/stale/off', this.staleOff, UPDATE_FEATURE);
    }

    async getAllToggles(req, res) {
        const features = await this.featureToggleStore.getFeatures();
        res.json({ version, features });
    }

    async getToggle(req, res) {
        try {
            const name = req.params.featureName;
            const feature = await this.featureToggleStore.getFeature(name);
            res.json(feature).end();
        } catch (err) {
            res.status(404).json({ error: 'Could not find feature' });
        }
    }

    async validate(req, res) {
        const { name } = req.body;

        try {
            await nameSchema.validateAsync({ name });
            await this.validateUniqueName(name);
            res.status(201).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
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

    async createToggle(req, res) {
        const toggleName = req.body.name;
        const userName = extractUser(req);

        try {
            await this.validateUniqueName(toggleName);
            const value = await featureShema.validateAsync(req.body);

            await this.eventStore.store({
                type: FEATURE_CREATED,
                createdBy: userName,
                data: value,
            });
            res.status(201).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async updateToggle(req, res) {
        const { featureName } = req.params;
        const userName = extractUser(req);
        const updatedFeature = req.body;

        updatedFeature.name = featureName;

        try {
            await this.featureToggleStore.getFeature(featureName);
            const value = await featureShema.validateAsync(updatedFeature);
            await this.eventStore.store({
                type: FEATURE_UPDATED,
                createdBy: userName,
                data: value,
            });
            res.status(200).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    // Kept to keep backward compatability
    async toggle(req, res) {
        try {
            const name = req.params.featureName;
            const feature = await this.featureToggleStore.getFeature(name);
            const enabled = !feature.enabled;
            this._updateField('enabled', enabled, req, res);
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async toggleOn(req, res) {
        this._updateField('enabled', true, req, res);
    }

    async toggleOff(req, res) {
        this._updateField('enabled', false, req, res);
    }

    async staleOn(req, res) {
        this._updateField('stale', true, req, res);
    }

    async staleOff(req, res) {
        this._updateField('stale', false, req, res);
    }

    async _updateField(field, value, req, res) {
        const { featureName } = req.params;
        const userName = extractUser(req);

        try {
            const feature = await this.featureToggleStore.getFeature(
                featureName,
            );
            feature[field] = value;
            const validFeature = await featureShema.validateAsync(feature);
            await this.eventStore.store({
                type: FEATURE_UPDATED,
                createdBy: userName,
                data: validFeature,
            });
            res.json(feature).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async deleteToggle(req, res) {
        const { featureName } = req.params;
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
            handleErrors(res, this.logger, error);
        }
    }
}

module.exports = FeatureController;

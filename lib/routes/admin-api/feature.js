const Controller = require('../controller');

const { handleErrors } = require('./util');
const extractUser = require('../../extract-user');
const {
    UPDATE_FEATURE,
    DELETE_FEATURE,
    CREATE_FEATURE,
} = require('../../permissions');

const version = 1;

class FeatureController extends Controller {
    constructor(config, { featureToggleService }) {
        super(config);
        this.featureService = featureToggleService;
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
        this.get('/:featureName/tags', this.listTags, UPDATE_FEATURE);
        this.post('/:featureName/tags', this.addTag, UPDATE_FEATURE);
        this.delete(
            '/:featureName/tags/:type/:value',
            this.removeTag,
            UPDATE_FEATURE,
        );
    }

    async getAllToggles(req, res) {
        const features = await this.featureService.getFeatures();
        res.json({ version, features });
    }

    async getToggle(req, res) {
        try {
            const name = req.params.featureName;
            const feature = await this.featureService.getFeature(name);
            res.json(feature).end();
        } catch (err) {
            res.status(404).json({ error: 'Could not find feature' });
        }
    }

    async listTags(req, res) {
        const tags = await this.featureService.listTags(req.params.featureName);
        res.json({ version, tags });
    }

    async addTag(req, res) {
        const { featureName } = req.params;
        const userName = extractUser(req);
        try {
            const tag = await this.featureService.addTag(
                featureName,
                req.body,
                userName,
            );
            res.status(201).json(tag);
        } catch (err) {
            handleErrors(res, this.logger, err);
        }
    }

    async removeTag(req, res) {
        const { featureName, type, value } = req.params;
        const userName = extractUser(req);
        await this.featureService.removeTag(
            featureName,
            { type, value },
            userName,
        );
        res.status(200).end();
    }

    async validate(req, res) {
        const { name } = req.body;

        try {
            await this.featureService.validateName({ name });
            res.status(200).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async createToggle(req, res) {
        const userName = extractUser(req);

        try {
            await this.featureService.createFeatureToggle(req.body, userName);
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
            await this.featureService.updateToggle(updatedFeature, userName);
            res.status(200).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    // Kept to keep backward compatibility
    async toggle(req, res) {
        const userName = extractUser(req);
        try {
            const name = req.params.featureName;
            const feature = await this.featureService.toggle(name, userName);
            res.status(200).json(feature);
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async toggleOn(req, res) {
        await this._updateField('enabled', true, req, res);
    }

    async toggleOff(req, res) {
        await this._updateField('enabled', false, req, res);
    }

    async staleOn(req, res) {
        await this._updateField('stale', true, req, res);
    }

    async staleOff(req, res) {
        await this._updateField('stale', false, req, res);
    }

    async _updateField(field, value, req, res) {
        const { featureName } = req.params;
        const userName = extractUser(req);

        try {
            const feature = await this.featureService.updateField(
                featureName,
                field,
                value,
                userName,
            );
            res.json(feature).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async deleteToggle(req, res) {
        const { featureName } = req.params;
        const userName = extractUser(req);

        try {
            await this.featureService.archiveToggle(featureName, userName);
            res.status(200).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }
}

module.exports = FeatureController;

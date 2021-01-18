'use strict';

const Controller = require('../controller');
const { filter } = require('./util');

const version = 1;

class FeatureController extends Controller {
    constructor({ featureToggleService }) {
        super();
        this.toggleService = featureToggleService;

        this.get('/', this.getAll);
        this.get('/:featureName', this.getFeatureToggle);
    }

    async getAll(req, res) {
        const nameFilter = filter('name', req.query.namePrefix);

        const allFeatureToggles = await this.toggleService.getFeatures();
        const features = nameFilter(allFeatureToggles);

        res.json({ version, features });
    }

    async getFeatureToggle(req, res) {
        try {
            const name = req.params.featureName;
            const featureToggle = await this.toggleService.getFeature(name);
            res.json(featureToggle).end();
        } catch (err) {
            res.status(404).json({ error: 'Could not find feature' });
        }
    }
}

module.exports = FeatureController;

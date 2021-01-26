'use strict';

const Controller = require('../controller');

const version = 1;

const FEATURE_COLUMNS_CLIENT = [
    'name',
    'type',
    'enabled',
    'stale',
    'strategies',
    'variants',
];

class FeatureController extends Controller {
    constructor({ featureToggleService }, getLogger) {
        super();
        this.toggleService = featureToggleService;
        this.logger = getLogger('client-api/feature.js');
        this.get('/', this.getAll);
        this.get('/:featureName', this.getFeatureToggle);
    }

    async getAll(req, res) {
        const features = await this.toggleService.getFeatures(
            req.query,
            FEATURE_COLUMNS_CLIENT,
        );
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

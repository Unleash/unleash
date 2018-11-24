'use strict';

const { Router } = require('express');

const version = 1;

const filter = (key, value) => {
    if (!key || !value) return array => array;
    return array => array.filter(item => item[key].startsWith(value));
};

class FeatureController {
    constructor(config) {
        const router = Router();
        this._router = router;
        this.store = config.stores.featureToggleStore;

        router.get('/', (req, res) => this.getAll(req, res));
        router.get('/:featureName', this.getFeatureToggle.bind(this));
    }

    async getAll(req, res) {
        const nameFilter = filter('name', req.query.namePrefix);

        const allFeatureToggles = await this.store.getFeatures();
        const features = nameFilter(allFeatureToggles);

        res.json({ version, features });
    }

    async getFeatureToggle(req, res) {
        try {
            const name = req.params.featureName;
            const featureToggle = await this.store.getFeature(name);
            res.json(featureToggle).end();
        } catch (err) {
            res.status(404).json({ error: 'Could not find feature' });
        }
    }

    router() {
        return this._router;
    }
}

module.exports = FeatureController;

'use strict';

const { Router } = require('express');
const { filter } = require('./util');

const version = 1;

class FeatureController {
    constructor({ featureToggleStore }) {
        const router = Router();
        this._router = router;
        this.toggleStore = featureToggleStore;

        router.get('/', (req, res) => this.getAll(req, res));
        router.get('/:featureName', this.getFeatureToggle.bind(this));
    }

    async getAll(req, res) {
        const nameFilter = filter('name', req.query.namePrefix);

        const allFeatureToggles = await this.toggleStore.getFeatures();
        const features = nameFilter(allFeatureToggles);

        res.json({ version, features });
    }

    async getFeatureToggle(req, res) {
        try {
            const name = req.params.featureName;
            const featureToggle = await this.toggleStore.getFeature(name);
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

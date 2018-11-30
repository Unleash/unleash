'use strict';

const { Router } = require('express');

const logger = require('../../logger')('/admin-api/archive.js');
const { FEATURE_REVIVED } = require('../../event-type');
const extractUser = require('../../extract-user');

class ArchiveController {
    constructor({ featureToggleStore, eventStore }) {
        const router = Router();
        this._router = router;
        this.featureToggleStore = featureToggleStore;
        this.eventStore = eventStore;

        router.get('/features', this.getArchivedFeatures.bind(this));
        router.post('/revive/:name', this.reviveFeatureToggle.bind(this));
    }

    async getArchivedFeatures(req, res) {
        const features = await this.featureToggleStore.getArchivedFeatures();
        res.json({ features });
    }

    async reviveFeatureToggle(req, res) {
        const userName = extractUser(req);

        try {
            await this.eventStore.store({
                type: FEATURE_REVIVED,
                createdBy: userName,
                data: { name: req.params.name },
            });
            res.status(200).end();
        } catch (error) {
            logger.error('Server failed executing request', error);
            return res.status(500).end();
        }
    }

    router() {
        return this._router;
    }
}

module.exports = ArchiveController;

'use strict';

const Controller = require('../controller');

const logger = require('../../logger')('/admin-api/archive.js');
const { FEATURE_REVIVED } = require('../../event-type');
const extractUser = require('../../extract-user');

class ArchiveController extends Controller {
    constructor({ featureToggleStore, eventStore }) {
        super();
        this.featureToggleStore = featureToggleStore;
        this.eventStore = eventStore;

        this.get('/features', this.getArchivedFeatures);
        this.post('/revive/:name', this.reviveFeatureToggle);
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
}

module.exports = ArchiveController;

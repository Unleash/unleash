'use strict';

import { handleErrors } from './util';

const Controller = require('../controller');

const extractUser = require('../../extract-user');
const { UPDATE_FEATURE } = require('../../permissions');

class ArchiveController extends Controller {
    constructor(config, { featureToggleService }) {
        super(config);
        this.logger = config.getLogger('/admin-api/archive.js');
        this.featureService = featureToggleService;

        this.get('/features', this.getArchivedFeatures);
        this.post('/revive/:name', this.reviveFeatureToggle, UPDATE_FEATURE);
    }

    async getArchivedFeatures(req, res) {
        try {
            const features = await this.featureService.getArchivedFeatures();
            res.json({ features });
        } catch (err) {
            handleErrors(res, this.logger, err);
        }
    }

    async reviveFeatureToggle(req, res) {
        const userName = extractUser(req);

        try {
            await this.featureService.reviveToggle(req.params.name, userName);
            return res.status(200).end();
        } catch (error) {
            this.logger.error('Server failed executing request', error);
            return res.status(500).end();
        }
    }
}

module.exports = ArchiveController;

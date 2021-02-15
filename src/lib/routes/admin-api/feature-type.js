'use strict';

import { handleErrors } from './util';

const Controller = require('../controller');

const version = 1;

class FeatureTypeController extends Controller {
    constructor(config) {
        super(config);
        this.featureTypeStore = config.stores.featureTypeStore;
        this.logger = config.getLogger('/admin-api/feature-type.js');

        this.get('/', this.getAllFeatureTypes);
    }

    async getAllFeatureTypes(req, res) {
        try {
            const types = await this.featureTypeStore.getAll();
            res.json({ version, types });
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }
}

module.exports = FeatureTypeController;

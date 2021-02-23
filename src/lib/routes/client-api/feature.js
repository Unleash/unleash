'use strict';

import { handleErrors } from '../admin-api/util';

const memoizee = require('memoizee');

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
    constructor({ featureToggleService }, { getLogger, experimental }) {
        super();
        this.toggleService = featureToggleService;
        this.logger = getLogger('client-api/feature.js');
        this.get('/', this.getAll);
        this.get('/:featureName', this.getFeatureToggle);
        if (experimental && experimental.clientFeatureMemoize) {
            this.cache = experimental.clientFeatureMemoize.enabled;
            this.cachedFeatures = memoizee(
                (query, fields) =>
                    this.toggleService.getFeatures(query, fields),
                {
                    promise: true,
                    maxAge: experimental.clientFeatureMemoize.maxAge,
                    normalizer(args) {
                        // args is arguments object as accessible in memoized function
                        return JSON.stringify(args[0]);
                    },
                },
            );
        }
    }

    async getAll(req, res) {
        try {
            let features;
            if (this.cache) {
                features = await this.cachedFeatures(
                    req.query,
                    FEATURE_COLUMNS_CLIENT,
                );
            } else {
                features = await this.toggleService.getFeatures(
                    req.query,
                    FEATURE_COLUMNS_CLIENT,
                );
            }
            res.json({ version, features });
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
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

'use strict';

import { handleErrors } from './util';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';

const Controller = require('../controller');

const extractUser = require('../../extract-user');
const { UPDATE_FEATURE } = require('../../permissions');

export default class ArchiveController extends Controller {
    constructor(
        config: IUnleashConfig,
        {
            featureToggleService,
        }: Pick<IUnleashServices, 'featureToggleService'>,
    ) {
        super(config);
        this.logger = config.getLogger('/admin-api/archive.js');
        this.featureService = featureToggleService;

        this.get('/features', this.getArchivedFeatures);
        this.post('/revive/:name', this.reviveFeatureToggle, UPDATE_FEATURE);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async getArchivedFeatures(req, res): Promise<void> {
        try {
            const features = await this.featureService.getArchivedFeatures();
            res.json({ features });
        } catch (err) {
            handleErrors(res, this.logger, err);
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async reviveFeatureToggle(req, res): Promise<void> {
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

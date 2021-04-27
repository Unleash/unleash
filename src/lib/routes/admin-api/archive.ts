import { Request, Response } from 'express';
import { handleErrors } from './util';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import { Logger } from '../../logger';

import Controller from '../controller';

import extractUser from '../../extract-user';
import { UPDATE_FEATURE, DELETE_FEATURE } from '../../types/permissions';
import FeatureToggleService from '../../services/feature-toggle-service';

export default class ArchiveController extends Controller {
    private readonly logger: Logger;

    private featureService: FeatureToggleService;

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
        this.delete('/:featureName', this.deleteFeature, DELETE_FEATURE);
        this.post(
            '/revive/:featureName',
            this.reviveFeatureToggle,
            UPDATE_FEATURE,
        );
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

    async deleteFeature(
        req: Request<any, { featureName: string }, any, any>,
        res: Response,
    ): Promise<void> {
        const { featureName } = req.params;
        try {
            await this.featureService.deleteFeature(featureName);
            res.status(200).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async reviveFeatureToggle(req, res): Promise<void> {
        const userName = extractUser(req);
        const { featureName } = req.params;

        try {
            await this.featureService.reviveToggle(featureName, userName);
            return res.status(200).end();
        } catch (error) {
            this.logger.error('Server failed executing request', error);
            return res.status(500).end();
        }
    }
}

module.exports = ArchiveController;

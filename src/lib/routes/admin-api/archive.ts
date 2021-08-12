import { Request, Response } from 'express';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import { Logger } from '../../logger';

import Controller from '../controller';

import extractUser from '../../extract-user';
import { DELETE_FEATURE, UPDATE_FEATURE } from '../../types/permissions';
import FeatureToggleServiceV2 from '../../services/feature-toggle-service-v2';

export default class ArchiveController extends Controller {
    private readonly logger: Logger;

    private featureService: FeatureToggleServiceV2;

    constructor(
        config: IUnleashConfig,
        {
            featureToggleServiceV2,
        }: Pick<IUnleashServices, 'featureToggleServiceV2'>,
    ) {
        super(config);
        this.logger = config.getLogger('/admin-api/archive.js');
        this.featureService = featureToggleServiceV2;

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
        const features = await this.featureService.getMetadataForAllFeatures(
            true,
        );
        res.json({ version: 2, features });
    }

    async deleteFeature(
        req: Request<any, { featureName: string }, any, any>,
        res: Response,
    ): Promise<void> {
        const { featureName } = req.params;
        const user = extractUser(req);
        await this.featureService.deleteFeature(featureName, user);
        res.status(200).end();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async reviveFeatureToggle(req, res): Promise<void> {
        const userName = extractUser(req);
        const { featureName } = req.params;
        await this.featureService.reviveToggle(featureName, userName);
        res.status(200).end();
    }
}

module.exports = ArchiveController;

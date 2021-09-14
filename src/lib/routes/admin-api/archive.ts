import { Response } from 'express';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import { Logger } from '../../logger';

import Controller from '../controller';

import { extractUsername } from '../../util/extract-user';
import { DELETE_FEATURE, UPDATE_FEATURE } from '../../types/permissions';
import FeatureToggleServiceV2 from '../../services/feature-toggle-service-v2';
import { IAuthRequest } from '../unleash-types';

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
        req: IAuthRequest<any, { featureName: string }, any, any>,
        res: Response,
    ): Promise<void> {
        const { featureName } = req.params;
        const user = extractUsername(req);
        await this.featureService.deleteFeature(featureName, user);
        res.status(200).end();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async reviveFeatureToggle(req: IAuthRequest, res: Response): Promise<void> {
        const userName = extractUsername(req);
        const { featureName } = req.params;
        await this.featureService.reviveToggle(featureName, userName);
        res.status(200).end();
    }
}

module.exports = ArchiveController;

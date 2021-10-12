import { Request, Response } from 'express';
import { IUnleashConfig } from '../../../types/option';
import { IUnleashServices } from '../../../types/services';
import { Logger } from '../../../logger';

import Controller from '../../controller';

import { extractUsername } from '../../../util/extract-user';
import { DELETE_FEATURE, UPDATE_FEATURE } from '../../../types/permissions';
import FeatureToggleServiceV2 from '../../../services/feature-toggle-service-v2';
import { IAuthRequest } from '../../unleash-types';

const PATH = `/:projectId/archived-features`;

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
        this.logger = config.getLogger('/admin-api/project/archive.ts');
        this.featureService = featureToggleServiceV2;

        this.get(`${PATH}`, this.getArchivedFeatures);
        this.delete(`${PATH}/:featureName`, this.deleteFeature, DELETE_FEATURE);
        this.post(
            `${PATH}/:featureName/revive`,
            this.reviveFeatureToggle,
            UPDATE_FEATURE,
        );
    }

    async getArchivedFeatures(req: Request, res: Response): Promise<void> {
        const { projectId } = req.params;
        const features = await this.featureService.getFeatureOverview(
            projectId,
            true,
        );
        res.json({ version: 1, features });
    }

    async deleteFeature(
        req: IAuthRequest<any, { featureName: string }, any, any>,
        res: Response,
    ): Promise<void> {
        const { featureName } = req.params;
        const user = extractUsername(req);
        // TODO: validate projectId
        await this.featureService.deleteFeature(featureName, user);
        res.status(200).end();
    }

    async reviveFeatureToggle(req: IAuthRequest, res: Response): Promise<void> {
        const userName = extractUsername(req);
        const { featureName } = req.params;
        // TODO: validate projectId
        await this.featureService.reviveToggle(featureName, userName);
        res.status(200).end();
    }
}

module.exports = ArchiveController;

import { Request, Response } from 'express';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types';
import { Logger } from '../../logger';

import Controller from '../controller';

import { extractUsername } from '../../util/extract-user';
import { DELETE_FEATURE, NONE, UPDATE_FEATURE } from '../../types/permissions';
import FeatureToggleService from '../../services/feature-toggle-service';
import { IAuthRequest } from '../unleash-types';
import { featuresResponse } from '../../openapi/spec/features-response';
import { FeaturesSchema } from '../../openapi/spec/features-schema';

export default class ArchiveController extends Controller {
    private readonly logger: Logger;

    private featureService: FeatureToggleService;

    constructor(
        config: IUnleashConfig,
        {
            featureToggleServiceV2,
            openApiService,
        }: Pick<IUnleashServices, 'featureToggleServiceV2' | 'openApiService'>,
    ) {
        super(config);
        this.logger = config.getLogger('/admin-api/archive.js');
        this.featureService = featureToggleServiceV2;

        this.route({
            method: 'get',
            path: '/features',
            acceptAnyContentType: true,
            handler: this.getArchivedFeatures,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['admin'],
                    responses: { 200: featuresResponse },
                    deprecated: true,
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/features/:projectId',
            acceptAnyContentType: true,
            handler: this.getArchivedFeaturesByProjectId,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['admin'],
                    responses: { 200: featuresResponse },
                    deprecated: true,
                }),
            ],
        });

        this.delete('/:featureName', this.deleteFeature, DELETE_FEATURE);
        this.post(
            '/revive/:featureName',
            this.reviveFeatureToggle,
            UPDATE_FEATURE,
        );
    }

    async getArchivedFeatures(
        req: Request,
        res: Response<FeaturesSchema>,
    ): Promise<void> {
        const features = await this.featureService.getMetadataForAllFeatures(
            true,
        );

        res.json({
            version: 2,
            features: features,
        });
    }

    async getArchivedFeaturesByProjectId(
        req: Request<{ projectId: string }, any, any, any>,
        res: Response<FeaturesSchema>,
    ): Promise<void> {
        const { projectId } = req.params;
        const features =
            await this.featureService.getMetadataForAllFeaturesByProjectId(
                true,
                projectId,
            );
        res.json({
            version: 2,
            features: features,
        });
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

    async reviveFeatureToggle(req: IAuthRequest, res: Response): Promise<void> {
        const userName = extractUsername(req);
        const { featureName } = req.params;
        await this.featureService.reviveToggle(featureName, userName);
        res.status(200).end();
    }
}

module.exports = ArchiveController;

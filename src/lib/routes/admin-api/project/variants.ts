import FeatureToggleService from '../../../services/feature-toggle-service';
import { Logger } from '../../../logger';
import Controller from '../../controller';
import { IUnleashConfig } from '../../../types/option';
import { IUnleashServices } from '../../../types';
import { Request, Response } from 'express';
import { Operation } from 'fast-json-patch';
import { UPDATE_FEATURE_VARIANTS } from '../../../types/permissions';
import { IVariant } from '../../../types/model';
import { extractUsername } from '../../../util/extract-user';
import { IAuthRequest } from '../../unleash-types';

const PREFIX = '/:projectId/features/:featureName/variants';

interface FeatureParams extends ProjectParam {
    featureName: string;
}

interface ProjectParam {
    projectId: string;
}

export default class VariantsController extends Controller {
    private logger: Logger;

    private featureService: FeatureToggleService;

    constructor(
        config: IUnleashConfig,
        {
            featureToggleService,
        }: Pick<IUnleashServices, 'featureToggleService'>,
    ) {
        super(config);
        this.logger = config.getLogger('admin-api/project/variants.ts');
        this.featureService = featureToggleService;
        this.get(PREFIX, this.getVariants);
        this.patch(PREFIX, this.patchVariants, UPDATE_FEATURE_VARIANTS);
        this.put(PREFIX, this.overwriteVariants, UPDATE_FEATURE_VARIANTS);
    }

    async getVariants(
        req: Request<FeatureParams, any, any, any>,
        res: Response,
    ): Promise<void> {
        const { featureName } = req.params;
        const variants = await this.featureService.getVariants(featureName);
        res.status(200).json({ version: '1', variants: variants || [] });
    }

    async patchVariants(
        req: IAuthRequest<FeatureParams, any, Operation[]>,
        res: Response,
    ): Promise<void> {
        const { projectId, featureName } = req.params;
        const userName = extractUsername(req);

        const updatedFeature = await this.featureService.updateVariants(
            featureName,
            projectId,
            req.body,
            userName,
        );
        res.status(200).json({
            version: '1',
            variants: updatedFeature.variants,
        });
    }

    async overwriteVariants(
        req: IAuthRequest<FeatureParams, any, IVariant[], any>,
        res: Response,
    ): Promise<void> {
        const { projectId, featureName } = req.params;
        const userName = extractUsername(req);
        const updatedFeature = await this.featureService.saveVariants(
            featureName,
            projectId,
            req.body,
            userName,
        );
        res.status(200).json({
            version: '1',
            variants: updatedFeature.variants,
        });
    }
}

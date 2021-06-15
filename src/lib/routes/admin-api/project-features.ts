import Controller from '../controller';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import FeatureToggleServiceV2 from '../../services/feature-toggle-service-v2';
import { Logger } from '../../logger';
import { UPDATE_FEATURE } from '../../types/permissions';
import { Request, Response } from 'express';
import { IConstraint, IStrategyConfig } from '../../types/model';
import { handleErrors } from './util';

interface FeatureStrategyParams {
    projectName: string;
    featureName: string;
    environment: string;
}

export default class ProjectFeaturesController extends Controller {
    private featureService: FeatureToggleServiceV2;

    private logger: Logger;

    constructor(
        config: IUnleashConfig,
        {
            featureToggleServiceV2,
        }: Pick<IUnleashServices, 'featureToggleServiceV2'>,
    ) {
        super(config);
        this.featureService = featureToggleServiceV2;
        this.logger = config.getLogger('/admin-api/project-features.ts');

        this.post(
            '/:projectName/features/:featureName/environments/:environment/strategies',
            this.createFeatureStrategy,
            UPDATE_FEATURE,
        );
        this.get('/:projectName/features/:featureName/environments/:environment/strategies', this.getFeatureStrategies);
    }

    async createFeatureStrategy(
        req: Request<FeatureStrategyParams, any, IStrategyConfig, any>,
        res: Response,
    ): Promise<void> {
        const { projectName, featureName, environment } = req.params;
        try {
            const featureStrategy = await this.featureService.create(
                req.body,
                projectName,
                featureName,
                environment,
            );
            res.status(200).json(featureStrategy);
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    async getFeatureStrategies(
        req: Request<FeatureStrategyParams, any, any, any>,
        res: Response,
    ): Promise<void> {
        const { projectName, featureName, environment } = req.params;
        try {
            const featureStrategies = await this.featureService.getStrategiesForEnvironment(
                projectName,
                featureName,
                environment,
            );
            res.status(200).json(featureStrategies);
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }
}

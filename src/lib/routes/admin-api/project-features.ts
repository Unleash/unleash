import { Request, Response } from 'express';
import Controller from '../controller';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import FeatureToggleServiceV2 from '../../services/feature-toggle-service-v2';
import { Logger } from '../../logger';
import { UPDATE_FEATURE } from '../../types/permissions';
import { IConstraint, IStrategyConfig } from '../../types/model';
import { handleErrors } from './util';

interface FeatureStrategyParams {
    projectName: string;
    featureName: string;
    environment: string;
}

interface StrategyIdParams extends FeatureStrategyParams {
    strategyId: string;
}

interface StrategyUpdateBody {
    name?: string;
    constraints?: IConstraint[];
    parameters?: object;
}

export default class ProjectFeaturesController extends Controller {
    private featureService: FeatureToggleServiceV2;

    private readonly logger: Logger;

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
        this.get(
            '/:projectName/features/:featureName/environments/:environment/strategies',
            this.getFeatureStrategies,
        );
        this.get(
            '/:projectName/features/:featureName/environments/:environment/strategies/:strategyId',
            this.getStrategy,
        );
        this.put(
            '/:projectName/features/:featureName/environments/:environment/strategies/:strategyId',
            this.updateStrategy,
        );
        this.get('/featuresv2', this.getClientFeatures);
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

    async getClientFeatures(
        req: Request<any, any, any, any>,
        res: Response,
    ): Promise<void> {
        const clientFeatures = await this.featureService.getClientFeatures();
        res.status(200).json({ version: 2, features: clientFeatures });
    }

    async updateStrategy(
        req: Request<StrategyIdParams, any, StrategyUpdateBody, any>,
        res: Response,
    ): Promise<void> {
        const { strategyId } = req.params;
        try {
            const updatedStrategy = await this.featureService.updateStrategy(
                strategyId,
                req.body,
            );
            res.status(200).json(updatedStrategy);
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    async getStrategy(
        req: Request<StrategyIdParams, any, any, any>,
        res: Response,
    ): Promise<void> {
        this.logger.info('Getting strategy');
        const { strategyId } = req.params;
        this.logger.info(strategyId);
        try {
            const strategy = await this.featureService.getStrategy(strategyId);
            res.status(200).json(strategy);
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }
}

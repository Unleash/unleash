import { Request, Response } from 'express';
import Controller from '../../controller';
import { IUnleashConfig } from '../../../types/option';
import { IUnleashServices } from '../../../types/services';
import FeatureToggleServiceV2 from '../../../services/feature-toggle-service-v2';
import { Logger } from '../../../logger';
import { UPDATE_FEATURE } from '../../../types/permissions';
import {
    IConstraint,
    IProjectParam,
    IStrategyConfig,
} from '../../../types/model';
import { handleErrors } from '../util';

interface FeatureStrategyParams {
    projectId: string;
    featureName: string;
    environment: string;
}

interface FeatureParams extends ProjectParam {
    featureName: string;
}

interface ProjectParam {
    projectId: string;
}

interface ProjectEnvironment extends ProjectParam {
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

const PATH_PREFIX = '/:projectId/features/:featureName';

type ProjectFeaturesServices = Pick<IUnleashServices, 'featureToggleServiceV2'>;

export default class ProjectFeaturesController extends Controller {
    private featureService: FeatureToggleServiceV2;

    private readonly logger: Logger;

    constructor(
        config: IUnleashConfig,
        { featureToggleServiceV2 }: ProjectFeaturesServices,
    ) {
        super(config);
        this.featureService = featureToggleServiceV2;
        this.logger = config.getLogger('/admin-api/features.ts');

        this.delete(
            `/:projectId/environments/:environment`,
            this.deleteEnvironment,
        );
        this.post(
            `${PATH_PREFIX}/environments/:environment/strategies`,
            this.createFeatureStrategy,
            UPDATE_FEATURE,
        );
        this.get(
            `${PATH_PREFIX}/environments/:environment`,
            this.getEnvironment,
        );
        this.get(
            `${PATH_PREFIX}/environments/:environment/strategies`,
            this.getFeatureStrategies,
        );
        this.get(
            `${PATH_PREFIX}/environments/:environment/strategies/:strategyId`,
            this.getStrategy,
        );
        this.put(
            `${PATH_PREFIX}/environments/:environment/strategies/:strategyId`,
            this.updateStrategy,
        );
        this.get('/:projectId/features', this.getProjectOverview);
        this.get(PATH_PREFIX, this.getFeature);
    }

    async getEnvironment(
        req: Request<FeatureStrategyParams, any, any, any>,
        res: Response,
    ): Promise<void> {
        const { environment, featureName } = req.params;
        try {
            const environmentInfo = await this.featureService.getEnvironmentInfo(
                environment,
                featureName,
            );
            res.status(200).json(environmentInfo);
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    async getFeature(
        req: Request<FeatureParams, any, any, any>,
        res: Response,
    ): Promise<void> {
        const { featureName } = req.params;
        try {
            const feature = await this.featureService.getFeature(featureName);
            res.status(200).json(feature);
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    async deleteEnvironment(
        req: Request<ProjectEnvironment, any, any, any>,
        res: Response,
    ): Promise<void> {
        const { projectId, environment } = req.params;
        try {
            await this.featureService.deleteEnvironment(projectId, environment);
            res.status(200).end();
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    async getProjectOverview(
        req: Request<IProjectParam, any, any, any>,
        res: Response,
    ): Promise<void> {
        const { projectId } = req.params;
        try {
            const overview = await this.featureService.getProjectOverview(
                projectId,
            );
            res.json(overview);
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    async createFeatureStrategy(
        req: Request<FeatureStrategyParams, any, IStrategyConfig, any>,
        res: Response,
    ): Promise<void> {
        const { projectId, featureName, environment } = req.params;
        try {
            const featureStrategy = await this.featureService.createStrategy(
                req.body,
                projectId,
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
        const { projectId, featureName, environment } = req.params;
        try {
            const featureStrategies = await this.featureService.getStrategiesForEnvironment(
                projectId,
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

import { Request, Response } from 'express';
import Controller from '../../controller';
import { IUnleashConfig } from '../../../types/option';
import { IUnleashServices } from '../../../types/services';
import FeatureToggleServiceV2 from '../../../services/feature-toggle-service-v2';
import { Logger } from '../../../logger';
import { CREATE_FEATURE, UPDATE_FEATURE } from '../../../types/permissions';
import {
    FeatureToggleDTO,
    IConstraint,
    IStrategyConfig,
} from '../../../types/model';
import extractUsername from '../../../extract-user';
import ProjectHealthService from '../../../services/project-health-service';

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

interface StrategyIdParams extends FeatureStrategyParams {
    strategyId: string;
}

interface StrategyUpdateBody {
    name?: string;
    constraints?: IConstraint[];
    parameters?: object;
}

const PATH_PREFIX = '/:projectId/features/:featureName';

type ProjectFeaturesServices = Pick<
    IUnleashServices,
    'featureToggleServiceV2' | 'projectHealthService'
>;

export default class ProjectFeaturesController extends Controller {
    private featureService: FeatureToggleServiceV2;

    private projectHealthService: ProjectHealthService;

    private readonly logger: Logger;

    constructor(
        config: IUnleashConfig,
        {
            featureToggleServiceV2,
            projectHealthService,
        }: ProjectFeaturesServices,
    ) {
        super(config);
        this.featureService = featureToggleServiceV2;
        this.projectHealthService = projectHealthService;
        this.logger = config.getLogger('/admin-api/project/features.ts');

        this.post(
            `${PATH_PREFIX}/environments/:environment/strategies`,
            this.createFeatureStrategy,
            UPDATE_FEATURE,
        );
        this.get(
            `${PATH_PREFIX}/environments/:environment`,
            this.getEnvironment,
        );
        this.post(
            `${PATH_PREFIX}/environments/:environment/on`,
            this.toggleEnvironmentOn,
            UPDATE_FEATURE,
        );

        this.post(
            `${PATH_PREFIX}/environments/:environment/off`,
            this.toggleEnvironmentOff,
            UPDATE_FEATURE,
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
            UPDATE_FEATURE,
        );
        this.post(
            '/:projectId/features',
            this.createFeatureToggle,
            CREATE_FEATURE,
        );
        this.get('/:projectId/features', this.getFeaturesForProject);
        this.get(PATH_PREFIX, this.getFeature);
    }

    async getFeaturesForProject(
        req: Request<ProjectParam, any, any, any>,
        res: Response,
    ): Promise<void> {
        const { projectId } = req.params;
        const features = await this.featureService.getFeatureToggles({
            project: [projectId],
        });
        res.json({ version: 1, features });
    }

    async createFeatureToggle(
        req: Request<ProjectParam, any, FeatureToggleDTO, any>,
        res: Response,
    ): Promise<void> {
        const { projectId } = req.params;
        const userName = extractUsername(req);
        const created = await this.featureService.createFeatureToggle(
            projectId,
            req.body,
            userName,
        );
        res.status(201).json(created);
    }

    async getEnvironment(
        req: Request<FeatureStrategyParams, any, any, any>,
        res: Response,
    ): Promise<void> {
        const { environment, featureName, projectId } = req.params;
        const environmentInfo = await this.featureService.getEnvironmentInfo(
            projectId,
            environment,
            featureName,
        );
        res.status(200).json(environmentInfo);
    }

    async getFeature(
        req: Request<FeatureParams, any, any, any>,
        res: Response,
    ): Promise<void> {
        const { featureName } = req.params;
        const feature = await this.featureService.getFeature(featureName);
        res.status(200).json(feature);
    }

    async toggleEnvironmentOn(
        req: Request<FeatureStrategyParams, any, any, any>,
        res: Response,
    ): Promise<void> {
        const { featureName, environment } = req.params;
        await this.featureService.updateEnabled(
            featureName,
            environment,
            true,
            extractUsername(req),
        );
        res.status(200).end();
    }

    async toggleEnvironmentOff(
        req: Request<FeatureStrategyParams, any, any, any>,
        res: Response,
    ): Promise<void> {
        const { featureName, environment } = req.params;
        await this.featureService.updateEnabled(
            featureName,
            environment,
            false,
            extractUsername(req),
        );
        res.status(200).end();
    }

    async createFeatureStrategy(
        req: Request<FeatureStrategyParams, any, IStrategyConfig, any>,
        res: Response,
    ): Promise<void> {
        const { projectId, featureName, environment } = req.params;
        const featureStrategy = await this.featureService.createStrategy(
            req.body,
            projectId,
            featureName,
            environment,
        );
        res.status(200).json(featureStrategy);
    }

    async getFeatureStrategies(
        req: Request<FeatureStrategyParams, any, any, any>,
        res: Response,
    ): Promise<void> {
        const { projectId, featureName, environment } = req.params;
        const featureStrategies =
            await this.featureService.getStrategiesForEnvironment(
                projectId,
                featureName,
                environment,
            );
        res.status(200).json(featureStrategies);
    }

    async updateStrategy(
        req: Request<StrategyIdParams, any, StrategyUpdateBody, any>,
        res: Response,
    ): Promise<void> {
        const { strategyId } = req.params;
        const updatedStrategy = await this.featureService.updateStrategy(
            strategyId,
            req.body,
        );
        res.status(200).json(updatedStrategy);
    }

    async getStrategy(
        req: Request<StrategyIdParams, any, any, any>,
        res: Response,
    ): Promise<void> {
        this.logger.info('Getting strategy');
        const { strategyId } = req.params;
        this.logger.info(strategyId);
        const strategy = await this.featureService.getStrategy(strategyId);
        res.status(200).json(strategy);
    }
}

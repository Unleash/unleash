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
    FeatureToggleDTO,
    IArchivedQuery,
} from '../../../types/model';
import { handleErrors } from '../util';
import extractUsername from '../../../extract-user';

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
        );

        this.post(
            `${PATH_PREFIX}/environments/:environment/off`,
            this.toggleEnvironmentOff,
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
        this.get('/:projectId', this.getProjectOverview);
        this.post('/:projectId/features', this.createFeatureToggle);
        this.get('/:projectId/features', this.getFeaturesForProject);
        this.get(PATH_PREFIX, this.getFeature);
    }

    async getFeaturesForProject(
        req: Request<ProjectParam, any, any, any>,
        res: Response,
    ): Promise<void> {
        const { projectId } = req.params;
        try {
            const features = await this.featureService.getFeatureToggles({
                project: [projectId],
            });
            res.json({ version: 1, features });
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    async createFeatureToggle(
        req: Request<ProjectParam, any, FeatureToggleDTO, any>,
        res: Response,
    ): Promise<void> {
        const { projectId } = req.params;
        try {
            const userName = extractUsername(req);
            const created = await this.featureService.createFeatureToggle(
                projectId,
                req.body,
                userName,
            );
            res.status(201).json(created);
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    async getEnvironment(
        req: Request<FeatureStrategyParams, any, any, any>,
        res: Response,
    ): Promise<void> {
        const { environment, featureName, projectId } = req.params;
        try {
            const environmentInfo = await this.featureService.getEnvironmentInfo(
                projectId,
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

    async toggleEnvironmentOn(
        req: Request<FeatureStrategyParams, any, any, any>,
        res: Response,
    ): Promise<void> {
        const { featureName, environment } = req.params;
        try {
            await this.featureService.updateEnabled(
                featureName,
                environment,
                true,
                extractUsername(req),
            );
            res.status(200).end();
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    async toggleEnvironmentOff(
        req: Request<FeatureStrategyParams, any, any, any>,
        res: Response,
    ): Promise<void> {
        const { featureName, environment } = req.params;
        try {
            await this.featureService.updateEnabled(
                featureName,
                environment,
                false,
                extractUsername(req),
            );
            res.status(200).end();
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    async getProjectOverview(
        req: Request<IProjectParam, any, any, IArchivedQuery>,
        res: Response,
    ): Promise<void> {
        const { projectId } = req.params;
        const { archived } = req.query;
        try {
            const overview = await this.featureService.getProjectOverview(
                projectId,
                archived,
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

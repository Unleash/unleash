import { Request, Response } from 'express';
import { applyPatch, Operation } from 'fast-json-patch';
import Controller from '../../controller';
import { IUnleashConfig } from '../../../types/option';
import { IUnleashServices } from '../../../types/services';
import FeatureToggleService from '../../../services/feature-toggle-service';
import { Logger } from '../../../logger';
import {
    CREATE_FEATURE,
    CREATE_FEATURE_STRATEGY,
    DELETE_FEATURE,
    DELETE_FEATURE_STRATEGY,
    UPDATE_FEATURE,
    UPDATE_FEATURE_ENVIRONMENT,
    UPDATE_FEATURE_STRATEGY,
} from '../../../types/permissions';
import {
    FeatureToggleDTO,
    IConstraint,
    IStrategyConfig,
} from '../../../types/model';
import { extractUsername } from '../../../util/extract-user';
import { IAuthRequest } from '../../unleash-types';

interface FeatureStrategyParams {
    projectId: string;
    featureName: string;
    environment: string;
    sortOrder?: number;
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

const PATH = '/:projectId/features';
const PATH_FEATURE = `${PATH}/:featureName`;
const PATH_FEATURE_CLONE = `${PATH_FEATURE}/clone`;
const PATH_ENV = `${PATH_FEATURE}/environments/:environment`;
const PATH_STRATEGIES = `${PATH_ENV}/strategies`;
const PATH_STRATEGY = `${PATH_STRATEGIES}/:strategyId`;

type ProjectFeaturesServices = Pick<
    IUnleashServices,
    'featureToggleServiceV2' | 'projectHealthService'
>;

export default class ProjectFeaturesController extends Controller {
    private featureService: FeatureToggleService;

    private readonly logger: Logger;

    constructor(
        config: IUnleashConfig,
        { featureToggleServiceV2 }: ProjectFeaturesServices,
    ) {
        super(config);
        this.featureService = featureToggleServiceV2;
        this.logger = config.getLogger('/admin-api/project/features.ts');

        // Environments
        this.get(`${PATH_ENV}`, this.getEnvironment);
        this.post(
            `${PATH_ENV}/on`,
            this.toggleEnvironmentOn,
            UPDATE_FEATURE_ENVIRONMENT,
        );
        this.post(
            `${PATH_ENV}/off`,
            this.toggleEnvironmentOff,
            UPDATE_FEATURE_ENVIRONMENT,
        );

        // activation strategies
        this.get(`${PATH_STRATEGIES}`, this.getStrategies);
        this.post(
            `${PATH_STRATEGIES}`,
            this.addStrategy,
            CREATE_FEATURE_STRATEGY,
        );
        this.get(`${PATH_STRATEGY}`, this.getStrategy);
        this.put(
            `${PATH_STRATEGY}`,
            this.updateStrategy,
            UPDATE_FEATURE_STRATEGY,
        );
        this.patch(
            `${PATH_STRATEGY}`,
            this.patchStrategy,
            UPDATE_FEATURE_STRATEGY,
        );
        this.delete(
            `${PATH_STRATEGY}`,
            this.deleteStrategy,
            DELETE_FEATURE_STRATEGY,
        );

        // feature toggles
        this.get(PATH, this.getFeatures);
        this.post(PATH, this.createFeature, CREATE_FEATURE);

        this.post(PATH_FEATURE_CLONE, this.cloneFeature, CREATE_FEATURE);

        this.get(PATH_FEATURE, this.getFeature);
        this.put(PATH_FEATURE, this.updateFeature, UPDATE_FEATURE);
        this.patch(PATH_FEATURE, this.patchFeature, UPDATE_FEATURE);
        this.delete(PATH_FEATURE, this.archiveFeature, DELETE_FEATURE);
    }

    async getFeatures(
        req: Request<ProjectParam, any, any, any>,
        res: Response,
    ): Promise<void> {
        const { projectId } = req.params;
        const features = await this.featureService.getFeatureOverview(
            projectId,
        );
        res.json({ version: 1, features });
    }

    async cloneFeature(
        req: IAuthRequest<
            FeatureParams,
            any,
            { name: string; replaceGroupId: boolean },
            any
        >,
        res: Response,
    ): Promise<void> {
        const { projectId, featureName } = req.params;
        const { name, replaceGroupId } = req.body;
        const userName = extractUsername(req);
        const created = await this.featureService.cloneFeatureToggle(
            featureName,
            projectId,
            name,
            replaceGroupId,
            userName,
        );
        res.status(201).json(created);
    }

    async createFeature(
        req: IAuthRequest<FeatureParams, any, FeatureToggleDTO, any>,
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

    async getFeature(
        req: Request<FeatureParams, any, any, any>,
        res: Response,
    ): Promise<void> {
        const { featureName } = req.params;
        const feature = await this.featureService.getFeature(featureName);
        res.status(200).json(feature);
    }

    async updateFeature(
        req: IAuthRequest<ProjectParam, any, FeatureToggleDTO, any>,
        res: Response,
    ): Promise<void> {
        const { projectId } = req.params;
        const data = req.body;
        const userName = extractUsername(req);
        const created = await this.featureService.updateFeatureToggle(
            projectId,
            data,
            userName,
        );
        res.status(200).json(created);
    }

    async patchFeature(
        req: IAuthRequest<
            { projectId: string; featureName: string },
            any,
            Operation[],
            any
        >,
        res: Response,
    ): Promise<void> {
        const { projectId, featureName } = req.params;
        const updated = await this.featureService.patchFeature(
            projectId,
            featureName,
            extractUsername(req),
            req.body,
        );
        res.status(200).json(updated);
    }

    // TODO: validate projectId
    async archiveFeature(
        req: IAuthRequest<
            { projectId: string; featureName: string },
            any,
            any,
            any
        >,
        res: Response,
    ): Promise<void> {
        const { featureName } = req.params;
        const userName = extractUsername(req);
        await this.featureService.archiveToggle(featureName, userName);
        res.status(202).send();
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

    async toggleEnvironmentOn(
        req: IAuthRequest<FeatureStrategyParams, any, any, any>,
        res: Response,
    ): Promise<void> {
        const { featureName, environment, projectId } = req.params;
        await this.featureService.updateEnabled(
            projectId,
            featureName,
            environment,
            true,
            extractUsername(req),
        );
        res.status(200).end();
    }

    async toggleEnvironmentOff(
        req: IAuthRequest<FeatureStrategyParams, any, any, any>,
        res: Response,
    ): Promise<void> {
        const { featureName, environment, projectId } = req.params;
        await this.featureService.updateEnabled(
            projectId,
            featureName,
            environment,
            false,
            extractUsername(req),
        );
        res.status(200).end();
    }

    async addStrategy(
        req: IAuthRequest<FeatureStrategyParams, any, IStrategyConfig, any>,
        res: Response,
    ): Promise<void> {
        const { projectId, featureName, environment } = req.params;
        const userName = extractUsername(req);
        const featureStrategy = await this.featureService.createStrategy(
            req.body,
            { environment, projectId, featureName },
            userName,
        );
        res.status(200).json(featureStrategy);
    }

    async getStrategies(
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
        req: IAuthRequest<StrategyIdParams, any, StrategyUpdateBody, any>,
        res: Response,
    ): Promise<void> {
        const { strategyId, environment, projectId, featureName } = req.params;
        const userName = extractUsername(req);
        const updatedStrategy = await this.featureService.updateStrategy(
            strategyId,
            req.body,
            { environment, projectId, featureName },
            userName,
        );
        res.status(200).json(updatedStrategy);
    }

    async patchStrategy(
        req: IAuthRequest<StrategyIdParams, any, Operation[], any>,
        res: Response,
    ): Promise<void> {
        const { strategyId, projectId, environment, featureName } = req.params;
        const userName = extractUsername(req);
        const patch = req.body;
        const strategy = await this.featureService.getStrategy(strategyId);
        const { newDocument } = applyPatch(strategy, patch);
        const updatedStrategy = await this.featureService.updateStrategy(
            strategyId,
            newDocument,
            { environment, projectId, featureName },
            userName,
        );
        res.status(200).json(updatedStrategy);
    }

    async getStrategy(
        req: IAuthRequest<StrategyIdParams, any, any, any>,
        res: Response,
    ): Promise<void> {
        this.logger.info('Getting strategy');
        const { strategyId } = req.params;
        this.logger.info(strategyId);
        const strategy = await this.featureService.getStrategy(strategyId);
        res.status(200).json(strategy);
    }

    async deleteStrategy(
        req: IAuthRequest<StrategyIdParams, any, any, any>,
        res: Response,
    ): Promise<void> {
        this.logger.info('Deleting strategy');
        const { environment, projectId, featureName } = req.params;
        const userName = extractUsername(req);
        const { strategyId } = req.params;
        this.logger.info(strategyId);
        const strategy = await this.featureService.deleteStrategy(
            strategyId,
            { environment, projectId, featureName },
            userName,
        );
        res.status(200).json(strategy);
    }

    async updateStrategyParameter(
        req: IAuthRequest<
            StrategyIdParams,
            any,
            { name: string; value: string | number },
            any
        >,
        res: Response,
    ): Promise<void> {
        const { strategyId, environment, projectId, featureName } = req.params;
        const userName = extractUsername(req);
        const { name, value } = req.body;

        const updatedStrategy =
            await this.featureService.updateStrategyParameter(
                strategyId,
                name,
                value,
                { environment, projectId, featureName },
                userName,
            );
        res.status(200).json(updatedStrategy);
    }

    async getStrategyParameters(
        req: Request<StrategyIdParams, any, any, any>,
        res: Response,
    ): Promise<void> {
        this.logger.info('Getting strategy parameters');
        const { strategyId } = req.params;
        const strategy = await this.featureService.getStrategy(strategyId);
        res.status(200).json(strategy.parameters);
    }
}

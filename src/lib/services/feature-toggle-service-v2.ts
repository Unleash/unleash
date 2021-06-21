/* eslint-disable prettier/prettier */
import { IUnleashConfig } from '../types/option';
import { IUnleashStores } from '../types/stores';
import { Logger } from '../logger';
import FeatureStrategiesStore, { FeatureConfigurationClient, IFeatureStrategy } from '../db/feature-strategy-store';
import FeatureToggleStore from '../db/feature-toggle-store';
import { IProjectOverview, IStrategyConfig } from '../types/model';
import feature from '../routes/admin-api/feature';
import ProjectStore from '../db/project-store';

// TODO: move to types
const GLOBAL_ENV = ':global:';




class FeatureToggleServiceV2 {
    private logger: Logger;

    private featureStrategiesStore: FeatureStrategiesStore;

    private featureToggleStore: FeatureToggleStore;

    private projectStore: ProjectStore;

    constructor(
        {
            featureStrategiesStore,
            featureToggleStore,
            projectStore
        }: Pick<IUnleashStores, 'featureStrategiesStore' | 'featureToggleStore' | 'projectStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>
    ) {
        this.logger = getLogger('services/feature-toggle-service-v2.ts');
        this.featureStrategiesStore = featureStrategiesStore;
        this.featureToggleStore = featureToggleStore;
        this.projectStore = projectStore;
    }

    async createStrategy(strategyConfig: Omit<IStrategyConfig, 'id'>, projectName: string, featureName: string, environment: string = GLOBAL_ENV): Promise<IStrategyConfig> {
        const newFeatureStrategy = await this.featureStrategiesStore.createStrategyConfig({
            strategyName: strategyConfig.name,
            constraints: strategyConfig.constraints,
            parameters: strategyConfig.parameters,
            projectName,
            featureName,
            environment
        });
        return {
            id: newFeatureStrategy.id,
            name: newFeatureStrategy.strategyName,
            constraints: newFeatureStrategy.constraints,
            parameters: newFeatureStrategy.parameters
        };
    }

    /**
     * PUT /api/admin/projects/:projectName/features/:featureName/strategies/:strategyId ?
     * {
     *
     * }
     * @param id
     * @param updates
     */
    async updateStrategy(id: string, updates: Partial<IFeatureStrategy>): Promise<IFeatureStrategy> {
        return this.featureStrategiesStore.updateStrategy(id, updates);
    }

    async getStrategiesForEnvironment(projectName: string, featureName: string, environment: string): Promise<IStrategyConfig[]> {
        const featureStrategies = await this.featureStrategiesStore.getStrategiesForFeature(projectName, featureName, environment);
        return featureStrategies.map(strat => ({
            id: strat.id,
            name: strat.strategyName,
            constraints: strat.constraints,
            parameters: strat.parameters
        }));
    }

    /**
     * GET /api/admin/projects/:projectName/features/:featureName
     * @param featureName
     */
    async getFeature(featureName: string): Promise<any> {
        return Promise.resolve();
        //        return this.featureStrategiesStore.getFeatureToggleAdmin(featureName);
    }

    async getClientFeatures(): Promise<FeatureConfigurationClient[]> {
        return this.featureStrategiesStore.getFeatureTogglesClient();
    }

    async getStrategy(strategyId: string): Promise<IStrategyConfig> {
        const strategy = await this.featureStrategiesStore.getStrategyById(strategyId);
        return {
            id: strategy.id,
            name: strategy.strategyName,
            constraints: strategy.constraints || [],
            parameters: strategy.parameters
        };
    }

    async getProjectOverview(projectId: string): Promise<IProjectOverview> {
        const project = await this.projectStore.get(projectId);
        const features = await this.featureStrategiesStore.getProjectOverview(projectId);
        const members = await this.featureStrategiesStore.getMembers(projectId);
        return {
            name: project.name,
            description: project.description,
            features,
            members,
            version: 1
        }
    }

    async getEnvironmentInfo(environment: string, featureName: string): Promise<any> {
        return this.featureStrategiesStore.getStrategiesAndMetadataForEnvironment(environment, featureName);
    }
}



module.exports = FeatureToggleServiceV2;
export default FeatureToggleServiceV2;

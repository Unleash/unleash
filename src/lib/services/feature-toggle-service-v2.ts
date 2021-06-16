/* eslint-disable prettier/prettier */
import { IUnleashConfig } from '../types/option';
import { IUnleashStores } from '../types/stores';
import { Logger } from '../logger';
import FeatureStrategiesStore, { FeatureConfigurationClient, IFeatureStrategy } from '../db/feature-strategy-store';
import FeatureToggleStore from '../db/feature-toggle-store';
import { IStrategyConfig } from '../types/model';

// TODO: move to types
const GLOBAL_ENV = ':global:';




class FeatureToggleServiceV2 {
    private logger: Logger;

    private featureStrategiesStore: FeatureStrategiesStore;

    private featureToggleStore: FeatureToggleStore;

    constructor(
        {
            featureStrategiesStore,
            featureToggleStore
        }: Pick<IUnleashStores, 'featureStrategiesStore' | 'featureToggleStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>
    ) {
        this.logger = getLogger('services/setting-service.ts');
        this.featureStrategiesStore = featureStrategiesStore;
        this.featureToggleStore = featureToggleStore;
    }

    /*
        POST /api/admin/projects/:projectName/features/:featureName/environments/:envName/strategies
        {


            "constraints": [],
            "name": "default",
            "parameters": {}
        }

    */

    async create(strategyConfig: Omit<IStrategyConfig, 'id'>, projectName: string, featureName: string, environment: string = GLOBAL_ENV): Promise<IStrategyConfig> {
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

    async getClientFeatures(): Promise<FeatureConfigurationClient[]> {
        return this.featureStrategiesStore.getFeatureToggles();
    }

    async getStrategy(strategyId: string): Promise<IStrategyConfig> {
        const strategy = await this.featureStrategiesStore.getStrategyById(strategyId);
        return {
            id: strategy.id,
            name: strategy.strategyName,
            constraints: strategy.constraints,
            parameters: strategy.parameters
        };
    }
}



module.exports = FeatureToggleServiceV2;
export default FeatureToggleServiceV2;

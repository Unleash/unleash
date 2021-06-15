/* eslint-disable prettier/prettier */
import { IUnleashConfig } from '../types/option';
import { IUnleashStores } from '../types/stores';
import { Logger } from '../logger';
import FeatureStrategiesStore, { FeatureConfigurationClient } from '../db/feature-strategy-store';
import FeatureToggleStore from '../db/feature-toggle-store';
import { IStrategyConfig, IVariant } from '../types/model';
import { IStrategy } from '../db/strategy-store';

// TODO: move to types
const GLOBAL_ENV = ':global:';




interface IFeatureToggleConfiguration {
    name: string;
    type: string;
    stale: boolean;
    enabled: boolean;
    strategies: IStrategy[];
    variants: IVariant[];
}


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

    async getFeatureToggleConfiguration(): Promise<IFeatureToggleConfiguration[]> {
        const [toggles, strategies] = await Promise.all([
            this.featureToggleStore.getFeatures({}, ['name', 'type', 'stale', 'variants']),
            this.featureStrategiesStore.getAllEnabledStrategies()
        ]);

        return toggles.map(t => {
            const toggleStrategies = strategies.filter(s => s.featureName === t.name);
            return { ...t, strategies: toggleStrategies };
        });
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
}



module.exports = FeatureToggleServiceV2;
export default FeatureToggleServiceV2;

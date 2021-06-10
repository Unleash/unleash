/* eslint-disable prettier/prettier */
import { IUnleashConfig } from '../types/option';
import { IUnleashStores } from '../types/stores';
import { Logger } from '../logger';
import FeatureStrategiesStore, { IFeatureStrategies } from '../db/feature-strategy-store';
import FeatureToggleStore from '../db/feature-toggle-store';

interface IFeatureToggleClient {
    name: string;
    type: string;
    stale: boolean;
    strategies: IFeatureStrategies[];
}

class FeatureToggleServiceV2 {
    private logger: Logger;

    private featureStrategiesStore: FeatureStrategiesStore;

    private featureToggleStore: FeatureToggleStore;

    

    constructor(
        {
            featureStrategiesStore,
            featureToggleStore,
        }: Pick<IUnleashStores, 'featureStrategiesStore' | 'featureToggleStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.logger = getLogger('services/setting-service.ts');
        this.featureStrategiesStore = featureStrategiesStore;
        this.featureToggleStore = featureToggleStore;
    }

    async getFeatureTogglesForClient(): Promise<IFeatureToggleClient[]> {
        const [toggles, strategies] = await Promise.all([
            this.featureToggleStore.getFeatures({}, ['name', 'type', 'stale']),
            this.featureStrategiesStore.getAllEnabledStrategies()
        ]);

        return toggles.map(t => {
            const toggleStrategies = strategies.filter(s => s.featureName === t.name);
            return {...t, strategies: toggleStrategies}
        });
    }
}

module.exports = FeatureToggleServiceV2;
export default FeatureToggleServiceV2;

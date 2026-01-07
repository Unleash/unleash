import type { IUnleashStores } from '../types/stores.js';
import type { IFeatureTypeStore } from '../types/stores/feature-type-store.js';

class HealthService {
    private featureTypeStore: IFeatureTypeStore;

    constructor({
        featureTypeStore,
    }: Pick<IUnleashStores, 'featureTypeStore'>) {
        this.featureTypeStore = featureTypeStore;
    }

    async dbIsUp(): Promise<boolean> {
        const row = await this.featureTypeStore.getAll();
        return row.length > 0;
    }
}

export default HealthService;

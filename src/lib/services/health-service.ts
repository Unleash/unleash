import { IUnleashStores } from '../types/stores';
import { IUnleashConfig } from '../types/option';
import { Logger } from '../logger';
import { IFeatureTypeStore } from '../types/stores/feature-type-store';

class HealthService {
    private featureTypeStore: IFeatureTypeStore;

    private logger: Logger;

    constructor(
        { featureTypeStore }: Pick<IUnleashStores, 'featureTypeStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.featureTypeStore = featureTypeStore;
        this.logger = getLogger('services/health-service.ts');
    }

    async dbIsUp(): Promise<boolean> {
        const row = await this.featureTypeStore.getAll();
        return row.length > 0;
    }
}

export default HealthService;
module.exports = HealthService;

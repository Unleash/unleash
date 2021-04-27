import { IUnleashStores } from '../types/stores';
import { IUnleashConfig } from '../types/option';
import FeatureTypeStore, { IFeatureType } from '../db/feature-type-store';
import { Logger } from '../logger';

export default class FeatureTypeService {
    private featureTypeStore: FeatureTypeStore;

    private logger: Logger;

    constructor(
        { featureTypeStore }: Pick<IUnleashStores, 'featureTypeStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.featureTypeStore = featureTypeStore;
        this.logger = getLogger('services/feature-type-service.ts');
    }

    async getAll(): Promise<IFeatureType[]> {
        return this.featureTypeStore.getAll();
    }
}

module.exports = FeatureTypeService;

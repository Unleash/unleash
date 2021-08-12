import { IUnleashStores } from '../types/stores';
import { IUnleashConfig } from '../types/option';
import { Logger } from '../logger';
import {
    IFeatureType,
    IFeatureTypeStore,
} from '../types/stores/feature-type-store';

export default class FeatureTypeService {
    private featureTypeStore: IFeatureTypeStore;

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

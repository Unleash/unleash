import { IUnleashStores } from '../types/stores';
import { IUnleashConfig } from '../types/option';
import { Logger } from '../logger';
import {
    IFeatureType,
    IFeatureTypeStore,
} from '../types/stores/feature-type-store';
import NotFoundError from '../error/notfound-error';

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

    async updateLifetime(
        id: string,
        newLifetimeDays: number | null,
    ): Promise<IFeatureType> {
        // because our OpenAPI library does type coercion, any `null` values you
        // pass in get converted to `0`.
        const translatedLifetime =
            newLifetimeDays === 0 ? null : newLifetimeDays;

        const result = await this.featureTypeStore.updateLifetime(
            id,
            translatedLifetime,
        );

        if (!result) {
            throw new NotFoundError(
                `The feature type you tried to update ("${id}") does not exist.`,
            );
        }

        return result;
    }
}

module.exports = FeatureTypeService;

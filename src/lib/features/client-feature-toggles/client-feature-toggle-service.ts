import {
    IFeatureNaming,
    IFeatureToggleClientStore,
    IFeatureToggleQuery,
    IUnleashConfig,
    IUnleashStores,
} from '../../types';

import { Logger } from '../../logger';

import { FeatureConfigurationClient } from '../feature-toggle/types/feature-toggle-strategies-store-type';

export class ClientFeatureToggleService {
    private logger: Logger;

    private clientFeatureToggleStore: IFeatureToggleClientStore;

    constructor(
        {
            clientFeatureToggleStore,
        }: Pick<IUnleashStores, 'clientFeatureToggleStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>,
    ) {
        this.logger = getLogger('services/client-feature-toggle-service.ts');
        this.clientFeatureToggleStore = clientFeatureToggleStore;
    }

    async getClientFeatures(
        query?: IFeatureToggleQuery,
    ): Promise<FeatureConfigurationClient[]> {
        console.log('HIT SERVICE');
        const result = await this.clientFeatureToggleStore.getClient(
            query || {},
        );

        console.log('RESULT', result);

        return result.map(
            ({
                name,
                type,
                enabled,
                project,
                stale,
                strategies,
                variants,
                description,
                impressionData,
                dependencies,
            }) => ({
                name,
                type,
                enabled,
                project,
                stale,
                strategies,
                variants,
                description,
                impressionData,
                dependencies,
            }),
        );
    }
}

import {
    IFeatureNaming,
    IFeatureToggleClientStore,
    IFeatureToggleQuery,
    IUnleashConfig,
    IUnleashStores,
} from '../../types';

import { Logger } from '../../logger';

import { FeatureConfigurationClient } from '../feature-toggle/types/feature-toggle-strategies-store-type';

interface IFeatureContext {
    featureName: string;
    projectId: string;
}

export interface IGetFeatureParams {
    featureName: string;
    archived?: boolean;
    projectId?: string;
    environmentVariants?: boolean;
    userId?: number;
}

export type FeatureNameCheckResultWithFeaturePattern =
    | { state: 'valid' }
    | {
          state: 'invalid';
          invalidNames: Set<string>;
          featureNaming: IFeatureNaming;
      };

export class ClientFeatureToggleService {
    private logger: Logger;

    private featureToggleClientStore: IFeatureToggleClientStore;

    constructor(
        {
            featureToggleClientStore,
        }: Pick<IUnleashStores, 'featureToggleClientStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>,
    ) {
        this.logger = getLogger('services/client-feature-toggle-service.ts');
        this.featureToggleClientStore = featureToggleClientStore;
    }

    async getClientFeatures(
        query?: IFeatureToggleQuery,
    ): Promise<FeatureConfigurationClient[]> {
        const result = await this.featureToggleClientStore.getClient(
            query || {},
        );

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

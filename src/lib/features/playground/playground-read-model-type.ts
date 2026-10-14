import type { FeatureConfigurationClient } from '../feature-toggle/types/feature-toggle-strategies-store-type.js';

export interface IPlaygroundReadModel {
    /**
     * Returns the flag together with its parents, parents first.
     * Returns an empty array if the flag does not exist or is archived.
     */
    getFeatureByName(
        featureName: string,
        environment: string,
    ): Promise<FeatureConfigurationClient[]>;
}

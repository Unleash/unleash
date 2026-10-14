import type { FeatureConfigurationClient } from '../feature-toggle/types/feature-toggle-strategies-store-type.js';

export interface IPlaygroundReadModel {
    /**
     * Parents come first.
     * Returns an empty array if the flag does not exist or is archived.
     */
    getFeatureWithParents(
        featureName: string,
        environment: string,
    ): Promise<FeatureConfigurationClient[]>;
}

import type { FeatureConfigurationClient } from '../feature-toggle/types/feature-toggle-strategies-store-type.js';
import type { IPlaygroundReadModel } from './playground-read-model-type.js';

export class FakePlaygroundReadModel implements IPlaygroundReadModel {
    constructor(public features: FeatureConfigurationClient[] = []) {}

    async getFeatureWithParents(
        featureName: string,
        _environment: string,
    ): Promise<FeatureConfigurationClient[]> {
        const feature = this.features.find(({ name }) => name === featureName);
        if (!feature) {
            return [];
        }
        const parentNames =
            feature.dependencies?.map((dependency) => dependency.feature) ?? [];
        const parents = this.features.filter(({ name }) =>
            parentNames.includes(name),
        );
        return [...parents, feature];
    }
}

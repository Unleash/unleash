import type {
    IFeatureLink,
    IFeatureLinksReadModel,
} from './feature-links-read-model-type.js';

export class FakeFeatureLinksReadModel implements IFeatureLinksReadModel {
    async getTopDomains(): Promise<{ domain: string; count: number }[]> {
        return [];
    }

    async getLinks(..._features: string[]): Promise<IFeatureLink[]> {
        return [];
    }
}

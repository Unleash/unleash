import type {
    IFeatureLink,
    IFeatureLinksReadModel,
} from './feature-links-read-model-type';

export class FakeFeatureLinksReadModel implements IFeatureLinksReadModel {
    async getTopDomains(): Promise<{ domain: string; count: number }[]> {
        return [];
    }

    async getLinks(...features: string[]): Promise<IFeatureLink[]> {
        return [];
    }
}

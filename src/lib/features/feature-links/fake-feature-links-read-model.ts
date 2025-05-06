import type {
    IFeatureLink,
    IFeatureLinksReadModel,
} from './feature-links-read-model-type';

export class FakeFeatureLinksReadModel implements IFeatureLinksReadModel {
    async getLinks(feature: string): Promise<IFeatureLink[]> {
        return [];
    }
}

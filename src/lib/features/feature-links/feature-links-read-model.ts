import type { Db } from '../../db/db';
import type {
    IFeatureLink,
    IFeatureLinksReadModel,
} from './feature-links-read-model-type';

export class FeatureLinksReadModel implements IFeatureLinksReadModel {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async getLinks(feature: string): Promise<IFeatureLink[]> {
        const links = await this.db
            .from('feature_link')
            .where('feature_name', feature);

        return links.map((link) => ({
            id: link.id,
            url: link.url,
            title: link.title,
        }));
    }
}

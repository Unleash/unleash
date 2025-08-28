import type { Db } from '../../db/db.js';
import type { IFeatureLinkStore } from '../../types/index.js';
import type { IFeatureLink } from './feature-link-store-type.js';
import { CRUDStore, type CrudStoreConfig } from '../../db/crud/crud-store.js';
import type { Row } from '../../db/crud/row-type.js';
import { ulid } from 'ulidx';

export class FeatureLinkStore
    extends CRUDStore<
        IFeatureLink,
        Omit<IFeatureLink, 'id'>,
        Row<IFeatureLink>,
        Row<Omit<IFeatureLink, 'id'>>,
        string
    >
    implements IFeatureLinkStore
{
    constructor(db: Db, config: CrudStoreConfig) {
        super('feature_link', db, config);
    }

    async insert(item: Omit<IFeatureLink, 'id'>): Promise<IFeatureLink> {
        const id = ulid();
        const featureLink = {
            id: id,
            feature_name: item.featureName,
            url: item.url,
            title: item.title,
            domain: item.domain,
        };
        await this.db('feature_link').insert(featureLink);
        return { ...item, id };
    }
}

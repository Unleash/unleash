import type { Db } from '../../db/db';
import type { IFeatureLinkStore } from '../../types';
import type { IFeatureLink } from './feature-link-store-type';
import { CRUDStore, type CrudStoreConfig } from '../../db/crud/crud-store';
import type { Row } from '../../db/crud/row-type';
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
            id: ulid(),
            feature_name: item.featureName,
            url: item.url,
            title: item.title,
        };
        await this.db('feature_link').insert(featureLink);
        return { ...item, id };
    }
}

import {
    FeatureDependency,
    FeatureDependencyId,
} from './dependent-features-service';
import { Db } from '../../db/db';
import { IDependentFeaturesStore } from './dependent-features-store-type';

type SerializableFeatureDependency = Omit<FeatureDependency, 'variants'> & {
    variants?: string;
};
export class DependentFeaturesStore implements IDependentFeaturesStore {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async upsert(featureDependency: FeatureDependency): Promise<void> {
        const serializableFeatureDependency: SerializableFeatureDependency = {
            parent: featureDependency.parent,
            child: featureDependency.child,
            enabled: featureDependency.enabled,
        };
        if ('variants' in featureDependency) {
            serializableFeatureDependency.variants = JSON.stringify(
                featureDependency.variants,
            );
        }
        await this.db('dependent_features')
            .insert(serializableFeatureDependency)
            .onConflict(['parent', 'child'])
            .merge();
    }

    async getChildren(parent: string): Promise<string[]> {
        const rows = await this.db('dependent_features').where(
            'parent',
            parent,
        );

        return rows.map((row) => row.child);
    }

    async delete(dependency: FeatureDependencyId): Promise<void> {
        await this.db('dependent_features')
            .where('parent', dependency.parent)
            .andWhere('child', dependency.child)
            .del();
    }
}

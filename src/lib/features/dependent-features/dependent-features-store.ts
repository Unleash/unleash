import type { Db } from '../../db/db';
import type { IDependentFeaturesStore } from './dependent-features-store-type';
import type {
    FeatureDependency,
    FeatureDependencyId,
} from './dependent-features';

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
        // TODO: remove when we support multiple parents
        await this.db('dependent_features')
            .where('child', featureDependency.child)
            .del();

        await this.db('dependent_features')
            .insert(serializableFeatureDependency)
            .onConflict(['parent', 'child'])
            .merge();
    }

    async delete(dependency: FeatureDependencyId): Promise<void> {
        await this.db('dependent_features')
            .where('parent', dependency.parent)
            .andWhere('child', dependency.child)
            .del();
    }

    async deleteAll(features: string[] | undefined): Promise<void> {
        if (features) {
            await this.db('dependent_features')
                .whereIn('child', features)
                .del();
        } else {
            await this.db('dependent_features').del();
        }
    }
}

import { FeatureDependency } from './dependent-features-service';
import { Db } from '../../db/db';

type SerializableFeatureDependency = Omit<FeatureDependency, 'variants'> & {
    variants?: string;
};
export class DependentFeaturesStore implements DependentFeaturesStore {
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
}

import type { Db } from '../../db/db.js';
import type { IDependentFeaturesReadModel } from './dependent-features-read-model-type.js';
import type { IDependency, IFeatureDependency } from '../../types/index.js';

interface IVariantName {
    variant_name: string;
}

export class DependentFeaturesReadModel implements IDependentFeaturesReadModel {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async getOrphanParents(parentsAndChildren: string[]): Promise<string[]> {
        const rows = await this.db('dependent_features')
            .distinct('parent')
            .whereIn('parent', parentsAndChildren)
            .andWhere(function () {
                this.whereIn('parent', function () {
                    this.select('parent')
                        .from('dependent_features')
                        .whereNotIn('child', parentsAndChildren);
                });
            });

        return rows.map((row) => row.parent);
    }

    async getChildren(parents: string[]): Promise<string[]> {
        const rows = await this.db('dependent_features').whereIn(
            'parent',
            parents,
        );

        return [...new Set(rows.map((row) => row.child))];
    }

    async getParents(child: string): Promise<IDependency[]> {
        const rows = await this.db('dependent_features').where('child', child);

        return rows.map((row) => ({
            feature: row.parent,
            enabled: row.enabled,
            variants: row.variants,
        }));
    }

    async getDependencies(children: string[]): Promise<IFeatureDependency[]> {
        const rows = await this.db('dependent_features').whereIn(
            'child',
            children,
        );

        return rows.map((row) => ({
            feature: row.child,
            dependency: {
                feature: row.parent,
                enabled: row.enabled,
                variants: row.variants,
            },
        }));
    }

    async getPossibleParentFeatures(child: string): Promise<string[]> {
        const result = await this.db('features')
            .where('features.name', child)
            .select('features.project');
        if (result.length === 0) {
            return [];
        }
        const rows = await this.db('features')
            .leftJoin(
                'dependent_features',
                'features.name',
                'dependent_features.child',
            )
            .where('features.project', result[0].project)
            .andWhere('features.name', '!=', child)
            .andWhere('dependent_features.child', null)
            .andWhere('features.archived_at', null)
            .select('features.name')
            .orderBy('features.name');

        return rows.map((item) => item.name);
    }

    async getPossibleParentVariants(parent: string): Promise<string[]> {
        const strategyVariantsQuery = this.db('feature_strategies')
            .select(
                this.db.raw(
                    "jsonb_array_elements(variants)->>'name' as variant_name",
                ),
            )
            .where('feature_name', parent);

        const featureEnvironmentVariantsQuery = this.db('feature_environments')
            .select(
                this.db.raw(
                    "jsonb_array_elements(variants)->>'name' as variant_name",
                ),
            )
            .where('feature_name', parent);

        const results = await Promise.all([
            strategyVariantsQuery,
            featureEnvironmentVariantsQuery,
        ]);
        const flatResults = results
            .flat()
            .map((item) => (item as unknown as IVariantName).variant_name);
        const uniqueResults = [...new Set(flatResults)];

        return uniqueResults.sort();
    }

    async haveDependencies(features: string[]): Promise<boolean> {
        const parents = await this.db('dependent_features')
            .whereIn('parent', features)
            .orWhereIn('child', features)
            .limit(1);

        return parents.length > 0;
    }

    async hasAnyDependencies(): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM dependent_features) AS present`,
        );
        const { present } = result.rows[0];
        return present;
    }
}

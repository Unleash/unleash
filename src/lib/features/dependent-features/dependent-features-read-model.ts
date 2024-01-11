import { Db } from '../../db/db';
import { IDependentFeaturesReadModel } from './dependent-features-read-model-type';
import { IDependency, IFeatureDependency } from '../../types';

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

    async getParentOptions(child: string): Promise<string[]> {
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

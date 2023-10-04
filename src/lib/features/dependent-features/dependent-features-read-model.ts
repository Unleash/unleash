import { Db } from '../../db/db';
import { IDependentFeaturesReadModel } from './dependent-features-read-model-type';
import { IDependency } from '../../types';

export class DependentFeaturesReadModel implements IDependentFeaturesReadModel {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
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
            .select('features.name');

        return rows.map((item) => item.name);
    }

    async hasDependencies(feature: string): Promise<boolean> {
        const parents = await this.db('dependent_features')
            .where('parent', feature)
            .orWhere('child', feature)
            .limit(1);

        return parents.length > 0;
    }
}

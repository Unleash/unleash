import { Db } from '../../db/db';
import { IDependentFeaturesReadModel } from './dependent-features-read-model-type';

export class DependentFeaturesReadModel implements IDependentFeaturesReadModel {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async getChildren(parent: string): Promise<string[]> {
        const rows = await this.db('dependent_features').where(
            'parent',
            parent,
        );

        return rows.map((row) => row.child);
    }

    async getParents(child: string): Promise<string[]> {
        const rows = await this.db('dependent_features').where('child', child);

        return rows.map((row) => row.parent);
    }

    async getParentOptions(child: string): Promise<string[]> {
        const result = await this.db('features as f')
            .where('f.name', child)
            .select('f.project');
        if (result.length === 0) {
            return [];
        }
        const rows = await this.db('features as f')
            .leftJoin('dependent_features as df', 'f.name', 'df.child')
            .where('f.project', result[0].project)
            .andWhere('f.name', '!=', child)
            .andWhere('df.child', null)
            .select('f.name');

        return rows.map((item) => item.name);
    }
}

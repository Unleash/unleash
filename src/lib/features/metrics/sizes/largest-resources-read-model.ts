import type { Db } from '../../../db/db.js';
import type { ILargestResourcesReadModel } from './largest-resources-read-model-type.js';

export class LargestResourcesReadModel implements ILargestResourcesReadModel {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async getLargestProjectEnvironments(
        limit: number,
    ): Promise<Array<{ project: string; environment: string; size: number }>> {
        const result = await this.db('feature_strategies')
            .select('project_name', 'environment')
            .sum({
                total_size: this.db.raw(
                    'pg_column_size(constraints) + pg_column_size(variants) + pg_column_size(parameters)',
                ),
            })
            .groupBy('project_name', 'environment')
            .orderBy('total_size', 'desc')
            .limit(limit);

        return result.map(
            (row: {
                project_name: string;
                environment: string;
                total_size: string;
            }) => ({
                project: row.project_name,
                environment: row.environment,
                size: Number(row.total_size),
            }),
        );
    }

    async getLargestFeatureEnvironments(
        limit: number,
    ): Promise<Array<{ feature: string; environment: string; size: number }>> {
        const result = await this.db('feature_strategies')
            .select('feature_name', 'environment')
            .sum({
                total_size: this.db.raw(
                    'pg_column_size(constraints) + pg_column_size(variants) + pg_column_size(parameters)',
                ),
            })
            .groupBy('feature_name', 'environment')
            .orderBy('total_size', 'desc')
            .limit(limit);

        return result.map(
            (row: {
                feature_name: string;
                environment: string;
                total_size: string;
            }) => ({
                feature: row.feature_name,
                environment: row.environment,
                size: Number(row.total_size),
            }),
        );
    }
}

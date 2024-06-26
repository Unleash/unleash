import type { Db } from '../../../db/db';
import type { ILargestResourcesReadModel } from './largest-resources-read-model-type';

export class LargestResourcesReadModel implements ILargestResourcesReadModel {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async getLargestProjectEnvironments(
        limit: number,
    ): Promise<Array<{ project: string; environment: string; size: number }>> {
        const { rows } = await this.db.raw(`
            WITH ProjectSizes AS (
                SELECT
                    project_name,
                    environment,
                    SUM(pg_column_size(constraints) + pg_column_size(variants) + pg_column_size(parameters)) AS total_size
                FROM
                    feature_strategies
                GROUP BY
                    project_name,
                    environment
            )
            SELECT
                project_name,
                environment,
                total_size
            FROM
                ProjectSizes
            ORDER BY
                total_size DESC
            LIMIT ${limit}
        `);

        return rows.map((row) => ({
            project: row.project_name,
            environment: row.environment,
            size: Number(row.total_size),
        }));
    }

    async getLargestFeatureEnvironments(
        limit: number,
    ): Promise<Array<{ feature: string; environment: string; size: number }>> {
        const { rows } = await this.db.raw(`
            WITH FeatureSizes AS (
                SELECT
                    feature_name,
                    environment,
                    SUM(pg_column_size(constraints) + pg_column_size(variants) + pg_column_size(parameters)) AS total_size
                FROM
                    feature_strategies
                GROUP BY
                    feature_name,
                    environment
            )
            SELECT
                feature_name,
                environment,
                total_size
            FROM
                FeatureSizes
            ORDER BY
                total_size DESC
            LIMIT ${limit}
        `);

        return rows.map((row) => ({
            feature: row.feature_name,
            environment: row.environment,
            size: Number(row.total_size),
        }));
    }
}

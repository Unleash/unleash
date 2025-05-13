import type { Db } from '../../db/db.js';
import type { IFeatureStrategiesReadModel } from './types/feature-strategies-read-model-type.js';

export class FeatureStrategiesReadModel implements IFeatureStrategiesReadModel {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    private activeStrategies() {
        return this.db('feature_strategies')
            .leftJoin(
                'features',
                'features.name',
                'feature_strategies.feature_name',
            )
            .where('features.archived_at', null);
    }

    async getMaxFeatureEnvironmentStrategies(): Promise<{
        feature: string;
        environment: string;
        count: number;
    } | null> {
        const rows = await this.activeStrategies()
            .select('feature_name', 'environment')
            .count('id as strategy_count')
            .groupBy('feature_name', 'environment')
            .orderBy('strategy_count', 'desc')
            .limit(1);

        return rows.length > 0
            ? {
                  feature: String(rows[0].feature_name),
                  environment: String(rows[0].environment),
                  count: Number(rows[0].strategy_count),
              }
            : null;
    }

    async getMaxFeatureStrategies(): Promise<{
        feature: string;
        count: number;
    } | null> {
        const rows = await this.activeStrategies()
            .select('feature_name')
            .count('id as strategy_count')
            .groupBy('feature_name')
            .orderBy('strategy_count', 'desc')
            .limit(1);

        return rows.length > 0
            ? {
                  feature: String(rows[0].feature_name),
                  count: Number(rows[0].strategy_count),
              }
            : null;
    }

    async getMaxConstraintValues(): Promise<{
        feature: string;
        environment: string;
        count: number;
    } | null> {
        const rows = await this.activeStrategies()
            .select(
                'feature_name',
                'environment',
                this.db.raw(
                    "MAX(coalesce(jsonb_array_length(constraint_value->'values'), 0)) as max_values_count",
                ),
            )
            .crossJoin(
                this.db.raw(
                    `jsonb_array_elements(constraints) AS constraint_value`,
                ),
            )
            .groupBy('feature_name', 'environment')
            .orderBy('max_values_count', 'desc')
            .limit(1);

        return rows.length > 0
            ? {
                  feature: String(rows[0].feature_name),
                  environment: String(rows[0].environment),
                  count: Number(rows[0].max_values_count),
              }
            : null;
    }

    async getMaxConstraintsPerStrategy(): Promise<{
        feature: string;
        environment: string;
        count: number;
    } | null> {
        const rows = await this.activeStrategies()
            .select(
                'feature_name',
                'environment',
                this.db.raw(
                    'jsonb_array_length(constraints) as constraint_count',
                ),
            )

            .orderBy('constraint_count', 'desc')
            .limit(1);

        return rows.length > 0
            ? {
                  feature: String(rows[0].feature_name),
                  environment: String(rows[0].environment),
                  count: Number(rows[0].constraint_count),
              }
            : null;
    }
}

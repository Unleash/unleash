import type { Db } from '../../db/db';
import type { IFeatureStrategiesReadModel } from './types/feature-strategies-read-model-type';

export class FeatureStrategiesReadModel implements IFeatureStrategiesReadModel {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async getMaxFeatureEnvironmentStrategies(): Promise<{
        feature: string;
        environment: string;
        count: number;
    } | null> {
        const rows = await this.db('feature_strategies')
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
        const rows = await this.db('feature_strategies')
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
}

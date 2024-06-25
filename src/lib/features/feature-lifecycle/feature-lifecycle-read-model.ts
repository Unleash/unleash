import type { Db } from '../../db/db';
import type {
    IFeatureLifecycleReadModel,
    StageCount,
    StageCountByProject,
} from './feature-lifecycle-read-model-type';
import { getCurrentStage } from './get-current-stage';
import type {
    IFeatureLifecycleStage,
    IFlagResolver,
    StageName,
} from '../../types';

type DBType = {
    feature: string;
    stage: StageName;
    status: string | null;
    created_at: Date;
};

export class FeatureLifecycleReadModel implements IFeatureLifecycleReadModel {
    private db: Db;

    private flagResolver: IFlagResolver;

    constructor(db: Db, flagResolver: IFlagResolver) {
        this.db = db;
        this.flagResolver = flagResolver;
    }

    async getStageCount(): Promise<StageCount[]> {
        if (!this.flagResolver.isEnabled('featureLifecycleMetrics')) {
            return [];
        }

        const { rows } = await this.db.raw(`
            SELECT
                stage,
                COUNT(*) AS feature_count
            FROM (
                SELECT DISTINCT ON (feature)
                    feature,
                    stage,
                    created_at
                FROM
                    feature_lifecycles
                ORDER BY
                    feature, created_at DESC
            ) AS LatestStages
            GROUP BY
                stage;
        `);

        return rows.map((row) => ({
            stage: row.stage,
            count: Number(row.feature_count),
        }));
    }

    async getStageCountByProject(): Promise<StageCountByProject[]> {
        if (!this.flagResolver.isEnabled('featureLifecycleMetrics')) {
            return [];
        }

        const { rows } = await this.db.raw(`
            SELECT
                f.project,
                ls.stage,
                COUNT(*) AS feature_count
            FROM (
                SELECT DISTINCT ON (fl.feature)
                    fl.feature,
                    fl.stage,
                    fl.created_at
                FROM
                    feature_lifecycles fl
                ORDER BY
                    fl.feature, fl.created_at DESC
            ) AS ls
            JOIN
                features f ON f.name = ls.feature
            GROUP BY
                f.project,
                ls.stage;
        `);

        return rows.map((row) => ({
            stage: row.stage,
            count: Number(row.feature_count),
            project: row.project,
        }));
    }

    async findCurrentStage(
        feature: string,
    ): Promise<IFeatureLifecycleStage | undefined> {
        const results = await this.db('feature_lifecycles')
            .where({ feature })
            .orderBy('created_at', 'asc');

        const stages = results.map(({ stage, status, created_at }: DBType) => ({
            stage,
            ...(status ? { status } : {}),
            enteredStageAt: created_at,
        }));

        return getCurrentStage(stages);
    }
}

import type { Db } from '../../db/db.js';
import type {
    IFeatureLifecycleReadModel,
    StageCount,
    StageCountByProject,
} from './feature-lifecycle-read-model-type.js';
import { getCurrentStage } from './get-current-stage.js';
import type {
    IFeatureLifecycleStage,
    IProjectLifecycleStageDuration,
    StageName,
} from '../../types/index.js';
import { calculateStageDurations } from './calculate-stage-durations.js';
import type { FeatureLifecycleProjectItem } from './feature-lifecycle-store-type.js';

type DBType = {
    feature: string;
    stage: StageName;
    status: string | null;
    created_at: Date;
};

type DBProjectType = DBType & {
    project: string;
};

export class FeatureLifecycleReadModel implements IFeatureLifecycleReadModel {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async getStageCount(accessibleProjects?: string[]): Promise<StageCount[]> {
        const hasProjectFilter = !!accessibleProjects?.length;

        const query = this.db
            .from(
                this.db('feature_lifecycles as fl')
                    .select('fl.feature', 'fl.stage', 'fl.created_at')
                    .distinctOn('fl.feature')
                    .orderBy('fl.feature')
                    .orderBy('fl.created_at', 'desc')
                    .as('latest_feature_lifecycle'),
            )
            .join('features as f', 'f.name', 'latest_feature_lifecycle.feature')
            .groupBy('latest_feature_lifecycle.stage')
            .select('latest_feature_lifecycle.stage')
            .count('* as feature_count');

        if (hasProjectFilter) {
            query.whereIn('f.project', accessibleProjects);
        }

        const rows = await query;

        return rows.map((row: any) => ({
            stage: row.stage,
            count: Number(row.feature_count),
        }));
    }

    async getStageCountByProject(): Promise<StageCountByProject[]> {
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

    private async getAll(): Promise<FeatureLifecycleProjectItem[]> {
        const results = await this.db('feature_lifecycles as flc')
            .select('flc.feature', 'flc.stage', 'flc.created_at', 'f.project')
            .leftJoin('features as f', 'f.name', 'flc.feature')
            .orderBy('created_at', 'asc');

        return results.map(
            ({ feature, stage, created_at, project }: DBProjectType) => ({
                feature,
                stage,
                project,
                enteredStageAt: new Date(created_at),
            }),
        );
    }

    public async getAllWithStageDuration(): Promise<
        IProjectLifecycleStageDuration[]
    > {
        const featureLifeCycles = await this.getAll();
        return calculateStageDurations(featureLifeCycles);
    }
}

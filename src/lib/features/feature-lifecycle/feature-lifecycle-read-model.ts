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
    IProjectLifecycleStageDuration,
    StageName,
} from '../../types';
import { calculateStageDurations } from './calculate-stage-durations';
import type { FeatureLifecycleProjectItem } from './feature-lifecycle-store-type';

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

    private flagResolver: IFlagResolver;

    constructor(db: Db, flagResolver: IFlagResolver) {
        this.db = db;
        this.flagResolver = flagResolver;
    }

    async getStageCount(): Promise<StageCount[]> {
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

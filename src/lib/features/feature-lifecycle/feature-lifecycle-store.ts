import type {
    FeatureLifecycleStage,
    IFeatureLifecycleStore,
    FeatureLifecycleView,
    FeatureLifecycleProjectItem,
} from './feature-lifecycle-store-type';
import type { Db } from '../../db/db';
import type { StageName } from '../../types';

type DBType = {
    stage: StageName;
    created_at: string;
    status: string | null;
    status_value: string | null;
};

type DBProjectType = DBType & {
    feature: string;
    project: string;
};

export class FeatureLifecycleStore implements IFeatureLifecycleStore {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async backfill(): Promise<void> {
        await this.db.raw(`
            INSERT INTO feature_lifecycles (feature, stage, created_at)
            SELECT features.name, 'initial', features.created_at
            FROM features
                LEFT JOIN feature_lifecycles ON features.name = feature_lifecycles.feature
            WHERE feature_lifecycles.feature IS NULL
        `);
    }

    async insert(
        featureLifecycleStages: FeatureLifecycleStage[],
    ): Promise<void> {
        const existingFeatures = await this.db('features')
            .select('name')
            .whereIn(
                'name',
                featureLifecycleStages.map((stage) => stage.feature),
            );
        const existingFeaturesSet = new Set(
            existingFeatures.map((item) => item.name),
        );
        const validStages = featureLifecycleStages.filter((stage) =>
            existingFeaturesSet.has(stage.feature),
        );

        if (validStages.length === 0) {
            return;
        }
        await this.db('feature_lifecycles')
            .insert(
                validStages.map((stage) => ({
                    feature: stage.feature,
                    stage: stage.stage,
                    status: stage.status,
                    status_value: stage.statusValue,
                })),
            )
            .returning('*')
            .onConflict(['feature', 'stage'])
            .ignore();
    }

    async get(feature: string): Promise<FeatureLifecycleView> {
        const results = await this.db('feature_lifecycles')
            .where({ feature })
            .orderBy('created_at', 'asc');

        return results.map(({ stage, status, created_at }: DBType) => ({
            stage,
            ...(status ? { status } : {}),
            enteredStageAt: new Date(created_at),
        }));
    }

    async getAll(): Promise<FeatureLifecycleProjectItem[]> {
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

    async delete(feature: string): Promise<void> {
        await this.db('feature_lifecycles').where({ feature }).del();
    }

    async deleteStage(stage: FeatureLifecycleStage): Promise<void> {
        await this.db('feature_lifecycles')
            .where({
                stage: stage.stage,
                feature: stage.feature,
            })
            .del();
    }

    async stageExists(stage: FeatureLifecycleStage): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS(SELECT 1 FROM feature_lifecycles WHERE stage = ? and feature = ?) AS present`,
            [stage.stage, stage.feature],
        );
        const { present } = result.rows[0];
        return present;
    }
}

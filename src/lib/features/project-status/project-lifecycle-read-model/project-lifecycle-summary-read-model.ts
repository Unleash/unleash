import type { Db } from '../../../db/db.js';
import type { IFeatureToggleStore } from '../../../types/index.js';
import { subDays } from 'date-fns';
import type {
    IProjectLifecycleSummaryReadModel,
    ProjectLifecycleSummary,
} from './project-lifecycle-read-model-type.js';

type FlagsInStage = {
    initial: number;
    'pre-live': number;
    live: number;
    completed: number;
    archived: number;
};

type AverageTimeInStage = {
    initial: number | null;
    'pre-live': number | null;
    live: number | null;
    completed: number | null;
};

export class ProjectLifecycleSummaryReadModel
    implements IProjectLifecycleSummaryReadModel
{
    private db: Db;
    private featureToggleStore: IFeatureToggleStore;

    constructor(db: Db, featureToggleStore: IFeatureToggleStore) {
        this.db = db;
        this.featureToggleStore = featureToggleStore;
    }

    async getAverageTimeInEachStage(
        projectId: string,
    ): Promise<AverageTimeInStage> {
        const q = this.db
            .with(
                'stage_durations',
                this.db('feature_lifecycles as fl1')
                    .select(
                        'fl1.feature',
                        'fl1.stage',
                        this.db.raw(
                            'EXTRACT(EPOCH FROM (MIN(fl2.created_at) - fl1.created_at)) / 86400 AS days_in_stage',
                        ),
                    )
                    .join('feature_lifecycles as fl2', function () {
                        this.on('fl1.feature', '=', 'fl2.feature').andOn(
                            'fl2.created_at',
                            '>',
                            'fl1.created_at',
                        );
                    })
                    .innerJoin('features as f', 'fl1.feature', 'f.name')
                    .where('f.project', projectId)
                    .whereNot('fl1.stage', 'archived')
                    .groupBy('fl1.feature', 'fl1.stage'),
            )
            .select('stage_durations.stage')
            .select(
                this.db.raw('ROUND(AVG(days_in_stage)) AS avg_days_in_stage'),
            )
            .from('stage_durations')
            .groupBy('stage_durations.stage');

        const result = await q;
        return result.reduce(
            (acc, row) => {
                acc[row.stage] = Number(row.avg_days_in_stage);
                return acc;
            },
            {
                initial: null,
                'pre-live': null,
                live: null,
                completed: null,
            },
        );
    }

    async getCurrentFlagsInEachStage(projectId: string): Promise<FlagsInStage> {
        const query = this.db
            .with('latest_stage', (qb) => {
                qb.select('fl.feature')
                    .max('fl.created_at as max_created_at')
                    .from('feature_lifecycles as fl')
                    .groupBy('fl.feature');
            })
            .from('latest_stage as ls')
            .innerJoin('feature_lifecycles as fl', (qb) => {
                qb.on('ls.feature', '=', 'fl.feature').andOn(
                    'ls.max_created_at',
                    '=',
                    'fl.created_at',
                );
            })
            .innerJoin('features as f', 'fl.feature', 'f.name')
            .where('f.project', projectId)
            .whereNot('fl.stage', 'archived')
            .whereNull('f.archived_at')
            .select('fl.stage')
            .count('fl.feature as flag_count')
            .groupBy('fl.stage');

        const result = await query;

        const archivedCount = await this.featureToggleStore.count({
            project: projectId,
            archived: true,
        });

        const lifecycleStages = result.reduce(
            (acc, row) => {
                acc[row.stage] = Number(row.flag_count);
                return acc;
            },
            {
                initial: 0,
                'pre-live': 0,
                live: 0,
                completed: 0,
            },
        ) as FlagsInStage;
        return {
            ...lifecycleStages,
            archived: archivedCount,
        };
    }

    async getArchivedFlagsLast30Days(projectId: string): Promise<number> {
        const dateMinusThirtyDays = subDays(new Date(), 30).toISOString();

        return this.featureToggleStore.countByDate({
            project: projectId,
            archived: true,
            dateAccessor: 'archived_at',
            date: dateMinusThirtyDays,
        });
    }

    async getProjectLifecycleSummary(
        projectId: string,
    ): Promise<ProjectLifecycleSummary> {
        const [
            averageTimeInEachStage,
            currentFlagsInEachStage,
            archivedFlagsLast30Days,
        ] = await Promise.all([
            this.getAverageTimeInEachStage(projectId),
            this.getCurrentFlagsInEachStage(projectId),
            this.getArchivedFlagsLast30Days(projectId),
        ]);

        return {
            initial: {
                averageDays: averageTimeInEachStage.initial,
                currentFlags: currentFlagsInEachStage.initial,
            },
            preLive: {
                averageDays: averageTimeInEachStage['pre-live'],
                currentFlags: currentFlagsInEachStage['pre-live'],
            },
            live: {
                averageDays: averageTimeInEachStage.live,
                currentFlags: currentFlagsInEachStage.live,
            },
            completed: {
                averageDays: averageTimeInEachStage.completed,
                currentFlags: currentFlagsInEachStage.completed,
            },
            archived: {
                currentFlags: currentFlagsInEachStage.archived,
                last30Days: archivedFlagsLast30Days,
            },
        };
    }
}

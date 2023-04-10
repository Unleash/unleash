import { Logger, LogProvider } from '../logger';

import metricsHelper from '../util/metrics-helper';
import { DB_TIME } from '../metric-events';
import EventEmitter from 'events';
import { IProjectStats } from 'lib/services/project-service';
import {
    ICreateEnabledDates,
    IProjectStatsStore,
} from 'lib/types/stores/project-stats-store-type';
import { Db } from './db';

const TABLE = 'project_stats';

const PROJECT_STATS_COLUMNS = [
    'avg_time_to_prod_current_window',
    'project',
    'features_created_current_window',
    'features_created_past_window',
    'features_archived_current_window',
    'features_archived_past_window',
    'project_changes_current_window',
    'project_changes_past_window',
    'project_members_added_current_window',
];

interface IProjectStatsRow {
    avg_time_to_prod_current_window: number;
    features_created_current_window: number;
    features_created_past_window: number;
    features_archived_current_window: number;
    features_archived_past_window: number;
    project_changes_current_window: number;
    project_changes_past_window: number;
    project_members_added_current_window: number;
}

class ProjectStatsStore implements IProjectStatsStore {
    private db: Db;

    private logger: Logger;

    private timer: Function;

    constructor(db: Db, eventBus: EventEmitter, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('project-stats-store.ts');
        this.timer = (action) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'project_stats',
                action,
            });
    }

    async updateProjectStats(
        projectId: string,
        status: IProjectStats,
    ): Promise<void> {
        await this.db(TABLE)
            .insert({
                avg_time_to_prod_current_window:
                    status.avgTimeToProdCurrentWindow,
                project: projectId,
                features_created_current_window: status.createdCurrentWindow,
                features_created_past_window: status.createdPastWindow,
                features_archived_current_window: status.archivedCurrentWindow,
                features_archived_past_window: status.archivedPastWindow,
                project_changes_current_window:
                    status.projectActivityCurrentWindow,
                project_changes_past_window: status.projectActivityPastWindow,
                project_members_added_current_window:
                    status.projectMembersAddedCurrentWindow,
            })
            .onConflict('project')
            .merge();
    }

    async getProjectStats(projectId: string): Promise<IProjectStats> {
        const row = await this.db(TABLE)
            .select(PROJECT_STATS_COLUMNS)
            .where({ project: projectId })
            .first();

        return this.mapRow(row);
    }

    mapRow(row: IProjectStatsRow): IProjectStats {
        if (!row) {
            return {
                avgTimeToProdCurrentWindow: 0,
                createdCurrentWindow: 0,
                createdPastWindow: 0,
                archivedCurrentWindow: 0,
                archivedPastWindow: 0,
                projectActivityCurrentWindow: 0,
                projectActivityPastWindow: 0,
                projectMembersAddedCurrentWindow: 0,
            };
        }

        return {
            avgTimeToProdCurrentWindow: row.avg_time_to_prod_current_window,
            createdCurrentWindow: row.features_created_current_window,
            createdPastWindow: row.features_created_past_window,
            archivedCurrentWindow: row.features_archived_current_window,
            archivedPastWindow: row.features_archived_past_window,
            projectActivityCurrentWindow: row.project_changes_current_window,
            projectActivityPastWindow: row.project_changes_past_window,
            projectMembersAddedCurrentWindow:
                row.project_members_added_current_window,
        };
    }

    // we're not calculating time difference in a DB as it requires specialized
    // time aware libraries
    async getTimeToProdDates(
        projectId: string,
    ): Promise<ICreateEnabledDates[]> {
        const result = await this.db
            .select('events.feature_name')
            // select only first enabled event, distinct works with orderBy
            .distinctOn('events.feature_name')
            .select(
                this.db.raw(
                    'events.created_at as enabled, features.created_at as created',
                ),
            )
            .from('events')
            .innerJoin(
                'environments',
                'environments.name',
                '=',
                'events.environment',
            )
            .innerJoin('features', 'features.name', '=', 'events.feature_name')
            .where('events.type', '=', 'feature-environment-enabled')
            .where('environments.type', '=', 'production')
            .where('features.type', '=', 'release')
            // exclude events for features that were previously deleted
            .where(this.db.raw('events.created_at > features.created_at'))
            .where('features.project', '=', projectId)
            .orderBy('events.feature_name')
            // first enabled event
            .orderBy('events.created_at', 'asc');
        return result;
    }
}

export default ProjectStatsStore;

import { Logger, LogProvider } from '../logger';

import metricsHelper from '../util/metrics-helper';
import { DB_TIME } from '../metric-events';
import EventEmitter from 'events';
import { IProjectStats } from 'lib/services/project-service';
import { IProjectStatsStore } from 'lib/types/stores/project-stats-store-type';
import { Db } from './db';

const TABLE = 'project_stats';

const PROJECT_STATS_COLUMNS = [
    'avg_time_to_prod_current_window',
    'avg_time_to_prod_past_window',
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
    avg_time_to_prod_past_window: number;
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
                avg_time_to_prod_past_window: status.avgTimeToProdPastWindow,
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

    mapRow(row: IProjectStatsRow): IProjectStats | undefined {
        if (!row) {
            return undefined;
        }

        return {
            avgTimeToProdCurrentWindow: row.avg_time_to_prod_current_window,
            avgTimeToProdPastWindow: row.avg_time_to_prod_past_window,
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
}

export default ProjectStatsStore;

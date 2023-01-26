import { Knex } from 'knex';
import { Logger, LogProvider } from '../logger';

import metricsHelper from '../util/metrics-helper';
import { DB_TIME } from '../metric-events';
import EventEmitter from 'events';
import { IProjectStats } from 'lib/services/project-service';
import { IProjectStatsStore } from 'lib/types/stores/project-stats-store-type';

const TABLE = 'project_status';

class ProjectStatsStore implements IProjectStatsStore {
    private db: Knex;

    private logger: Logger;

    private timer: Function;

    constructor(db: Knex, eventBus: EventEmitter, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('project-store.ts');
        this.timer = (action) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'project_status',
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
            })
            .onConflict('project')
            .merge();
    }
}

export default ProjectStatsStore;

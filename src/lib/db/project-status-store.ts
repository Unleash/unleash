import { Knex } from 'knex';
import { Logger, LogProvider } from '../logger';

import metricsHelper from '../util/metrics-helper';
import { DB_TIME } from '../metric-events';
import EventEmitter from 'events';
import { IStatusUpdate } from 'lib/services/project-service';
import { IProjectStatusStore } from 'lib/types/stores/project-status-store-type';

const TABLE = 'project_status';

class ProjectStatusStore implements IProjectStatusStore {
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

    async updateStatus(
        projectId: string,
        status: IStatusUpdate,
    ): Promise<void> {
        await this.db(TABLE)
            .insert({
                avg_time_to_prod_current_window:
                    status.avgTimeToProdCurrentWindow,
                avg_time_to_prod_past_window: status.avgTimeToProdPastWindow,
                project: projectId,
                features_created_current_window: status.createdThisWindow,
                features_created_past_window: status.createdLastWindow,
                features_archived_current_window: status.archivedThisWindow,
                features_archived_past_window: status.archivedLastWindow,
            })
            .onConflict('project')
            .merge();
    }
}

export default ProjectStatusStore;

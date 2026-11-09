import type { Db } from '../../db/db.js';
import metricsHelper from '../../util/metrics-helper.js';
import { DB_TIME } from '../../metric-events.js';
import type EventEmitter from 'events';
import { FEATURE_FAVORITED, FEATURE_UNFAVORITED } from '../../events/index.js';
import type {
    IUserRecentFlagsReadModel,
    UserRecentFlagNamesQuery,
} from './user-recent-flags-read-model-type.js';

export class UserRecentFlagsReadModel implements IUserRecentFlagsReadModel {
    private db: Db;

    private timer: Function;

    constructor(db: Db, eventBus: EventEmitter) {
        this.db = db;
        this.timer = (action) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'user_recent_flags',
                action,
            });
    }

    async getUserRecentFlagNames(
        userId: number,
        { limit, offset, projectAccess }: UserRecentFlagNamesQuery,
    ): Promise<string[]> {
        const stopTimer = this.timer('getUserRecentFlagNames');
        const rows: { name: string }[] = await this.db
            // Reads only events_created_by_user_id_created_at_idx.
            .with('user_events', (query) => {
                query
                    .from('events')
                    .select('feature_name')
                    .max('created_at as last_activity_at')
                    .where('created_by_user_id', userId)
                    .whereNotNull('feature_name')
                    .whereNotIn('type', [
                        FEATURE_FAVORITED,
                        FEATURE_UNFAVORITED,
                    ])
                    .groupBy('feature_name');
            })
            .from('user_events')
            .join('features', 'features.name', 'user_events.feature_name')
            .whereNull('features.archived_at')
            .modify((query) => {
                if (projectAccess.mode === 'limited') {
                    query.whereIn('features.project', projectAccess.projects);
                }
            })
            .select('features.name')
            .orderBy([
                { column: 'user_events.last_activity_at', order: 'desc' },
                { column: 'features.name' },
            ])
            .limit(limit)
            .offset(offset);
        stopTimer();

        return rows.map((row) => row.name);
    }
}

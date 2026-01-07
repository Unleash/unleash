import type {
    IInactiveUserRow,
    IInactiveUsersStore,
} from './types/inactive-users-store-type.js';
import type { Db } from '../../db/db.js';
import type EventEmitter from 'events';
import type { LogProvider } from '../../logger.js';
import metricsHelper from '../../util/metrics-helper.js';
import { DB_TIME } from '../../metric-events.js';

const TABLE = 'users';
export class InactiveUsersStore implements IInactiveUsersStore {
    private db: Db;

    private timer: Function;

    constructor(db: Db, eventBus: EventEmitter, _getLogger: LogProvider) {
        this.db = db;
        this.timer = (action) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'inactive_users',
                action,
            });
    }
    async getInactiveUsers(daysInactive: number): Promise<IInactiveUserRow[]> {
        const stopTimer = this.timer('get_inactive_users');
        const inactiveUsers = await this.db<IInactiveUserRow>(TABLE)
            .select(
                'users.id AS id',
                'users.name AS name',
                'users.username AS username',
                'users.email AS email',
                'users.seen_at AS seen_at',
                'pat.seen_at AS pat_seen_at',
                'users.created_at AS created_at',
            )
            .leftJoin(
                'personal_access_tokens AS pat',
                'pat.user_id',
                'users.id',
            )
            .where('deleted_at', null)
            .andWhere('is_service', false)
            .andWhere('is_system', false)
            .andWhereRaw(
                `(users.seen_at IS NULL OR users.seen_at < now() - INTERVAL '?? days')
        AND (users.created_at IS NULL OR users.created_at < now() - INTERVAL '?? days')
        AND (pat.seen_at IS NULL OR pat.seen_at < now() - INTERVAL '?? days')`,
                [daysInactive, daysInactive, daysInactive],
            );
        stopTimer();
        return inactiveUsers;
    }
}

import {
    IInactiveUserRow,
    IInactiveUsersStore,
} from './types/inactive-users-store-type';
import { Db } from '../../db/db';
import EventEmitter from 'events';
import { Logger, LogProvider } from '../../logger';
import metricsHelper from '../../util/metrics-helper';
import { DB_TIME } from '../../metric-events';

const TABLE = 'users';
export class InactiveUsersStore implements IInactiveUsersStore {
    private db: Db;

    private readonly logger: Logger;

    private timer: Function;

    private eventEmitter: EventEmitter;

    constructor(db: Db, eventBus: EventEmitter, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('users/inactive/inactive-users-store.ts');
        this.eventEmitter = eventBus;
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
                'users.id',
                'pat.user_id',
            )
            .where('deleted_at', null)
            .andWhereRaw(`users.seen_at < now() - INTERVAL '?? DAYS'`, [
                daysInactive,
            ])
            .orWhereRaw(
                `users.seen_at IS NULL AND users.created_at < now() - INTERVAL '?? DAYS'`,
                [daysInactive],
            )
            .andWhereRaw(
                `pat.seen_at IS NULL OR pat.seen_at < now() - INTERVAL '?? DAYS'`,
                [daysInactive],
            );
        stopTimer();
        return inactiveUsers;
    }
}

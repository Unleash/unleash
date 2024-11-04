import type { Db } from '../../db/db';
import metricsHelper from '../../util/metrics-helper';
import type EventEmitter from 'events';
import type {
    IUserSubscriptionsReadModel,
    Subscriber,
} from './user-subscriptions-read-model-type';

const USERS_TABLE = 'users';
const USER_COLUMNS = [
    'id',
    'name',
    'username',
    'email',
    'image_url',
    'is_service',
];
const UNSUBSCRIPTION_TABLE = 'user_unsubscription';

const DB_TIME = 'db_time';

const mapRowToSubscriber = (row) =>
    ({
        name: row.name || row.username || '',
        email: row.email,
    }) as Subscriber;

export class UserSubscriptionsReadModel implements IUserSubscriptionsReadModel {
    private db: Db;

    private timer: Function;

    constructor(db: Db, eventBus: EventEmitter) {
        this.db = db;
        this.timer = (action: string) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'user_subscriptions',
                action,
            });
    }

    async getSubscribedUsers(subscription: string) {
        const timer = this.timer('getSubscribedUsers');
        const unsubscribedUserIdsQuery = this.db(UNSUBSCRIPTION_TABLE)
            .select('user_id')
            .where('subscription', subscription);

        const users = await this.db(USERS_TABLE)
            .select(USER_COLUMNS)
            .whereNotIn('id', unsubscribedUserIdsQuery)
            .andWhere('is_service', false);

        timer();
        return users.filter((row) => row.email).map(mapRowToSubscriber);
    }

    async getUserSubscriptions(userId: number) {
        const timer = this.timer('getUserSubscriptions');
        const subscriptions = await this.db(UNSUBSCRIPTION_TABLE)
            .select('subscription')
            .where('user_id', userId);
        timer();
        return subscriptions.map((row) => row.subscription);
    }
}

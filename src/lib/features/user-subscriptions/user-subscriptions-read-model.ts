import type { Db } from '../../db/db.js';
import {
    SUBSCRIPTION_TYPES,
    type IUserSubscriptionsReadModel,
    type Subscriber,
} from './user-subscriptions-read-model-type.js';

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

const mapRowToSubscriber = (row) =>
    ({
        name: row.name || row.username || '',
        email: row.email,
    }) as Subscriber;

export class UserSubscriptionsReadModel implements IUserSubscriptionsReadModel {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async getSubscribedUsers(subscription: string) {
        const unsubscribedUserIdsQuery = this.db(UNSUBSCRIPTION_TABLE)
            .select('user_id')
            .where('subscription', subscription);

        const users = await this.db(USERS_TABLE)
            .select(USER_COLUMNS)
            .whereNotIn('id', unsubscribedUserIdsQuery)
            .andWhere('is_service', false)
            .andWhere('deleted_at', null)
            .andWhereNot('seen_at', null)
            .andWhereNot('email', null);

        return users.map(mapRowToSubscriber);
    }

    async getUnsubscribedUsers(subscription: string) {
        const unsubscribedUserIdsQuery = this.db(UNSUBSCRIPTION_TABLE)
            .select('user_id')
            .where('subscription', subscription);

        const users = await this.db(USERS_TABLE)
            .select(USER_COLUMNS)
            .whereIn('id', unsubscribedUserIdsQuery)
            .andWhere('is_service', false)
            .andWhere('deleted_at', null)
            .andWhereNot('email', null);

        return users.map(mapRowToSubscriber);
    }

    async getUserSubscriptions(userId: number) {
        const unsubscriptionsList = await this.db(UNSUBSCRIPTION_TABLE)
            .select('subscription')
            .where('user_id', userId);

        const unsubscriptions: string[] = unsubscriptionsList.map(
            (item) => item.subscription,
        );

        return SUBSCRIPTION_TYPES.filter(
            (subscription) => !unsubscriptions.includes(subscription),
        );
    }
}

import type { Db } from '../../db/db.js';
import type { IUserUnsubscribeStore } from './user-unsubscribe-store-type.js';

const COLUMNS = ['user_id', 'subscription', 'created_at'];
export const TABLE = 'user_unsubscription';

interface IUserUnsubscribeTable {
    user_id: number;
    subscription: string;
    created_at?: Date;
}

export class UserUnsubscribeStore implements IUserUnsubscribeStore {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async insert({ userId, subscription }) {
        await this.db
            .table<IUserUnsubscribeTable>(TABLE)
            .insert({ user_id: userId, subscription: subscription })
            .onConflict(['user_id', 'subscription'])
            .ignore()
            .returning(COLUMNS);
    }

    async delete({ userId, subscription }): Promise<void> {
        await this.db
            .table<IUserUnsubscribeTable>(TABLE)
            .where({ user_id: userId, subscription: subscription })
            .del();
    }

    destroy(): void {}
}

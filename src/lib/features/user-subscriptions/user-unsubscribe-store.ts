import type { Logger, LogProvider } from '../../logger';
import type { Db } from '../../db/db';
import type {
    UnsubscribeEntry,
    IUserUnsubscribeStore,
} from './user-unsubscribe-store-type';

const COLUMNS = ['user_id', 'subscription', 'created_at'];
export const TABLE = 'user_unsubscription';

interface IUserUnsubscribeTable {
    user_id: number;
    subscription: string;
    created_at?: Date;
}

const rowToField = (row: IUserUnsubscribeTable): UnsubscribeEntry => ({
    userId: row.user_id,
    subscription: row.subscription,
    createdAt: row.created_at,
});

export default class UserUnsubscribeStore implements IUserUnsubscribeStore {
    private db: Db;

    private logger: Logger;

    constructor(db: Db, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('user-unsubscribe-store.ts');
    }

    async insert({ userId, subscription }) {
        const unsubscribeEntry = await this.db
            .table<IUserUnsubscribeTable>(TABLE)
            .insert({ user_id: userId, subscription: subscription })
            .onConflict(['user_id', 'subscription'])
            .ignore()
            .returning(COLUMNS);

        return rowToField(unsubscribeEntry[0] as IUserUnsubscribeTable);
    }

    async delete({ userId, subscription }): Promise<void> {
        await this.db
            .table<IUserUnsubscribeTable>(TABLE)
            .where({ user_id: userId, subscription: subscription })
            .del();
    }

    destroy(): void {}
}

module.exports = UserUnsubscribeStore;

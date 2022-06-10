import { Knex } from 'knex';
import { EventEmitter } from 'events';
import { LogProvider, Logger } from '../logger';
import {
    IUserSplash,
    IUserSplashKey,
    IUserSplashStore,
} from '../types/stores/user-splash-store';

const COLUMNS = ['user_id', 'splash_id', 'seen'];
const TABLE = 'user_splash';

interface IUserSplashTable {
    seen?: boolean;
    splash_id: string;
    user_id: number;
}

const fieldToRow = (fields: IUserSplash): IUserSplashTable => ({
    seen: fields.seen,
    splash_id: fields.splashId,
    user_id: fields.userId,
});

const rowToField = (row: IUserSplashTable): IUserSplash => ({
    seen: row.seen,
    splashId: row.splash_id,
    userId: row.user_id,
});

export default class UserSplashStore implements IUserSplashStore {
    private db: Knex;

    private logger: Logger;

    constructor(db: Knex, eventBus: EventEmitter, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('user-splash-store.ts');
    }

    async getAllUserSplashes(userId: number): Promise<IUserSplash[]> {
        const userSplash = await this.db
            .table<IUserSplashTable>(TABLE)
            .select()
            .where({ user_id: userId });

        return userSplash.map(rowToField);
    }

    async getSplash(userId: number, splashId: string): Promise<IUserSplash> {
        const userSplash = await this.db
            .table<IUserSplashTable>(TABLE)
            .select()
            .where({ user_id: userId, splash_id: splashId })
            .first();

        return rowToField(userSplash);
    }

    async updateSplash(splash: IUserSplash): Promise<IUserSplash> {
        const insertedSplash = await this.db
            .table<IUserSplashTable>(TABLE)
            .insert(fieldToRow(splash))
            .onConflict(['user_id', 'splash_id'])
            .merge()
            .returning(COLUMNS);

        return rowToField(insertedSplash[0]);
    }

    async delete({ userId, splashId }: IUserSplashKey): Promise<void> {
        await this.db(TABLE)
            .where({ user_id: userId, splash_id: splashId })
            .del();
    }

    async deleteAll(): Promise<void> {
        await this.db(TABLE).del();
    }

    destroy(): void {}

    async exists({ userId, splashId }: IUserSplashKey): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE user_id = ? AND splash_id = ?) AS present`,
            [userId, splashId],
        );
        const { present } = result.rows[0];
        return present;
    }

    async get({ userId, splashId }: IUserSplashKey): Promise<IUserSplash> {
        return this.getSplash(userId, splashId);
    }

    async getAll(): Promise<IUserSplash[]> {
        const userSplashs = await this.db
            .table<IUserSplashTable>(TABLE)
            .select();

        return userSplashs.map(rowToField);
    }
}

module.exports = UserSplashStore;

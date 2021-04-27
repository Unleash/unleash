import EventEmitter from 'events';
import { Knex } from 'knex';
import { Logger, LogProvider } from '../logger';
import NotFoundError from '../error/notfound-error';

const TABLE = 'unleash_session';

interface ISessionRow {
    sid: string;
    sess: string;
    created_at: Date;
    expired?: Date;
}

export interface ISession {
    sid: string;
    sess: any;
    createdAt: Date;
    expired?: Date;
}

export default class SessionStore {
    private logger: Logger;

    private eventBus: EventEmitter;

    private db: Knex;

    constructor(db: Knex, eventBus: EventEmitter, getLogger: LogProvider) {
        this.db = db;
        this.eventBus = eventBus;
        this.logger = getLogger('lib/db/session-store.ts');
    }

    async getActiveSessions(): Promise<ISession[]> {
        const rows = await this.db<ISessionRow>(TABLE)
            .whereNull('expired')
            .orWhere('expired', '>', new Date())
            .orderBy('created_at', 'desc');
        return rows.map(this.rowToSession);
    }

    async getSessionsForUser(userId: number): Promise<ISession[]> {
        const rows = await this.db<ISessionRow>(
            TABLE,
        ).whereRaw(`(sess -> 'user' ->> 'id')::int = ?`, [userId]);
        if (rows && rows.length > 0) {
            return rows.map(this.rowToSession);
        }
        throw new NotFoundError(
            `Could not find sessions for user with id ${userId}`,
        );
    }

    async getSession(sid: string): Promise<ISession> {
        const row = await this.db<ISessionRow>(TABLE)
            .where('sid', '=', sid)
            .first();
        if (row) {
            return this.rowToSession(row);
        }
        throw new NotFoundError(`Could not find session with sid ${sid}`);
    }

    async deleteSessionsForUser(userId: number): Promise<void> {
        await this.db<ISessionRow>(TABLE)
            .whereRaw(`(sess -> 'user' ->> 'id')::int = ?`, [userId])
            .del();
    }

    async deleteSession(sid: string): Promise<void> {
        await this.db<ISessionRow>(TABLE)
            .where('sid', '=', sid)
            .del();
    }

    async insertSession(data: Omit<ISession, 'createdAt'>): Promise<ISession> {
        const row = await this.db<ISessionRow>(TABLE)
            .insert({
                sid: data.sid,
                sess: JSON.stringify(data.sess),
                expired: data.expired || new Date(Date.now() + 86400000),
            })
            .returning<ISessionRow>(['sid', 'sess', 'created_at', 'expired']);
        if (row) {
            return this.rowToSession(row);
        }
        throw new Error('Could not insert session');
    }

    async deleteAll(): Promise<void> {
        await this.db(TABLE).del();
    }

    private rowToSession(row: ISessionRow): ISession {
        return {
            sid: row.sid,
            sess: row.sess,
            createdAt: row.created_at,
            expired: row.expired,
        };
    }
}

module.exports = SessionStore;

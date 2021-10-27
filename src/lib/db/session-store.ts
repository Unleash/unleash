import EventEmitter from 'events';
import { Knex } from 'knex';
import { Logger, LogProvider } from '../logger';
import NotFoundError from '../error/notfound-error';
import { ISession, ISessionStore } from '../types/stores/session-store';
import { addDays } from 'date-fns';

const TABLE = 'unleash_session';

interface ISessionRow {
    sid: string;
    sess: string;
    created_at: Date;
    expired?: Date;
}

export default class SessionStore implements ISessionStore {
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
        const rows = await this.db<ISessionRow>(TABLE).whereRaw(
            "(sess -> 'user' ->> 'id')::int = ?",
            [userId],
        );
        if (rows && rows.length > 0) {
            return rows.map(this.rowToSession);
        }
        throw new NotFoundError(
            `Could not find sessions for user with id ${userId}`,
        );
    }

    async get(sid: string): Promise<ISession> {
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
            .whereRaw("(sess -> 'user' ->> 'id')::int = ?", [userId])
            .del();
    }

    async delete(sid: string): Promise<void> {
        await this.db<ISessionRow>(TABLE).where('sid', '=', sid).del();
    }

    async insertSession(data: Omit<ISession, 'createdAt'>): Promise<ISession> {
        const row = await this.db<ISessionRow>(TABLE)
            .insert({
                sid: data.sid,
                sess: JSON.stringify(data.sess),
                expired: data.expired || addDays(Date.now(), 1),
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

    destroy(): void {}

    async exists(sid: string): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE sid = ?) AS present`,
            [sid],
        );
        const { present } = result.rows[0];
        return present;
    }

    async getAll(): Promise<ISession[]> {
        const rows = await this.db<ISessionRow>(TABLE);
        return rows.map(this.rowToSession);
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

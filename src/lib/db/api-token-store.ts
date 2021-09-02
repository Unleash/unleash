import { EventEmitter } from 'events';
import { Knex } from 'knex';
import metricsHelper from '../util/metrics-helper';
import { DB_TIME } from '../metric-events';
import { Logger, LogProvider } from '../logger';
import NotFoundError from '../error/notfound-error';
import {
    ApiTokenType,
    IApiToken,
    IApiTokenCreate,
    IApiTokenStore,
} from '../types/stores/api-token-store';

const TABLE = 'api_tokens';

interface ITokenTable {
    id: number;
    secret: string;
    username: string;
    type: ApiTokenType;
    expires_at?: Date;
    created_at: Date;
    seen_at?: Date;
}

const toRow = (newToken: IApiTokenCreate) => ({
    username: newToken.username,
    secret: newToken.secret,
    type: newToken.type,
    expires_at: newToken.expiresAt,
});

const toToken = (row: ITokenTable): IApiToken => ({
    secret: row.secret,
    username: row.username,
    type: row.type,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
});

export class ApiTokenStore implements IApiTokenStore {
    private logger: Logger;

    private timer: Function;

    private db: Knex;

    constructor(db: Knex, eventBus: EventEmitter, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('api-tokens.js');
        this.timer = (action: string) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'api-tokens',
                action,
            });
    }

    async getAll(): Promise<IApiToken[]> {
        const stopTimer = this.timer('getAll');
        const rows = await this.db<ITokenTable>(TABLE);
        stopTimer();
        return rows.map(toToken);
    }

    async getAllActive(): Promise<IApiToken[]> {
        const stopTimer = this.timer('getAllActive');
        const rows = await this.db<ITokenTable>(TABLE)
            .where('expires_at', 'IS', null)
            .orWhere('expires_at', '>', 'now()');
        stopTimer();
        return rows.map(toToken);
    }

    async insert(newToken: IApiTokenCreate): Promise<IApiToken> {
        const [row] = await this.db<ITokenTable>(TABLE).insert(
            toRow(newToken),
            ['created_at'],
        );
        return { ...newToken, createdAt: row.created_at };
    }

    destroy(): void {}

    async exists(secret: string): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE secret = ?) AS present`,
            [secret],
        );
        const { present } = result.rows[0];
        return present;
    }

    async get(key: string): Promise<IApiToken> {
        const row = await this.db(TABLE).where('secret', key).first();
        return toToken(row);
    }

    async delete(secret: string): Promise<void> {
        return this.db<ITokenTable>(TABLE).where({ secret }).del();
    }

    async deleteAll(): Promise<void> {
        return this.db<ITokenTable>(TABLE).del();
    }

    async setExpiry(secret: string, expiresAt: Date): Promise<IApiToken> {
        const rows = await this.db<ITokenTable>(TABLE)
            .update({ expires_at: expiresAt })
            .where({ secret })
            .returning('*');
        if (rows.length > 0) {
            return toToken(rows[0]);
        }
        throw new NotFoundError('Could not find api-token.');
    }

    async markSeenAt(secrets: string[]): Promise<void> {
        const now = new Date();
        try {
            await this.db(TABLE)
                .whereIn('secrets', secrets)
                .update({ seen_at: now });
        } catch (err) {
            this.logger.error('Could not update lastSeen, error: ', err);
        }
    }
}

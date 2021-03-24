import { EventEmitter } from 'events';
import { Knex } from 'knex';
import metricsHelper from '../metrics-helper';
import { DB_TIME } from '../events';
import { Logger, LogProvider } from '../logger';
import NotFoundError from '../error/notfound-error';

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

export enum ApiTokenType {
    CLIENT = 'client',
    ADMIN = 'admin',
}

export interface IApiTokenCreate {
    secret: string;
    username: string;
    type: ApiTokenType;
    expiresAt?: Date;
}

export interface IApiToken extends IApiTokenCreate {
    createdAt: Date;
    seenAt?: Date;
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

export class ApiTokenStore {
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
        const rows = await this.db<ITokenTable>(TABLE).where(
            'expires_at',
            '>',
            new Date(),
        );
        stopTimer();
        return rows.map(toToken);
    }

    async insert(newToken: IApiTokenCreate): Promise<IApiToken> {
        const [createdAt] = await this.db<ITokenTable>(TABLE).insert(
            toRow(newToken),
            ['created_at'],
        );
        return { ...newToken, createdAt };
    }

    async delete(secret: string): Promise<void> {
        return this.db<ITokenTable>(TABLE)
            .where({ secret })
            .del();
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

import { EventEmitter } from 'events';
import Knex from 'knex';
import metricsHelper from '../metrics-helper';
import { DB_TIME } from '../events';

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
    id: number;
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
    id: row.id,
    secret: row.secret,
    username: row.username,
    type: row.type,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
});

export class ApiTokenStore {
    private logger: Function;

    private timer: Function;

    private db: Knex;

    constructor(db: Knex, eventBus: EventEmitter, getLogger: Function) {
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
        const [id, createdAt] = await this.db<ITokenTable>(TABLE).insert(
            toRow(newToken),
            ['id', 'created_at'],
        );
        return { ...newToken, id, createdAt };
    }

    async remove(id: number): Promise<IApiToken> {
        return this.db<ITokenTable>(TABLE)
            .where({ id })
            .del();
    }
}

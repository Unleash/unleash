import type { EventEmitter } from 'events';
import metricsHelper from '../util/metrics-helper.js';
import { DB_TIME } from '../metric-events.js';
import type { Logger, LogProvider } from '../logger.js';
import NotFoundError from '../error/notfound-error.js';
import type { IApiTokenStore } from '../types/stores/api-token-store.js';
import {
    ApiTokenType,
    type Db,
    type IApiToken,
    type IApiTokenCreate,
    type IFlagResolver,
} from '../types/index.js';
import { ALL_PROJECTS } from '../internals.js';
import { isAllProjects } from '../server-impl.js';
import { inTransaction } from './transaction.js';

const TABLE = 'api_tokens';
const API_LINK_TABLE = 'api_token_project';

const ALL = '*';

interface ITokenInsert {
    id: number;
    secret: string;
    username: string;
    type: ApiTokenType;
    expires_at?: Date;
    created_at: Date;
    seen_at?: Date;
    environment: string;
    tokenName?: string;
}

interface ITokenRow extends ITokenInsert {
    project: string;
}

interface ITokenSelectRow {
    secret: string;
    username: string;
    token_name?: string;
    type: ApiTokenType;
    expires_at?: Date;
    created_at: Date;
    seen_at?: Date;
    environment?: string;
    alias?: string | null;
}

const tokenRowReducer = (acc, tokenRow) => {
    const { project, ...token } = tokenRow;
    if (!acc[tokenRow.secret]) {
        acc[tokenRow.secret] = {
            secret: token.secret,
            tokenName: token.token_name ? token.token_name : token.username,
            // backend token type needs to be supported in Edge before being able to return them in the API
            type: (token.type === ApiTokenType.BACKEND
                ? ApiTokenType.CLIENT
                : token.type
            ).toLowerCase(),
            project: ALL,
            projects: [ALL],
            environment: token.environment ? token.environment : ALL,
            expiresAt: token.expires_at,
            createdAt: token.created_at,
            alias: token.alias,
            seenAt: token.seen_at,
        };
    }
    const currentToken = acc[tokenRow.secret];
    if (tokenRow.project) {
        if (isAllProjects(currentToken.projects)) {
            currentToken.projects = [];
        }
        currentToken.projects.push(tokenRow.project);
        currentToken.project = currentToken.projects.join(',');
    }
    return acc;
};

const toRow = (newToken: IApiTokenCreate) => ({
    username: newToken.tokenName,
    token_name: newToken.tokenName,
    secret: newToken.secret,
    type: newToken.type,
    environment:
        newToken.environment === ALL ? undefined : newToken.environment,
    expires_at: newToken.expiresAt,
    alias: newToken.alias || null,
});

const toTokens = (rows: any[]): IApiToken[] => {
    const tokens = rows.reduce(tokenRowReducer, {});
    return Object.values(tokens);
};

export class ApiTokenStore implements IApiTokenStore {
    private logger: Logger;

    private timer: Function;

    private db: Db;

    private readonly flagResolver: IFlagResolver;

    constructor(
        db: Db,
        eventBus: EventEmitter,
        getLogger: LogProvider,
        flagResolver: IFlagResolver,
    ) {
        this.db = db;
        this.logger = getLogger('api-tokens.js');
        this.timer = (action: string) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'api-tokens',
                action,
            });
        this.flagResolver = flagResolver;
    }

    // helper function that we can move to utils
    async withTimer<T>(timerName: string, fn: () => Promise<T>): Promise<T> {
        const stopTimer = this.timer(timerName);
        try {
            return await fn();
        } finally {
            stopTimer();
        }
    }

    async count(): Promise<number> {
        return this.db(TABLE)
            .count('*')
            .then((res) => Number(res[0].count));
    }

    async countByType(): Promise<Map<string, number>> {
        return this.db(TABLE)
            .select('type')
            .count('*')
            .groupBy('type')
            .then((res) => {
                const map = new Map<string, number>();
                res.forEach((row) => {
                    map.set(row.type.toString(), Number(row.count));
                });
                return map;
            });
    }

    async getAll(): Promise<IApiToken[]> {
        const stopTimer = this.timer('getAll');
        const rows = await this.makeTokenProjectQuery();
        stopTimer();
        return toTokens(rows);
    }

    async getAllActive(): Promise<IApiToken[]> {
        const stopTimer = this.timer('getAllActive');
        const rows = await this.db<ITokenSelectRow>(`${TABLE} as tokens`)
            .select(
                'tokens.secret',
                'username',
                'token_name',
                'type',
                'expires_at',
                'created_at',
                'alias',
                'seen_at',
                'environment',
            )
            .where((builder) => {
                builder
                    .whereNull('expires_at')
                    .orWhere('expires_at', '>', this.db.raw('now()'));
            });
        stopTimer();

        return rows.map((token: ITokenSelectRow) => ({
            secret: token.secret,
            tokenName: token.token_name ? token.token_name : token.username,
            type: (token.type === ApiTokenType.BACKEND
                ? ApiTokenType.CLIENT
                : token.type
            ).toLowerCase() as ApiTokenType,
            project: ALL,
            projects: [ALL],
            environment: token.environment ? token.environment : ALL,
            expiresAt: token.expires_at,
            createdAt: token.created_at,
            alias: token.alias,
            seenAt: token.seen_at,
        }));
    }

    private makeTokenProjectQuery() {
        return this.db<ITokenRow>(`${TABLE} as tokens`)
            .leftJoin(
                `${API_LINK_TABLE} as token_project_link`,
                'tokens.secret',
                'token_project_link.secret',
            )
            .select(
                'tokens.secret',
                'username',
                'token_name',
                'type',
                'expires_at',
                'created_at',
                'alias',
                'seen_at',
                'environment',
                'token_project_link.project',
            );
    }

    async insert(newToken: IApiTokenCreate): Promise<IApiToken> {
        const response = await inTransaction(this.db, async (tx) => {
            const [row] = await tx<ITokenInsert>(TABLE).insert(
                toRow(newToken),
                ['created_at'],
            );

            const updateProjectTasks = (newToken.projects || [])
                .filter((project) => {
                    return project !== ALL_PROJECTS;
                })
                .map((project) => {
                    return tx.raw(
                        `INSERT INTO ${API_LINK_TABLE} VALUES (?, ?)`,
                        [newToken.secret, project],
                    );
                });
            await Promise.all(updateProjectTasks);
            return {
                ...newToken,
                alias: newToken.alias || null,
                project: newToken.projects?.join(',') || '*',
                createdAt: row.created_at,
            };
        });
        return response;
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
        const stopTimer = this.timer('get-by-secret');
        const row = await this.makeTokenProjectQuery().where(
            'tokens.secret',
            key,
        );
        stopTimer();
        return toTokens(row)[0];
    }

    async delete(secret: string): Promise<void> {
        return this.db<ITokenRow>(TABLE).where({ secret }).del();
    }

    async deleteAll(): Promise<void> {
        return this.db<ITokenRow>(TABLE).del();
    }

    async setExpiry(secret: string, expiresAt: Date): Promise<IApiToken> {
        const rows = await this.makeTokenProjectQuery()
            .update({ expires_at: expiresAt })
            .where({ secret })
            .returning('*');
        if (rows.length > 0) {
            return toTokens(rows)[0];
        }
        throw new NotFoundError('Could not find api-token.');
    }

    async markSeenAt(secrets: string[]): Promise<void> {
        const now = new Date();
        try {
            await this.db(TABLE)
                .whereIn('secret', secrets)
                .update({ seen_at: now });
        } catch (err) {
            this.logger.error('Could not update lastSeen, error: ', err);
        }
    }

    async countDeprecatedTokens(): Promise<{
        orphanedTokens: number;
        activeOrphanedTokens: number;
        legacyTokens: number;
        activeLegacyTokens: number;
    }> {
        const allLegacyCount = this.withTimer('allLegacyCount', () =>
            this.db<ITokenRow>(`${TABLE} as tokens`)
                .where('tokens.secret', 'NOT LIKE', '%:%')
                .count()
                .first()
                .then((res) => Number(res?.count) || 0),
        );

        const activeLegacyCount = this.withTimer('activeLegacyCount', () =>
            this.db<ITokenRow>(`${TABLE} as tokens`)
                .where('tokens.secret', 'NOT LIKE', '%:%')
                .andWhereRaw("tokens.seen_at > NOW() - INTERVAL '3 MONTH'")
                .count()
                .first()
                .then((res) => Number(res?.count) || 0),
        );

        const orphanedTokensQuery = this.db<ITokenRow>(`${TABLE} as tokens`)
            .leftJoin(
                `${API_LINK_TABLE} as token_project_link`,
                'tokens.secret',
                'token_project_link.secret',
            )
            .whereNull('token_project_link.project')
            .andWhere('tokens.secret', 'NOT LIKE', '*:%') // Exclude intentionally wildcard tokens
            .andWhere('tokens.secret', 'LIKE', '%:%') // Exclude legacy tokens
            .andWhere((builder) => {
                builder
                    .where('tokens.type', ApiTokenType.BACKEND)
                    .orWhere('tokens.type', ApiTokenType.CLIENT)
                    .orWhere('tokens.type', ApiTokenType.FRONTEND);
            });

        const allOrphanedCount = this.withTimer('allOrphanedCount', () =>
            orphanedTokensQuery
                .clone()
                .count()
                .first()
                .then((res) => Number(res?.count) || 0),
        );

        const activeOrphanedCount = this.withTimer('activeOrphanedCount', () =>
            orphanedTokensQuery
                .clone()
                .andWhereRaw("tokens.seen_at > NOW() - INTERVAL '3 MONTH'")
                .count()
                .first()
                .then((res) => Number(res?.count) || 0),
        );

        const [
            orphanedTokens,
            activeOrphanedTokens,
            legacyTokens,
            activeLegacyTokens,
        ] = await Promise.all([
            allOrphanedCount,
            activeOrphanedCount,
            allLegacyCount,
            activeLegacyCount,
        ]);

        return {
            orphanedTokens,
            activeOrphanedTokens,
            legacyTokens,
            activeLegacyTokens,
        };
    }

    async countProjectTokens(projectId: string): Promise<number> {
        const count = await this.db(API_LINK_TABLE)
            .where({ project: projectId })
            .count()
            .first();
        return Number(count?.count ?? 0);
    }
}

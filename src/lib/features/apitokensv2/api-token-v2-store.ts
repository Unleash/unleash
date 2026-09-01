import { subMinutes } from 'date-fns';

import type {
    ApiTokenV2,
    ApiTokenV2WithVerifier,
    CreateApiTokenV2,
    IApiTokenV2Store,
} from './api-token-v2-types.js';
import { ALL_PROJECTS } from '../../util/index.js';
import { ALL, isAllProjects } from '../../types/models/api-token.js';
import type { Db } from '../../db/db.js';
import { inTransaction } from '../../db/transaction.js';

const TABLE = 'api_tokens_v2';
const API_V2_LINK_TABLE = 'api_tokens_v2_project';

const CLEANUP_BATCH_SIZE = 1000;

const toToken = (row: any): Omit<ApiTokenV2, 'projects'> => ({
    selector: row.selector,
    tokenName: row.token_name,
    type: row.type,
    environment: row.environment,
    expiresAt: row.expires_at ?? undefined,
    createdAt: row.created_at,
    seenAt: row.seen_at ?? undefined,
    secure: true,
});

const toTokens = (rows: any[]): ApiTokenV2WithVerifier[] => {
    const tokens = rows.reduce(tokenRowReducer, {});
    return Object.values(tokens);
};

const tokenRowReducer = (acc, tokenRow) => {
    if (!acc[tokenRow.selector]) {
        acc[tokenRow.selector] = {
            ...toToken(tokenRow),
            verifier: tokenRow.verifier,
            projects: [ALL],
        };
    }
    const currentToken = acc[tokenRow.selector];
    if (tokenRow.project) {
        if (isAllProjects(currentToken.projects)) {
            currentToken.projects = [];
        }
        currentToken.projects.push(tokenRow.project);
    }
    return acc;
};

export class ApiTokenV2Store implements IApiTokenV2Store {
    constructor(private readonly db: Db) {}

    countUserCreatedTokens(): Promise<number> {
        return this.db(TABLE)
            .count('*')
            .where('user_created', true)
            .then((res) => Number(res[0].count));
    }

    async create(
        newApiToken: CreateApiTokenV2,
        selector: string,
        verifier: string,
    ): Promise<ApiTokenV2> {
        const response = await inTransaction(this.db, async (tx) => {
            const [row] = await tx(TABLE)
                .insert({
                    selector,
                    verifier,
                    token_name: newApiToken.tokenName,
                    type: newApiToken.type,
                    environment: newApiToken.environment,
                    expires_at: newApiToken.expiresAt,
                    user_created: newApiToken.userCreated,
                })
                .returning('*');
            const updateProjectTask = newApiToken.projects
                .filter((project) => {
                    return project !== ALL_PROJECTS;
                })
                .map((project) => {
                    return tx.raw(
                        `INSERT INTO ${API_V2_LINK_TABLE}
                         VALUES (?, ?)`,
                        [selector, project],
                    );
                });
            await Promise.all(updateProjectTask);
            return { projects: newApiToken.projects, ...toToken(row) };
        });
        return response;
    }

    private makeTokenProjectQuery() {
        return this.db(`${TABLE} as tokens`)
            .leftJoin(
                `${API_V2_LINK_TABLE} as token_project_link`,
                'tokens.selector',
                'token_project_link.selector',
            )
            .select(
                'tokens.selector as selector',
                'tokens.verifier as verifier',
                'tokens.token_name as token_name',
                'tokens.environment as environment',
                `token_project_link.project as project`,
                'tokens.type as type',
                'tokens.expires_at as expires_at',
                'tokens.created_at as created_at',
                'tokens.seen_at as seen_at',
            );
    }

    async getBySelector(
        selector: string,
    ): Promise<ApiTokenV2WithVerifier | undefined> {
        const sql = this.makeTokenProjectQuery().where(
            'tokens.selector',
            selector,
        );
        const rows = await sql;
        return toTokens(rows)[0];
    }

    async getAllActive(): Promise<ApiTokenV2WithVerifier[]> {
        const rows = await this.makeTokenProjectQuery().where((builder) =>
            builder
                .whereNull('tokens.expires_at')
                .orWhere('tokens.expires_at', '>', 'now()'),
        );
        return toTokens(rows);
    }

    async getUserDefinedTokens(): Promise<ApiTokenV2[]> {
        const rows = await this.makeTokenProjectQuery().where(
            'user_created',
            true,
        );
        return toTokens(rows);
    }

    async setExpiry(
        selector: string,
        expiresAt: Date,
    ): Promise<ApiTokenV2 | undefined> {
        await this.db(TABLE)
            .where({ selector })
            .update({ expires_at: expiresAt });
        return this.getBySelector(selector);
    }

    async delete(selector: string): Promise<void> {
        await this.db(TABLE).where({ selector }).delete();
    }

    async deleteByEnvironment(environment: string): Promise<ApiTokenV2[]> {
        const rows = await this.makeTokenProjectQuery().where(
            'tokens.environment',
            environment,
        );
        const tokens = toTokens(rows).map(
            ({ verifier: _verifier, ...token }) => token,
        );

        await this.db(TABLE).where({ environment }).delete();
        return tokens;
    }

    async markSeenAt(selector: string): Promise<void> {
        await this.db(TABLE)
            .where({ selector })
            .update({ seen_at: new Date() });
    }

    /**
     * First run pulls a bounded backlog in 1 transaction, the rest on subsequent runs.
     */
    async deleteSystemCreatedTokensNotSeen(
        minutesSinceLastSeen: number,
    ): Promise<Omit<ApiTokenV2, 'projects'>[]> {
        const cutoff = subMinutes(new Date(), minutesSinceLastSeen);

        const deleted = await this.db(TABLE)
            .whereIn(
                'selector',
                this.db(TABLE)
                    .select('selector')
                    .where('user_created', false)
                    .andWhere('seen_at', '<', cutoff)
                    .limit(CLEANUP_BATCH_SIZE),
            )
            .delete()
            // without the verifier
            .returning([
                'selector',
                'token_name',
                'type',
                'environment',
                'expires_at',
                'created_at',
                'seen_at',
            ]);

        return deleted.map(toToken);
    }
}

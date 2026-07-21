import type { Db } from '../../db/db.js';
import type {
    ApiTokenV2,
    CreateApiTokenV2,
    IApiTokenV2Store,
} from './api-token-v2-types.js';
import { inTransaction } from '../../db/transaction.js';
import { ALL_PROJECTS } from '../../util/index.js';
import { ALL, isAllProjects } from '../../types/models/api-token.js';

const TABLE = 'api_tokens_v2';
const API_V2_LINK_TABLE = 'api_tokens_v2_project';

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

const toTokens = (rows: any[]): (ApiTokenV2 & { verifier: string })[] => {
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

    count(): Promise<number> {
        return this.db(TABLE)
            .count('*')
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
    ): Promise<(ApiTokenV2 & { verifier: string }) | undefined> {
        const sql = this.makeTokenProjectQuery().where(
            'tokens.selector',
            selector,
        );
        const rows = await sql;
        return toTokens(rows)[0];
    }

    async getUserDefinedTokens(): Promise<ApiTokenV2[]> {
        const rows = await this.makeTokenProjectQuery();
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

    async markSeenAt(selector: string): Promise<void> {
        await this.db(TABLE)
            .where({ selector })
            .update({ seen_at: new Date() });
    }
}

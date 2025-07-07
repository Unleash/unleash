import type { IApiTokenStore } from '../../lib/types/stores/api-token-store.js';
import type {
    ApiTokenType,
    IApiToken,
    IApiTokenCreate,
} from '../../lib/types/model.js';

import EventEmitter from 'events';

export default class FakeApiTokenStore
    extends EventEmitter
    implements IApiTokenStore
{
    countByType(): Promise<Map<ApiTokenType, number>> {
        return Promise.resolve(new Map());
    }
    tokens: IApiToken[] = [];

    async delete(key: string): Promise<void> {
        this.tokens.splice(
            this.tokens.findIndex((t) => t.secret === key),
            1,
        );
    }

    async count(): Promise<number> {
        return this.tokens.length;
    }

    async deleteAll(): Promise<void> {
        this.tokens = [];
    }

    destroy(): void {}

    async exists(key: string): Promise<boolean> {
        return this.tokens.some((token) => token.secret === key);
    }

    async get(key: string): Promise<IApiToken | undefined> {
        const found = this.tokens.find((t) => t.secret === key);
        // clone the object to get a copy
        return found ? { ...found } : undefined;
    }

    async getAll(): Promise<IApiToken[]> {
        return this.tokens;
    }

    async getAllActive(): Promise<IApiToken[]> {
        return this.tokens.filter(
            (token) => !token.expiresAt || token.expiresAt > new Date(),
        );
    }

    async insert(newToken: IApiTokenCreate): Promise<IApiToken> {
        const apiToken = {
            createdAt: new Date(),
            project: newToken.projects?.join(',') || '*',
            alias: null,
            ...newToken,
        };
        this.tokens.push(apiToken);
        this.emit('insert');
        return apiToken;
    }

    async markSeenAt(secrets: string[]): Promise<void> {
        this.tokens
            .filter((t) => secrets.includes(t.secret))
            .forEach((t) => {
                // eslint-disable-next-line no-param-reassign
                t.seenAt = new Date();
            });
    }

    async setExpiry(
        secret: string,
        expiresAt: Date,
    ): Promise<IApiToken | undefined> {
        const found = this.tokens.find((t) => t.secret === secret);
        if (!found) {
            return undefined;
        }
        found.expiresAt = expiresAt;
        return found;
    }

    async countDeprecatedTokens(): Promise<{
        orphanedTokens: number;
        activeOrphanedTokens: number;
        legacyTokens: number;
        activeLegacyTokens: number;
    }> {
        return {
            orphanedTokens: 0,
            activeOrphanedTokens: 0,
            legacyTokens: 0,
            activeLegacyTokens: 0,
        };
    }

    async countProjectTokens(): Promise<number> {
        return 0;
    }
}

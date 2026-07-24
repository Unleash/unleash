import type {
    ApiTokenV2,
    CreateApiTokenV2,
    IApiTokenV2Store,
} from './api-token-v2-types.js';

export class FakeApiTokenV2Store implements IApiTokenV2Store {
    private readonly tokens = new Map<
        string,
        ApiTokenV2 & { verifier: string }
    >();

    count(): Promise<number> {
        return Promise.resolve(this.tokens.size);
    }

    async create(
        token: CreateApiTokenV2,
        selector: string,
        verifier: string,
    ): Promise<ApiTokenV2> {
        const createdAt = new Date();
        const created = {
            ...token,
            selector,
            verifier,
            createdAt,
            secure: true,
        };
        this.tokens.set(selector, created);
        const { verifier: _verifier, ...publicToken } = created;
        return publicToken;
    }

    async deleteSystemCreatedTokensNotSeen(
        minutesSinceLastSeen: number,
    ): Promise<void> {
        return Promise.resolve();
    }

    async getBySelector(selector: string) {
        return this.tokens.get(selector);
    }

    async getUserDefinedTokens(): Promise<ApiTokenV2[]> {
        return [...this.tokens.values()].map(
            ({ verifier: _verifier, ...token }) => token,
        );
    }

    async setExpiry(
        selector: string,
        expiresAt: Date,
    ): Promise<ApiTokenV2 | undefined> {
        const token = this.tokens.get(selector);
        if (!token) {
            return undefined;
        }
        token.expiresAt = expiresAt;
        const { verifier: _verifier, ...updated } = token;
        return updated;
    }

    async delete(selector: string): Promise<void> {
        this.tokens.delete(selector);
    }

    async markSeenAt(selector: string): Promise<void> {
        const token = this.tokens.get(selector);
        if (token) {
            token.seenAt = new Date();
        }
    }
}

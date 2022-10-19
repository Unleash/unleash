import { IPublicSignupTokenStore } from '../../lib/types/stores/public-signup-token-store';
import { PublicSignupTokenSchema } from '../../lib/openapi/spec/public-signup-token-schema';
import { IPublicSignupTokenCreate } from '../../lib/types/models/public-signup-token';

export default class FakePublicSignupStore implements IPublicSignupTokenStore {
    tokens: PublicSignupTokenSchema[] = [];

    async addTokenUser(secret: string, userId: number): Promise<void> {
        this.get(secret).then((token) => token.users.push({ id: userId }));
        return Promise.resolve();
    }

    async get(secret: string): Promise<PublicSignupTokenSchema> {
        const token = this.tokens.find((t) => t.secret === secret);
        return Promise.resolve(token);
    }

    async isValid(secret: string): Promise<boolean> {
        const token = this.tokens.find((t) => t.secret === secret);
        return Promise.resolve(
            token && new Date(token.expiresAt) > new Date() && token.enabled,
        );
    }

    async count(): Promise<number> {
        return Promise.resolve(0);
    }

    // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
    async delete(secret: string): Promise<void> {
        return Promise.resolve(undefined);
    }

    async getAllActive(): Promise<PublicSignupTokenSchema[]> {
        return Promise.resolve(this.tokens);
    }

    async create(
        newToken: IPublicSignupTokenCreate,
    ): Promise<PublicSignupTokenSchema> {
        return this.insert(newToken);
    }

    async insert(
        newToken: IPublicSignupTokenCreate,
    ): Promise<PublicSignupTokenSchema> {
        const token = {
            secret: 'some-secret',
            expiresAt: newToken.expiresAt.toISOString(),
            createdAt: new Date().toISOString(),
            users: [],
            url: 'some=url',
            name: newToken.name,
            role: {
                name: 'Viewer',
                type: '',
                id: 1,
            },
            enabled: true,
            createdBy: newToken.createdBy,
        };
        this.tokens.push(token);
        return Promise.resolve(token);
    }

    async update(
        secret: string,
        { expiresAt, enabled }: { expiresAt?: Date; enabled?: boolean },
    ): Promise<PublicSignupTokenSchema> {
        const token = await this.get(secret);
        if (expiresAt) {
            token.expiresAt = expiresAt.toISOString();
        }
        if (enabled !== undefined) {
            token.enabled = enabled;
        }
        const index = this.tokens.findIndex((t) => t.secret === secret);
        this.tokens[index] = token;
        return Promise.resolve(token);
    }

    async deleteAll(): Promise<void> {
        return Promise.resolve(undefined);
    }

    destroy(): void {}

    async exists(key: string): Promise<boolean> {
        return this.tokens.some((t) => t.secret === key);
    }

    // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
    async getAll(query?: Object): Promise<PublicSignupTokenSchema[]> {
        return Promise.resolve(this.tokens);
    }
}

import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ApiTokenType } from '../../types/model.js';
import { SYSTEM_USER_AUDIT } from '../../types/index.js';
import type EventService from '../events/event-service.js';
import type {
    ApiTokenV2,
    ApiTokenV2WithVerifier,
    CreateApiTokenV2,
    IApiTokenV2Store,
} from './api-token-v2-types.js';
import {
    AuthorizationTokenKind,
    type ApiTokenV2Credential,
} from '../../authentication/authorization-token.js';
import FakeEnvironmentStore from '../project-environments/fake-environment-store.js';
import { createFakeApiTokenV2Service } from './api-token-v2-service.js';
import {
    ApiTokenDeletedEvent,
    createTestConfig,
    type IUnleashStores,
} from '../../server-impl.js';
import type { IFlagResolver } from '../../types/experimental.js';

class FakeApiTokenV2Store implements IApiTokenV2Store {
    stored?: ApiTokenV2WithVerifier;
    markedSeen = false;
    getBySelectorCalls = 0;

    // when true, the cleanup reaps stored the way the real query would
    reapStoredToken = false;

    async create(
        token: CreateApiTokenV2,
        selector: string,
        verifier: string,
    ): Promise<ApiTokenV2> {
        this.stored = {
            ...token,
            selector,
            verifier,
            createdAt: new Date(),
            secure: true,
        };
        const { verifier: _verifier, ...publicToken } = this.stored;
        return publicToken;
    }

    countUserCreatedTokens(): Promise<number> {
        if (this.stored) {
            return Promise.resolve(1);
        } else {
            return Promise.resolve(0);
        }
    }

    async getBySelector(selector: string) {
        this.getBySelectorCalls += 1;
        return this.stored?.selector === selector ? this.stored : undefined;
    }

    async getAllActive(): Promise<ApiTokenV2WithVerifier[]> {
        return this.stored ? [this.stored] : [];
    }

    async getUserDefinedTokens(): Promise<ApiTokenV2[]> {
        if (!this.stored) {
            return [];
        }
        const { verifier: _verifier, ...token } = this.stored;
        return [token];
    }

    async setExpiry(
        selector: string,
        expiresAt: Date,
    ): Promise<ApiTokenV2 | undefined> {
        if (!this.stored || this.stored.selector !== selector) {
            return undefined;
        }
        this.stored.expiresAt = expiresAt;
        const { verifier: _verifier, ...token } = this.stored;
        return token;
    }

    async delete(selector: string): Promise<void> {
        if (this.stored?.selector === selector) {
            this.stored = undefined;
        }
    }

    async deleteByEnvironment(environment: string): Promise<ApiTokenV2[]> {
        if (!this.stored || this.stored.environment !== environment) {
            return [];
        }
        const { verifier: _verifier, ...token } = this.stored;
        this.stored = undefined;
        return [token];
    }

    async markSeenAt(): Promise<void> {
        this.markedSeen = true;
    }

    async deleteSystemCreatedTokensNotSeen(
        _minutesSinceLastSeen: number,
    ): Promise<Omit<ApiTokenV2, 'projects'>[]> {
        if (!this.reapStoredToken || !this.stored) {
            return [];
        }
        const { verifier: _verifier, ...token } = this.stored;
        this.stored = undefined;
        return [token];
    }
}

const tokenInput: CreateApiTokenV2 = {
    tokenName: 'backend token',
    type: ApiTokenType.BACKEND,
    projects: ['default'],
    environment: 'production',
    userCreated: true,
};

let currentUsePromiseTokenCache = false;

const createService = (stores?: Partial<IUnleashStores>) => {
    const eventService = {
        storeEvent: vi.fn(),
        storeEvents: vi.fn(),
        storeEventsOrThrow: vi.fn(),
    } as unknown as EventService;
    const config = {
        ...createTestConfig(),
        flagResolver: {
            isEnabled: (flag) =>
                flag === 'usePromiseTokenCache'
                    ? currentUsePromiseTokenCache
                    : true,
        } as IFlagResolver,
    };
    return {
        eventService,
        service: createFakeApiTokenV2Service(config, stores, {
            eventService,
        }),
    };
};

describe.each([
    false,
    true,
])('ApiTokenV2Service (usePromiseTokenCache=%s)', (usePromiseTokenCache) => {
    beforeEach(() => {
        currentUsePromiseTokenCache = usePromiseTokenCache;
    });
    test('stores a verifier rather than the generated credential', async () => {
        const apiTokenV2Store = new FakeApiTokenV2Store();
        const environmentStore = new FakeEnvironmentStore();
        await environmentStore.create({
            enabled: true,
            protected: false,
            sortOrder: 0,
            type: 'production',
            name: 'production',
        });
        const { service } = createService({
            environmentStore,
            apiTokenV2Store,
        });

        const token = await service.create(tokenInput, SYSTEM_USER_AUDIT);

        expect(token.secret).toMatch(
            /\.v2_([A-Za-z0-9_-]{22})_[A-Za-z0-9_-]{43}$/,
        );
        expect(apiTokenV2Store.stored?.verifier).not.toBe(token.secret);
        expect(apiTokenV2Store.stored).not.toHaveProperty('secret');
        expect(apiTokenV2Store.stored?.selector).toBe(token.selector);
    });

    test('drops cleaned up tokens from the cache', async () => {
        const apiTokenV2Store = new FakeApiTokenV2Store();
        const environmentStore = new FakeEnvironmentStore();
        await environmentStore.create({
            enabled: true,
            protected: false,
            sortOrder: 0,
            type: 'production',
            name: 'production',
        });
        const { service } = createService({
            environmentStore,
            apiTokenV2Store,
        });
        const token = await service.create(tokenInput, SYSTEM_USER_AUDIT);
        await service.fetchActiveTokens(); // the token is now cached
        apiTokenV2Store.reapStoredToken = true;

        // The scheduler runs the delete inside a transaction and then tells
        const deleted = await service.deleteSystemCreatedTokensNotSeen();
        service.invalidateCache(deleted.map((token) => token.selector));

        // Without that the token keeps authenticating from memory even though
        // its row is gone, until the next refresh a minute later.
        await expect(
            service.getTokenWithCache({
                kind: AuthorizationTokenKind.API_TOKEN,
                version: 'v2',
                secret: token.secret,
                selector: token.selector,
            } as ApiTokenV2Credential),
        ).resolves.toBeUndefined();
    });

    test('authenticates with one selector lookup and a verifier comparison', async () => {
        const apiTokenV2Store = new FakeApiTokenV2Store();
        const environmentStore = new FakeEnvironmentStore();
        await environmentStore.create({
            enabled: true,
            protected: false,
            sortOrder: 0,
            type: 'production',
            name: 'production',
        });
        const { service } = createService({
            environmentStore,
            apiTokenV2Store,
        });
        const token = await service.create(tokenInput, SYSTEM_USER_AUDIT);
        const user = await service.getUserForToken({
            kind: AuthorizationTokenKind.API_TOKEN,
            version: 'v2',
            secret: token.secret,
            selector: token.selector,
        });

        expect(user).toMatchObject({
            username: 'backend token',
            projects: ['default'],
            environment: 'production',
            secret: token.selector,
        });
        expect(apiTokenV2Store.markedSeen).toBe(true);
    });

    test('rejects an altered credential without marking it as seen', async () => {
        const apiTokenV2Store = new FakeApiTokenV2Store();
        const environmentStore = new FakeEnvironmentStore();
        await environmentStore.create({
            enabled: true,
            protected: false,
            sortOrder: 0,
            type: 'production',
            name: 'production',
        });
        const { service } = createService({
            environmentStore,
            apiTokenV2Store,
        });
        const token = await service.create(tokenInput, SYSTEM_USER_AUDIT);
        const altered = `${token.secret.slice(0, -1)}x`;
        await expect(
            service.getUserForToken({
                kind: AuthorizationTokenKind.API_TOKEN,
                version: 'v2',
                secret: altered,
                selector: token.selector,
            }),
        ).resolves.toBeUndefined();
        expect(apiTokenV2Store.markedSeen).toBe(false);
    });

    test('rejects an altered credential in the token cache', async () => {
        const apiTokenV2Store = new FakeApiTokenV2Store();
        const environmentStore = new FakeEnvironmentStore();
        await environmentStore.create({
            enabled: true,
            protected: false,
            sortOrder: 0,
            type: 'production',
            name: 'production',
        });
        const { service } = createService({
            environmentStore,
            apiTokenV2Store,
        });
        const token = await service.create(tokenInput, SYSTEM_USER_AUDIT);
        const credential: ApiTokenV2Credential = {
            kind: AuthorizationTokenKind.API_TOKEN,
            version: 'v2' as const,
            secret: token.secret,
            selector: token.selector,
        };

        await expect(
            service.getTokenWithCache(credential),
        ).resolves.toMatchObject({
            secret: token.selector,
        });

        await expect(
            service.getTokenWithCache({
                ...credential,
                secret: `${token.secret.slice(0, -1)}x`,
            }),
        ).resolves.toBeUndefined();
        expect(apiTokenV2Store.getBySelectorCalls).toBe(1);
    });

    test('periodic refresh only warms the legacy cache', async () => {
        const apiTokenV2Store = new FakeApiTokenV2Store();
        const environmentStore = new FakeEnvironmentStore();
        await environmentStore.create({
            enabled: true,
            protected: false,
            sortOrder: 0,
            type: 'production',
            name: 'production',
        });
        const { service } = createService({
            environmentStore,
            apiTokenV2Store,
        });
        const token = await service.create(tokenInput, SYSTEM_USER_AUDIT);

        await service.fetchActiveTokens();

        await expect(
            service.getTokenWithCache({
                kind: AuthorizationTokenKind.API_TOKEN,
                version: 'v2',
                secret: token.secret,
                selector: token.selector,
            }),
        ).resolves.toMatchObject({ secret: token.selector });
        expect(apiTokenV2Store.getBySelectorCalls).toBe(
            usePromiseTokenCache ? 1 : 0,
        );
    });

    test('periodic refresh only evicts from the legacy cache', async () => {
        const apiTokenV2Store = new FakeApiTokenV2Store();
        const environmentStore = new FakeEnvironmentStore();
        await environmentStore.create({
            enabled: true,
            protected: false,
            sortOrder: 0,
            type: 'production',
            name: 'production',
        });
        const { service } = createService({
            environmentStore,
            apiTokenV2Store,
        });
        const token = await service.create(tokenInput, SYSTEM_USER_AUDIT);
        const credential: ApiTokenV2Credential = {
            kind: AuthorizationTokenKind.API_TOKEN,
            version: 'v2',
            secret: token.secret,
            selector: token.selector,
        };

        await service.fetchActiveTokens();
        await expect(
            service.getTokenWithCache(credential),
        ).resolves.toBeDefined();

        await apiTokenV2Store.delete(token.selector);
        await service.fetchActiveTokens();

        if (usePromiseTokenCache) {
            await expect(
                service.getTokenWithCache(credential),
            ).resolves.toBeDefined();
        } else {
            await expect(
                service.getTokenWithCache(credential),
            ).resolves.toBeUndefined();
        }
    });

    test('rejects expired credentials', async () => {
        const apiTokenV2Store = new FakeApiTokenV2Store();
        const environmentStore = new FakeEnvironmentStore();
        await environmentStore.create({
            enabled: true,
            protected: false,
            sortOrder: 0,
            type: 'production',
            name: 'production',
        });
        const { service } = createService({
            environmentStore,
            apiTokenV2Store,
        });
        const token = await service.create(
            {
                ...tokenInput,
                expiresAt: new Date(Date.now() - 1_000),
            },
            SYSTEM_USER_AUDIT,
        );
        await expect(
            service.getUserForToken({
                kind: AuthorizationTokenKind.API_TOKEN,
                version: 'v2',
                secret: token.secret,
                selector: token.selector,
            }),
        ).resolves.toBeUndefined();
        await expect(
            service.getUserForToken({
                kind: AuthorizationTokenKind.API_TOKEN,
                version: 'v2',
                secret: token.secret,
                selector: token.selector,
            }),
        ).resolves.toBeUndefined();
        expect(apiTokenV2Store.getBySelectorCalls).toBe(1);
    });

    test('lists tokens using their selector as the management identifier', async () => {
        const environmentStore = new FakeEnvironmentStore();
        await environmentStore.create({
            enabled: true,
            protected: false,
            sortOrder: 0,
            type: 'production',
            name: 'production',
        });
        const { service } = createService({ environmentStore });
        const created = await service.create(tokenInput, SYSTEM_USER_AUDIT);

        const [token] = await service.getUserDefinedTokens();

        expect(token).toMatchObject({
            secret: created.selector,
            project: 'default',
            projects: ['default'],
        });
    });

    test('updates and deletes a token by selector', async () => {
        const environmentStore = new FakeEnvironmentStore();
        await environmentStore.create({
            enabled: true,
            protected: false,
            sortOrder: 0,
            type: 'production',
            name: 'production',
        });
        const { service, eventService } = createService({ environmentStore });
        const created = await service.create(tokenInput, SYSTEM_USER_AUDIT);
        const expiresAt = new Date(Date.now() + 60_000);
        const reference = {
            kind: AuthorizationTokenKind.API_TOKEN,
            version: 'v2',
            selector: created.selector,
        } as const;

        await service.updateExpiry(reference, expiresAt, SYSTEM_USER_AUDIT);
        expect((await service.getToken(reference))?.expiresAt).toEqual(
            expiresAt,
        );

        await service.delete(reference, SYSTEM_USER_AUDIT);
        await expect(service.getToken(reference)).resolves.toBeUndefined();
        expect(eventService.storeEventsOrThrow).toHaveBeenCalledTimes(3);
    });

    test('deletes environment tokens with selector-bearing events', async () => {
        const store = new FakeApiTokenV2Store();
        const environmentStore = new FakeEnvironmentStore();
        await environmentStore.create({
            enabled: true,
            protected: false,
            sortOrder: 0,
            type: 'production',
            name: 'production',
        });
        const { service, eventService } = createService({
            apiTokenV2Store: store,
            environmentStore,
        });
        const created = await service.create(tokenInput, SYSTEM_USER_AUDIT);

        const selectors = await service.deleteByEnvironment(
            'production',
            SYSTEM_USER_AUDIT,
        );

        expect(selectors).toEqual([created.selector]);
        expect(store.stored).toBeUndefined();
        const [events] = vi.mocked(eventService.storeEventsOrThrow).mock
            .calls[1];
        expect(events).toHaveLength(1);
        expect(events[0]).toBeInstanceOf(ApiTokenDeletedEvent);
        expect(events[0]).toMatchObject({
            preData: {
                selector: created.selector,
                tokenVersion: 2,
                environment: 'production',
            },
        });
    });

    test('leaves cache updates to the post-commit owner', async () => {
        const apiTokenV2Store = new FakeApiTokenV2Store();
        const environmentStore = new FakeEnvironmentStore();
        await environmentStore.create({
            enabled: true,
            protected: false,
            sortOrder: 0,
            type: 'production',
            name: 'production',
        });
        const { service } = createService({
            environmentStore,
            apiTokenV2Store,
        });
        const created = await service.create(tokenInput, SYSTEM_USER_AUDIT);
        const credential: ApiTokenV2Credential = {
            kind: AuthorizationTokenKind.API_TOKEN,
            version: 'v2' as const,
            secret: created.secret,
            selector: created.selector,
        };

        await expect(
            service.getTokenWithCache(credential),
        ).resolves.toMatchObject({
            secret: created.selector,
        });

        const updatedExpiry = new Date(Date.now() + 120_000);
        await service.updateExpiry(
            {
                kind: AuthorizationTokenKind.API_TOKEN,
                version: 'v2',
                selector: created.selector,
            },
            updatedExpiry,
            SYSTEM_USER_AUDIT,
        );

        await expect(
            service.getTokenWithCache(credential),
        ).resolves.toMatchObject({
            secret: created.selector,
        });
        expect(apiTokenV2Store.getBySelectorCalls).toBe(2);

        await service.delete(
            {
                kind: AuthorizationTokenKind.API_TOKEN,
                version: 'v2',
                selector: created.selector,
            },
            SYSTEM_USER_AUDIT,
        );
        await expect(
            service.getTokenWithCache(credential),
        ).resolves.toBeDefined();

        service.invalidateCache([created.selector]);
        await expect(
            service.getTokenWithCache(credential),
        ).resolves.toBeUndefined();
    });
});

test('serves cached tokens even after deletion in the backing store (until invalidated/evicted)', async () => {
    currentUsePromiseTokenCache = true;
    const apiTokenV2Store = new FakeApiTokenV2Store();
    const environmentStore = new FakeEnvironmentStore();
    await environmentStore.create({
        enabled: true,
        protected: false,
        sortOrder: 0,
        type: 'production',
        name: 'production',
    });
    const { service } = createService({
        environmentStore,
        apiTokenV2Store,
    });
    const token = await service.create(tokenInput, SYSTEM_USER_AUDIT);
    const credential: ApiTokenV2Credential = {
        kind: AuthorizationTokenKind.API_TOKEN,
        version: 'v2',
        secret: token.secret,
        selector: token.selector,
    };

    await expect(service.getTokenWithCache(credential)).resolves.toBeDefined();
    expect(apiTokenV2Store.getBySelectorCalls).toBe(1);

    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now + 31_000);
    await apiTokenV2Store.delete(token.selector);

    await expect(service.getTokenWithCache(credential)).resolves.toBeDefined();
    expect(apiTokenV2Store.getBySelectorCalls).toBe(1);
});

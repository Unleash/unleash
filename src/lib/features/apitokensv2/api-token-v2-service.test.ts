import { describe, expect, test, vi } from 'vitest';
import { ApiTokenType } from '../../types/model.js';
import {
    type IEnvironmentStore,
    SYSTEM_USER_AUDIT,
} from '../../types/index.js';
import type EventService from '../events/event-service.js';
import { ApiTokenV2Service } from './api-token-v2-service.js';
import type {
    ApiTokenV2,
    CreateApiTokenV2,
    IApiTokenV2Store,
} from './api-token-v2-types.js';
import type { ResourceLimitsService } from '../resource-limits/resource-limits-service.js';
import EventEmitter from 'events';
import FakeEnvironmentStore from '../project-environments/fake-environment-store.js';

class FakeApiTokenV2Store implements IApiTokenV2Store {
    stored?: ApiTokenV2 & { verifier: string };
    markedSeen = false;

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

    count(): Promise<number> {
        if (this.stored) {
            return Promise.resolve(1);
        } else {
            return Promise.resolve(0);
        }
    }

    async getBySelector(selector: string) {
        return this.stored?.selector === selector ? this.stored : undefined;
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

    async markSeenAt(): Promise<void> {
        this.markedSeen = true;
    }
}

const tokenInput: CreateApiTokenV2 = {
    tokenName: 'backend token',
    type: ApiTokenType.BACKEND,
    projects: ['default'],
    environment: 'production',
};

const createService = (
    store: FakeApiTokenV2Store,
    environmentStore: IEnvironmentStore,
) => {
    const eventService = {
        storeEvent: vi.fn(),
    } as unknown as EventService;
    const resourceLimitsService = {
        getResourceLimits: vi.fn().mockResolvedValue({ apiTokens: 50 }),
    } as unknown as ResourceLimitsService;
    return {
        eventService,
        service: new ApiTokenV2Service(
            { apiTokenV2Store: store, environmentStore },
            {
                eventBus: new EventEmitter(),
            },
            { eventService, resourceLimitsService },
        ),
    };
};

describe('ApiTokenV2Service', () => {
    test('stores a verifier rather than the generated credential', async () => {
        const store = new FakeApiTokenV2Store();
        const environmentStore = new FakeEnvironmentStore();
        await environmentStore.create({
            enabled: true,
            protected: false,
            sortOrder: 0,
            type: 'production',
            name: 'production',
        });
        const { service } = createService(store, environmentStore);

        const token = await service.create(tokenInput, SYSTEM_USER_AUDIT);

        expect(token.secret).toMatch(
            /\.v2_([A-Za-z0-9_-]{22})_[A-Za-z0-9_-]{43}$/,
        );
        expect(store.stored?.verifier).not.toBe(token.secret);
        expect(store.stored).not.toHaveProperty('secret');
        expect(store.stored?.selector).toBe(token.selector);
    });

    test('authenticates with one selector lookup and a verifier comparison', async () => {
        const store = new FakeApiTokenV2Store();
        const environmentStore = new FakeEnvironmentStore();
        await environmentStore.create({
            enabled: true,
            protected: false,
            sortOrder: 0,
            type: 'production',
            name: 'production',
        });
        const { service } = createService(store, environmentStore);
        const token = await service.create(tokenInput, SYSTEM_USER_AUDIT);

        const user = await service.getUserForToken(token.secret);

        expect(user).toMatchObject({
            username: 'backend token',
            projects: ['default'],
            environment: 'production',
            secret: token.selector,
        });
        expect(store.markedSeen).toBe(true);
    });

    test('rejects an altered credential without marking it as seen', async () => {
        const store = new FakeApiTokenV2Store();
        const environmentStore = new FakeEnvironmentStore();
        await environmentStore.create({
            enabled: true,
            protected: false,
            sortOrder: 0,
            type: 'production',
            name: 'production',
        });
        const { service } = createService(store, environmentStore);
        const token = await service.create(tokenInput, SYSTEM_USER_AUDIT);
        const altered = `${token.secret.slice(0, -1)}x`;

        await expect(service.getUserForToken(altered)).resolves.toBeUndefined();
        expect(store.markedSeen).toBe(false);
    });

    test('rejects expired credentials', async () => {
        const store = new FakeApiTokenV2Store();
        const environmentStore = new FakeEnvironmentStore();
        await environmentStore.create({
            enabled: true,
            protected: false,
            sortOrder: 0,
            type: 'production',
            name: 'production',
        });
        const { service } = createService(store, environmentStore);
        const token = await service.create(
            {
                ...tokenInput,
                expiresAt: new Date(Date.now() - 1_000),
            },
            SYSTEM_USER_AUDIT,
        );

        await expect(
            service.getUserForToken(token.secret),
        ).resolves.toBeUndefined();
    });

    test('lists tokens using their selector as the management identifier', async () => {
        const store = new FakeApiTokenV2Store();
        const environmentStore = new FakeEnvironmentStore();
        await environmentStore.create({
            enabled: true,
            protected: false,
            sortOrder: 0,
            type: 'production',
            name: 'production',
        });
        const { service } = createService(store, environmentStore);
        const created = await service.create(tokenInput, SYSTEM_USER_AUDIT);

        const [token] = await service.getUserDefinedTokens();

        expect(token).toMatchObject({
            secret: created.selector,
            project: 'default',
            projects: ['default'],
        });
    });

    test('updates and deletes a token by selector', async () => {
        const store = new FakeApiTokenV2Store();
        const environmentStore = new FakeEnvironmentStore();
        await environmentStore.create({
            enabled: true,
            protected: false,
            sortOrder: 0,
            type: 'production',
            name: 'production',
        });
        const { service, eventService } = createService(
            store,
            environmentStore,
        );
        const created = await service.create(tokenInput, SYSTEM_USER_AUDIT);
        const expiresAt = new Date(Date.now() + 60_000);

        await service.updateExpiry(
            created.selector,
            expiresAt,
            SYSTEM_USER_AUDIT,
        );
        expect((await service.getToken(created.selector))?.expiresAt).toEqual(
            expiresAt,
        );

        await service.delete(created.selector, SYSTEM_USER_AUDIT);
        await expect(
            service.getToken(created.selector),
        ).resolves.toBeUndefined();
        expect(eventService.storeEvent).toHaveBeenCalledTimes(3);
    });
});

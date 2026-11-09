import { addDays, addMinutes, subDays } from 'date-fns';
import { describe, expect, test, vi } from 'vitest';

import { ApiTokenType, type IApiTokenCreate } from '../../types/model.js';
import { createTestConfig } from '../../../test/config/test-config.js';
import { createFakeApiTokenService } from './createApiTokenService.js';
import { DEFAULT_ENV } from '../../util/index.js';
import { SYSTEM_USER_ID, TEST_AUDIT_USER } from '../../types/index.js';

const ENV = DEFAULT_ENV;

const insert = (
    store: { insert: Function },
    over: Partial<IApiTokenCreate> = {},
) =>
    store.insert(
        {
            environment: ENV,
            projects: ['*'],
            tokenName: 'a-token',
            type: ApiTokenType.CLIENT,
            secret: `default:${ENV}.aaaaaaaaaaaaaaaaaaaaaaaa`,
            ...over,
        } as IApiTokenCreate,
        SYSTEM_USER_ID,
    );

describe('api token lookup', () => {
    const setup = (getLogger?: any) => {
        const config = createTestConfig();
        if (getLogger) config.getLogger = getLogger;
        return createFakeApiTokenService(config);
    };

    test('resolves a token by its secret', async () => {
        const { apiTokenService, apiTokenStore } = setup();
        const secret = `default:${ENV}.the-secret`;
        await insert(apiTokenStore, { secret, tokenName: 'by-secret' });
        await apiTokenService.fetchActiveTokens();

        const found = await apiTokenService.getTokenWithCache(secret);

        expect(found?.tokenName).toBe('by-secret');
    });

    test('resolves a token by its legacy alias', async () => {
        const { apiTokenService, apiTokenStore } = setup();
        const secret = `default:${ENV}.real-secret`;
        const alias = `default:${ENV}.legacy-alias`;
        await insert(apiTokenStore, { secret, alias, tokenName: 'by-alias' });
        await apiTokenService.fetchActiveTokens();

        const found = await apiTokenService.getTokenWithCache(alias);

        // this is the case a hash index keyed solely on secret would silently break
        expect(found?.tokenName).toBe('by-alias');
    });

    test('returns undefined for a secret nobody issued', async () => {
        const { apiTokenService, apiTokenStore } = setup();
        await insert(apiTokenStore);
        await apiTokenService.fetchActiveTokens();

        await expect(
            apiTokenService.getTokenWithCache(`default:${ENV}.not-a-token`),
        ).resolves.toBeUndefined();
    });

    test('does not resolve an expired token', async () => {
        const { apiTokenService, apiTokenStore } = setup();
        const secret = `default:${ENV}.expired`;
        await insert(apiTokenStore, {
            secret,
            tokenName: 'expired',
            expiresAt: subDays(new Date(), 1),
        });
        await apiTokenService.fetchActiveTokens();

        await expect(
            apiTokenService.getTokenWithCache(secret),
        ).resolves.toBeUndefined();
    });

    test('stops resolving a token that expires while it is cached', async () => {
        const { apiTokenService, apiTokenStore } = setup();
        const secret = `default:${ENV}.expires-soon`;
        await insert(apiTokenStore, {
            secret,
            tokenName: 'expires-soon',
            expiresAt: addMinutes(new Date(), 1),
        });

        await apiTokenService.fetchActiveTokens(); // cached while still active

        expect(await apiTokenService.getTokenWithCache(secret)).toBeDefined();

        vi.useFakeTimers({ toFake: ['Date'] });

        try {
            vi.setSystemTime(addMinutes(new Date(), 2));

            await expect(
                apiTokenService.getTokenWithCache(secret),
            ).resolves.toBeUndefined();
        } finally {
            vi.useRealTimers();
        }
    });

    test('resolves a token that appeared after the last refresh', async () => {
        const { apiTokenService, apiTokenStore } = setup();
        await apiTokenService.fetchActiveTokens(); // cache is empty

        const secret = `default:${ENV}.created-later`;
        await insert(apiTokenStore, { secret, tokenName: 'created-later' });

        const found = await apiTokenService.getTokenWithCache(secret);

        expect(found?.tokenName).toBe('created-later');
    });

    test('a token found by read-through is indexed, not re-queried', async () => {
        const { apiTokenService, apiTokenStore } = setup();
        await apiTokenService.fetchActiveTokens();
        const secret = `default:${ENV}.read-through`;
        await insert(apiTokenStore, { secret, tokenName: 'read-through' });

        const get = vi.spyOn(apiTokenStore, 'get');
        await apiTokenService.getTokenWithCache(secret); // miss -> store
        await apiTokenService.getTokenWithCache(secret); // must be served in memory
        await apiTokenService.getTokenWithCache(secret);

        // the lookup still returns the right token, not hits the db on every request forever
        expect(get).toHaveBeenCalledTimes(1);
    });

    test('a token created through the service is usable immediately', async () => {
        const { apiTokenService, environmentStore } = setup();
        await environmentStore.create({
            name: ENV,
            enabled: true,
            sortOrder: 0,
            type: 'development',
        });

        const created = await apiTokenService.createApiTokenWithProjects(
            {
                environment: ENV,
                projects: ['*'],
                tokenName: 'fresh',
                type: ApiTokenType.CLIENT,
                expiresAt: addDays(new Date(), 1),
            },
            TEST_AUDIT_USER,
        );

        const found = await apiTokenService.getTokenWithCache(created.secret);

        expect(found?.tokenName).toBe('fresh');
    });

    test('a token removed from the store is gone after the next refresh', async () => {
        const { apiTokenService, apiTokenStore } = setup();
        const secret = `default:${ENV}.doomed`;
        await insert(apiTokenStore, { secret, tokenName: 'doomed' });
        await apiTokenService.fetchActiveTokens();
        expect(await apiTokenService.getTokenWithCache(secret)).toBeDefined();

        await apiTokenStore.delete(secret);
        await apiTokenService.fetchActiveTokens();

        // index is rebuilt wholesale, so a stale entry cannot survive
        await expect(
            apiTokenService.getTokenWithCache(secret),
        ).resolves.toBeUndefined();
    });
});

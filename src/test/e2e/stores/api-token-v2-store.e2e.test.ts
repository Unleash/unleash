import { subDays, subMinutes } from 'date-fns';
import { ApiTokenType } from '../../../lib/types/model.js';
import { DEFAULT_ENV } from '../../../lib/util/index.js';
import getLogger from '../../fixtures/no-logger.js';
import dbInit, { type ITestDb } from '../helpers/database-init.js';
import type { IApiTokenV2Store } from '../../../lib/features/apitokensv2/api-token-v2-types.js';

let db: ITestDb;
let store: IApiTokenV2Store;

const SEVEN_DAYS_IN_MINUTES = 7 * 24 * 60;

beforeAll(async () => {
    db = await dbInit('api_token_v2_store_serial', getLogger);
    store = db.stores.apiTokenV2Store;
});

afterAll(async () => {
    await db.destroy();
});

beforeEach(async () => {
    await db.rawDatabase('api_tokens_v2').delete();
});

/**
 * Inserted directly rather than through the store so `seen_at` and
 * `user_created` can be set precisely - the store's create() does not take them.
 */
const insertToken = async (overrides: {
    selector: string;
    userCreated: boolean;
    seenAt: Date | null;
}) => {
    await db.rawDatabase('api_tokens_v2').insert({
        selector: overrides.selector,
        verifier: `verifier-for-${overrides.selector}`,
        token_name: `token-${overrides.selector}`,
        type: ApiTokenType.BACKEND,
        environment: DEFAULT_ENV,
        user_created: overrides.userCreated,
        seen_at: overrides.seenAt,
    });
};

const remainingSelectors = async (): Promise<string[]> => {
    const rows = await db
        .rawDatabase('api_tokens_v2')
        .select('selector')
        .orderBy('selector');
    return rows.map((row) => row.selector);
};

describe('API TOKENS V2 store cleanup', () => {
    test('deletes unseen system tokens and keeps everything else', async () => {
        await insertToken({
            selector: 'stale-system',
            userCreated: false,
            seenAt: subDays(new Date(), 30),
        });
        await insertToken({
            selector: 'fresh-system',
            userCreated: false,
            seenAt: subMinutes(new Date(), 5),
        });
        await insertToken({
            selector: 'stale-user',
            userCreated: true,
            seenAt: subDays(new Date(), 30),
        });

        const deleted = await store.deleteSystemCreatedTokensNotSeen(
            SEVEN_DAYS_IN_MINUTES,
        );

        expect(deleted.map((token) => token.selector)).toEqual([
            'stale-system',
        ]);
        expect(await remainingSelectors()).toEqual([
            'fresh-system',
            'stale-user',
        ]);
    });

    test('never returns the verifier', async () => {
        await insertToken({
            selector: 'stale-system',
            userCreated: false,
            seenAt: subDays(new Date(), 30),
        });

        const deleted = await store.deleteSystemCreatedTokensNotSeen(
            SEVEN_DAYS_IN_MINUTES,
        );

        expect(deleted[0]).not.toHaveProperty('verifier');
        expect(JSON.stringify(deleted[0])).not.toContain('verifier-for');
    });

    test('a run is bounded, and the remainder drains on the next run', async () => {
        const total = 1001;
        await db.rawDatabase('api_tokens_v2').insert(
            Array.from({ length: total }, (_, i) => ({
                selector: `bulk-${String(i).padStart(4, '0')}`,
                verifier: 'v',
                token_name: `bulk-${i}`,
                type: ApiTokenType.BACKEND,
                environment: DEFAULT_ENV,
                user_created: false,
                seen_at: subDays(new Date(), 30),
            })),
        );

        const first = await store.deleteSystemCreatedTokensNotSeen(
            SEVEN_DAYS_IN_MINUTES,
        );
        expect(first).toHaveLength(1000);
        expect(await remainingSelectors()).toHaveLength(1);

        const second = await store.deleteSystemCreatedTokensNotSeen(
            SEVEN_DAYS_IN_MINUTES,
        );
        expect(second).toHaveLength(1);
        expect(await remainingSelectors()).toHaveLength(0);
    });
});

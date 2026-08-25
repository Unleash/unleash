import { subDays } from 'date-fns';
import { ApiTokenType } from '../../../lib/types/model.js';
import { DEFAULT_ENV } from '../../../lib/util/index.js';
import getLogger from '../../fixtures/no-logger.js';
import dbInit, { type ITestDb } from '../helpers/database-init.js';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../helpers/test-helper.js';

let db: ITestDb;
let app: IUnleashTest;

beforeAll(async () => {
    db = await dbInit('api_token_v2_cleanup_serial', getLogger);
    app = await setupAppWithCustomConfig(
        db.stores,
        { experimental: { flags: { secureTokenStorage: true } } },
        db.rawDatabase,
    );
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

beforeEach(async () => {
    await db.rawDatabase('api_tokens_v2').delete();
    await db.rawDatabase('events').where('type', 'api-token-deleted').delete();
});

const insertStaleSystemToken = async (selector: string) => {
    await db.rawDatabase('api_tokens_v2').insert({
        selector,
        verifier: `verifier-for-${selector}`,
        token_name: `token-${selector}`,
        type: ApiTokenType.BACKEND,
        environment: DEFAULT_ENV,
        user_created: false,
        seen_at: subDays(new Date(), 30),
    });
};

const deletionEvents = async () =>
    db.rawDatabase('events').where('type', 'api-token-deleted').select('*');

const remainingSelectors = async (): Promise<string[]> => {
    const rows = await db.rawDatabase('api_tokens_v2').select('selector');
    return rows.map((row) => row.selector);
};

/** What the scheduler runs. */
const runCleanup = () =>
    app.services.transactionalApiTokenV2Service.transactional((service) =>
        service.deleteSystemCreatedTokensNotSeen(),
    );

describe('API TOKENS V2 cleanup', () => {
    test('writes one audit event per deleted token', async () => {
        await insertStaleSystemToken('stale-system');

        await runCleanup();

        const events = await deletionEvents();
        expect(events).toHaveLength(1);
        expect(events[0]).toMatchObject({
            created_by: 'unleash_system_user',
            created_by_user_id: -1337,
            environment: DEFAULT_ENV,
            // addons are notified by publishUnannouncedEvents() polling for
            // this, so a non-default here would silently stop them firing
            announced: false,
        });
        expect(events[0].pre_data).toMatchObject({
            tokenName: 'token-stale-system',
            type: ApiTokenType.BACKEND,
            environment: DEFAULT_ENV,
            secure: true,
        });
    });

    test('the audit event never carries the verifier', async () => {
        await insertStaleSystemToken('stale-system');

        await runCleanup();

        const [event] = await deletionEvents();
        expect(JSON.stringify(event)).not.toContain('verifier-for');
    });

    test('rolls the delete back when the audit write fails', async () => {
        await insertStaleSystemToken('stale-system');

        // Force the events insert to fail so the transaction has something to
        // roll back on. Without EventStore rethrowing, this would be swallowed
        // and the delete would commit with no audit trail.
        await db.rawDatabase.raw(
            `ALTER TABLE events ADD CONSTRAINT no_token_deletions
             CHECK (type <> 'api-token-deleted')`,
        );

        try {
            await expect(runCleanup()).rejects.toThrow();

            expect(await remainingSelectors()).toEqual(['stale-system']);
            expect(await deletionEvents()).toHaveLength(0);
        } finally {
            await db.rawDatabase.raw(
                `ALTER TABLE events DROP CONSTRAINT no_token_deletions`,
            );
        }
    });
});

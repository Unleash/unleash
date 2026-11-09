import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper.js';
import getLogger from '../../../fixtures/no-logger.js';

/**
 * Tests for "user-initiated only" events, via real HTTP stack:
 *
 *  - a user-initiated admin API request records its `User-Agent`
 *  - an event the same req produces under the system-audit-user does not
 *
 * Doing this by using an integration -> creates both user and system-audit-user events.
 */

const USER_AGENT = 'csoc-e2e/1.0 (audit-event-user-agent)';

let app: IUnleashTest;
let db: ITestDb;

const eventsByType = async (types: string[]) => {
    const rows = await db
        .rawDatabase('events')
        .select('type', 'user_agent')
        .whereIn('type', types)
        .orderBy('id', 'asc');

    const byType = Object.fromEntries(rows.map((row) => [row.type, row]));
    expect(Object.keys(byType).sort()).toEqual([...types].sort());

    return byType;
};

/**
 * Creating a Datadog integration so we get both from one req:
 * `AddonService.createAddon` stores `addon-config-created` with the caller's audit context,
 * then calls `addTagTypes`, which creates the provider's tag type under `SYSTEM_USER_AUDIT`.
 */
const datadogIntegration = {
    provider: 'datadog',
    enabled: true,
    parameters: { apiKey: 'not-a-real-key' },
    events: ['feature-created'],
};

beforeAll(async () => {
    db = await dbInit('audit_event_user_agent_serial', getLogger);
    app = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                    auditEventUserAgent: true,
                },
            },
        },
        // share test's database
        db.rawDatabase,
    );
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('records the user-agent on a user-initiated event, but not on a system one from the same request', async () => {
    await app.request
        .post('/api/admin/addons')
        .set('User-Agent', USER_AGENT)
        .send(datadogIntegration)
        .expect(201);

    const byType = await eventsByType([
        'addon-config-created',
        'tag-type-created',
    ]);

    // user-initiated: the request carried a user_agent and we kept it
    expect(byType['addon-config-created'].user_agent).toBe(USER_AGENT);

    // same request, but by system user, so no audit context -> "no user agent"
    expect(byType['tag-type-created'].user_agent).toBeNull();
});

test('records nothing when the client sends no user agent', async () => {
    await app.request
        .post('/api/admin/context')
        .unset('User-Agent')
        .set('Content-Type', 'application/json')
        .send({ name: 'ua-absent-context-field' })
        .expect(201);

    const byType = await eventsByType(['context-field-created']);

    expect(byType['context-field-created'].user_agent).toBeNull();
});

test('truncates an oversized user agent rather than rejecting the request', async () => {
    await app.request
        .post('/api/admin/context')
        .set('User-Agent', 'a'.repeat(10_000))
        .set('Content-Type', 'application/json')
        .send({ name: 'ua-oversized-context-field' })
        .expect(201);

    const [row] = await db
        .rawDatabase('events')
        .select('user_agent')
        .where('type', 'context-field-created')
        .orderBy('id', 'desc')
        .limit(1);

    expect(row.user_agent).toHaveLength(512);
});

test('every user-initiated admin API action carries the user agent, not just one endpoint', async () => {
    await app.request
        .post('/api/admin/tag-types')
        .set('User-Agent', USER_AGENT)
        .set('Content-Type', 'application/json')
        .send({ name: 'ua-breadth-tag-type', description: 'breadth check' })
        .expect(201);

    await app.request
        .post('/api/admin/projects/default/features')
        .set('User-Agent', USER_AGENT)
        .set('Content-Type', 'application/json')
        .send({ name: 'ua-breadth-flag' })
        .expect(201);

    const rows = await db
        .rawDatabase('events')
        .select('type')
        .whereIn('type', ['tag-type-created', 'feature-created'])
        .where('user_agent', USER_AGENT);

    expect(rows.map((row) => row.type).sort()).toEqual([
        'feature-created',
        'tag-type-created',
    ]);
});

test('stores no user agent at all while the flag is off', async () => {
    const experiments = (
        app.config.flagResolver as unknown as {
            experiments: { auditEventUserAgent: boolean };
        }
    ).experiments;
    const previous = experiments.auditEventUserAgent;
    experiments.auditEventUserAgent = false;

    try {
        await app.request
            .post('/api/admin/context')
            .set('User-Agent', USER_AGENT)
            .set('Content-Type', 'application/json')
            .send({ name: 'ua-flag-off-context-field' })
            .expect(201);

        const [row] = await db
            .rawDatabase('events')
            .select('user_agent')
            .where('type', 'context-field-created')
            .whereRaw("data->>'name' = ?", ['ua-flag-off-context-field']);

        expect(row.user_agent).toBeNull();
    } finally {
        experiments.auditEventUserAgent = previous;
    }
});

test('no event is stored with a user-agent', async () => {
    // absent must be null, everywhere, no exceptions
    const [{ count }] = await db
        .rawDatabase('events')
        .count('* as count')
        .whereIn('user_agent', ['', 'unknown', 'scheduled', 'n/a']);

    expect(Number(count)).toBe(0);
});

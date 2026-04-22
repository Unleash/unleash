import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../test/e2e/helpers/test-helper.js';
import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../test/fixtures/no-logger.js';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('release_agent', getLogger);
    app = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
                    releaseAgent: true,
                },
            },
        },
        db.rawDatabase,
    );
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

beforeEach(async () => {
    await db.rawDatabase.raw('DELETE FROM scheduled_actions');
    await db.rawDatabase.raw('DELETE FROM scheduled_sequences');
});

const sampleBody = () => ({
    project: 'default',
    environment: 'default',
    prompt: 'roll the flag gradually',
    model: 'claude-opus-4-7',
    agentVersion: '1.0.0',
    actions: [
        {
            featureName: 'flag-a',
            fireAt: new Date('2026-04-22T09:00:00Z').toISOString(),
            actionType: 'feature_environment.setEnabled',
            payload: { enabled: true },
        },
        {
            featureName: 'flag-a',
            fireAt: new Date('2026-04-22T09:30:00Z').toISOString(),
            actionType: 'strategy.create',
            payload: {
                strategyName: 'flexibleRollout',
                parameters: { rollout: '50' },
            },
        },
    ],
});

test('creates, lists, gets and cancels a scheduled sequence', async () => {
    const create = await app.request
        .post('/api/admin/release-agent/sequences')
        .send(sampleBody())
        .expect(201);

    const created = create.body;
    expect(created.id).toBeDefined();
    expect(created.status).toBe('active');
    expect(created.actions).toHaveLength(2);
    expect(created.actions[0].status).toBe('pending');

    const list = await app.request
        .get(
            '/api/admin/release-agent/sequences?project=default&environment=default',
        )
        .expect(200);
    expect(list.body.sequences).toHaveLength(1);
    expect(list.body.sequences[0].id).toBe(created.id);

    const get = await app.request
        .get(`/api/admin/release-agent/sequences/${created.id}`)
        .expect(200);
    expect(get.body.actions).toHaveLength(2);

    await app.request
        .delete(`/api/admin/release-agent/sequences/${created.id}`)
        .expect(204);

    const afterCancel = await app.request
        .get(`/api/admin/release-agent/sequences/${created.id}`)
        .expect(200);
    expect(afterCancel.body.status).toBe('cancelled');
    expect(
        afterCancel.body.actions.every((a: any) => a.status === 'skipped'),
    ).toBe(true);
});

test('returns 400 for a request with no actions', async () => {
    await app.request
        .post('/api/admin/release-agent/sequences')
        .send({ ...sampleBody(), actions: [] })
        .expect(400);
});

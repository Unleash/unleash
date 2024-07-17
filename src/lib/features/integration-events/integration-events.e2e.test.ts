import dbInit, { type ITestDb } from '../../../test/e2e/helpers/database-init';
import {
    type IUnleashTest,
    setupAppWithAuth,
} from '../../../test/e2e/helpers/test-helper';
import getLogger from '../../../test/fixtures/no-logger';
import { TEST_AUDIT_USER } from '../../types';
import type {
    IntegrationEventsStore,
    IntegrationEventWriteModel,
} from './integration-events-store';

let app: IUnleashTest;
let db: ITestDb;
let integrationEventsStore: IntegrationEventsStore;
let integrationId: number;

const EVENT_SUCCESS: IntegrationEventWriteModel = {
    integrationId: 1,
    state: 'success',
    stateDetails: 'Saul Goodman',
    event: {
        id: 7,
        type: 'feature-created',
        createdAt: new Date().toISOString(),
        createdBy: 'Walter White',
    },
    details: {
        featureName: 'heisenberg',
        projectName: 'breaking-bad',
    },
};

const EVENT_FAILED: IntegrationEventWriteModel = {
    ...EVENT_SUCCESS,
    state: 'failed',
    stateDetails: 'Better Call Saul!',
};

beforeAll(async () => {
    db = await dbInit('integration_events', getLogger);
    app = await setupAppWithAuth(
        db.stores,
        {
            experimental: {
                flags: {
                    integrationEvents: true,
                },
            },
        },
        db.rawDatabase,
    );
    integrationEventsStore = db.stores.integrationEventsStore;
});

beforeEach(async () => {
    await db.reset();

    const { id } = await app.services.addonService.createAddon(
        {
            provider: 'webhook',
            enabled: true,
            parameters: {
                url: 'http://some-test-url',
            },
            events: ['feature-created'],
        },
        TEST_AUDIT_USER,
    );

    integrationId = id;
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

const insertPastEvent = async (
    event: IntegrationEventWriteModel,
    date: Date,
): Promise<void> => {
    const { id } = await integrationEventsStore.insert(event);

    await db.rawDatabase.raw(
        `UPDATE integration_events SET created_at = ? WHERE id = ?`,
        [date, id],
    );
};

const getTestEventSuccess = () => ({
    ...EVENT_SUCCESS,
    integrationId,
});

const getTestEventFailed = () => ({
    ...EVENT_FAILED,
    integrationId,
});

test('insert and fetch integration events', async () => {
    await integrationEventsStore.insert(getTestEventSuccess());
    await integrationEventsStore.insert(getTestEventFailed());

    const events = await integrationEventsStore.getPaginatedEvents(
        integrationId,
        10,
        0,
    );

    expect(events).toHaveLength(2);
    expect(events[0].state).toBe('failed');
    expect(events[1].state).toBe('success');
});

test('paginate to latest event', async () => {
    await integrationEventsStore.insert(getTestEventSuccess());
    await integrationEventsStore.insert(getTestEventFailed());

    const events = await integrationEventsStore.getPaginatedEvents(
        integrationId,
        1,
        0,
    );

    expect(events).toHaveLength(1);
    expect(events[0].state).toBe('failed');
});

test('paginate to second most recent event', async () => {
    await integrationEventsStore.insert(getTestEventSuccess());
    await integrationEventsStore.insert(getTestEventFailed());

    const events = await integrationEventsStore.getPaginatedEvents(
        integrationId,
        1,
        1,
    );

    expect(events).toHaveLength(1);
    expect(events[0].state).toBe('success');
});

test('clean up events, keeping events from the last 2 hours', async () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const longTimeAgo = new Date('2000-01-01');

    await insertPastEvent(getTestEventSuccess(), threeHoursAgo);
    await insertPastEvent(getTestEventFailed(), twoDaysAgo);
    await insertPastEvent(getTestEventSuccess(), longTimeAgo);
    await insertPastEvent(getTestEventFailed(), oneHourAgo);
    await integrationEventsStore.insert(getTestEventSuccess());

    await integrationEventsStore.cleanUpEvents();

    const events = await integrationEventsStore.getPaginatedEvents(
        integrationId,
        10,
        0,
    );

    expect(events).toHaveLength(2);
    expect(events[0].state).toBe('success');
    expect(events[1].state).toBe('failed');
});

test('clean up events, keeping the last 100 events', async () => {
    for (let i = 0; i < 200; i++) {
        await integrationEventsStore.insert(getTestEventSuccess());
    }

    await integrationEventsStore.cleanUpEvents();

    const events = await integrationEventsStore.getPaginatedEvents(
        integrationId,
        200,
        0,
    );

    expect(events).toHaveLength(100);
});

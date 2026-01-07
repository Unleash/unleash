import { EventStore } from './event-store.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import { EVENTS_CREATED_BY_PROCESSED } from '../../metric-events.js';
import type { IUnleashConfig } from '../../types/index.js';
import { createTestConfig } from '../../../test/config/test-config.js';
import { createEventsService } from './createEventsService.js';
import EventEmitter from 'node:events';
import { DEFAULT_ENV } from '../../server-impl.js';

let db: ITestDb;

const _config: IUnleashConfig = createTestConfig();

beforeAll(async () => {
    db = await dbInit('events_test', getLogger);
});

afterAll(async () => {
    await db.rawDatabase('events').del();
    await db.rawDatabase('users').del();
    await db.destroy();
});

test('sets created_by_user_id on events with user username/email set as created_by', async () => {
    const store = new EventStore(db.rawDatabase, getLogger);

    await db.rawDatabase('users').insert({ username: 'test1' });
    await db.rawDatabase('events').insert({
        type: 'feature-created',
        created_by: 'test1',
        feature_name: 'feature1',
        data: `{"test": "data-migrate"}`,
    });

    await store.setCreatedByUserId(200);

    const user = await db
        .rawDatabase('users')
        .where({ username: 'test1' })
        .first('id');

    const events = await db.rawDatabase('events').select('*');
    const notSet = events.filter(
        (e) => !e.created_by_user_id && e.data.test === 'data-migrate',
    );
    const test1 = events.filter(
        (e) =>
            e.created_by_user_id === user.id && e.data.test === 'data-migrate',
    );
    expect(notSet).toHaveLength(0);
    expect(test1).toHaveLength(1);
});

test('sets created_by_user_id on a mix of events and created_bys', async () => {
    const store = new EventStore(db.rawDatabase, getLogger);

    await db.rawDatabase('users').insert({ username: 'test2' });

    await db.rawDatabase('api_tokens').insert({
        secret: 'token1',
        username: 'adm-token',
        type: 'admin',
        environment: DEFAULT_ENV,
        token_name: 'admin-token',
    });

    await db.rawDatabase('events').insert({
        type: 'feature-created',
        created_by: 'test2',
        feature_name: 'feature1',
        data: `{"test": "data-migrate"}`,
    });

    await db.rawDatabase('events').insert({
        type: 'strategy-created',
        created_by: 'migration',
        data: `{"test": "data-migrate"}`,
    });

    await db.rawDatabase('events').insert({
        type: 'api-token-created',
        created_by: 'init-api-tokens',
        data: `{"test": "data-migrate"}`,
    });

    await db.rawDatabase('events').insert({
        type: 'application-created',
        created_by: '::1',
        data: `{"test": "data-migrate"}`,
    });

    await db.rawDatabase('events').insert({
        type: 'feature-created',
        created_by: 'unknown',
        feature_name: 'feature2',
        data: `{"test": "data-migrate"}`,
    });

    await db.rawDatabase('events').insert({
        type: 'feature-created',
        created_by: 'adm-token',
        feature_name: 'feature3',
        data: `{"test": "data-migrate"}`,
    });

    await store.setCreatedByUserId(200);

    const user = await db
        .rawDatabase('users')
        .where({ username: 'test2' })
        .first('id');

    const events = await db.rawDatabase('events').select('*');
    const notSet = events.filter(
        (e) => !e.created_by_user_id && e.data.test === 'data-migrate',
    );
    const test = events.filter(
        (e) =>
            e.created_by_user_id === user.id && e.data.test === 'data-migrate',
    );
    expect(notSet).toHaveLength(1);
    expect(test).toHaveLength(1);
});

test('emits events with details on amount of updated rows', async () => {
    const _store = new EventStore(db.rawDatabase, getLogger);

    const _eventBus = new EventEmitter();
    const config = createTestConfig();
    const service = createEventsService(db.rawDatabase, config);
    let triggered = false;

    config.eventBus.on(EVENTS_CREATED_BY_PROCESSED, ({ updated }) => {
        expect(updated).toBe(2);
        triggered = true;
    });

    await db.rawDatabase('users').insert({ username: 'events-test-1' });
    await db.rawDatabase('events').insert({
        type: 'feature-created',
        created_by: 'events-test-1',
        feature_name: 'feature1',
    });
    await db.rawDatabase('events').insert({
        type: 'feature-created',
        created_by: 'events-test-1',
        feature_name: 'feature2',
    });
    await db.rawDatabase('events').insert({
        type: 'feature-created',
        created_by: 'doesnt-exist',
        feature_name: 'not-counted',
    });

    await service.setEventCreatedByUserId();

    expect(triggered).toBeTruthy();
});

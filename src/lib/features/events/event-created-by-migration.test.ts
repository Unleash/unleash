import EventStore from './event-store';
import getLogger from '../../../test/fixtures/no-logger';
import dbInit, { ITestDb } from '../../../test/e2e/helpers/database-init';

let db: ITestDb;

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
        feature_name: `feature1`,
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
        environment: 'default',
        token_name: 'admin-token',
    });

    await db.rawDatabase('events').insert({
        type: 'feature-created',
        created_by: 'test2',
        feature_name: `feature1`,
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
        feature_name: `feature2`,
        data: `{"test": "data-migrate"}`,
    });

    await db.rawDatabase('events').insert({
        type: 'feature-created',
        created_by: 'adm-token',
        feature_name: `feature3`,
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

import EventStore from './event-store.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import {
    USER_CREATED,
    USER_DELETED,
    USER_UPDATED,
} from '../../events/index.js';
import { EventSearchByType } from './event-search-by-type-read-model.js';

let db: ITestDb;
beforeAll(async () => {
    getLogger.setMuteError(true);
    db = await dbInit('event-search-by-type', getLogger);
});

afterAll(() => {
    getLogger.setMuteError(false);
});

test('Can read search events by type', async () => {
    const store = new EventStore(db.rawDatabase, getLogger);
    const readModel = new EventSearchByType(db.rawDatabase, getLogger);

    await store.store({
        type: USER_CREATED,
        createdBy: 'test',
        ip: '127.0.0.1',
        createdByUserId: 1,
    });

    const updatedEvents = await readModel.search({
        types: [USER_UPDATED],
        offset: 0,
        limit: 10,
    });
    expect(updatedEvents).toBeTruthy();
    expect(updatedEvents.length).toBe(0);

    const createdEvents = await readModel.search({
        types: [USER_CREATED],
        offset: 0,
        limit: 10,
    });
    expect(createdEvents).toBeTruthy();
    expect(createdEvents.length).toBe(1);
});

test('Events by type are sorted and can be paginated', async () => {
    const store = new EventStore(db.rawDatabase, getLogger);
    const readModel = new EventSearchByType(db.rawDatabase, getLogger);

    await store.store({
        type: USER_DELETED,
        data: { id: 1 },
        createdBy: 'test',
        ip: '127.0.0.1',
        createdByUserId: 1,
    });
    await store.store({
        type: USER_UPDATED,
        data: { id: 2 },
        createdBy: 'test',
        ip: '127.0.0.1',
        createdByUserId: 1,
    });
    await store.store({
        type: USER_DELETED,
        data: { id: 3 },
        createdBy: 'test',
        ip: '127.0.0.1',
        createdByUserId: 1,
    });

    const allEvents = await readModel.search({
        types: [USER_UPDATED, USER_DELETED],
        offset: 0,
        limit: 10,
    });
    expect(allEvents).toBeTruthy();
    expect(allEvents.length).toBe(3);

    const firstPage = await readModel.search({
        types: [USER_UPDATED, USER_DELETED],
        offset: 0,
        limit: 2,
    });
    expect(firstPage).toBeTruthy();
    expect(firstPage.length).toBe(2);

    const secondPage = await readModel.search({
        types: [USER_UPDATED, USER_DELETED],
        offset: 2,
        limit: 2,
    });
    expect(secondPage).toBeTruthy();
    expect(secondPage.length).toBe(1);
    expect(secondPage[0].type).toBe(USER_DELETED);
    expect(secondPage[0].data.id).toBe(3);

    const nonExistingPage = await readModel.search({
        types: [USER_UPDATED, USER_DELETED],
        offset: 4,
        limit: 2,
    });
    expect(nonExistingPage).toBeTruthy();
    expect(nonExistingPage.length).toBe(0);
});

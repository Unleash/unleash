import type { EventSearchQueryParameters } from '../../../../lib/openapi/spec/event-search-query-parameters';
import dbInit, { type ITestDb } from '../../helpers/database-init';

import { FEATURE_CREATED } from '../../../../lib/types';
import { EventService } from '../../../../lib/services';
import EventEmitter from 'events';
import getLogger from '../../../fixtures/no-logger';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper';

let app: IUnleashTest;
let db: ITestDb;
let eventService: EventService;
const TEST_USER_ID = -9999;

beforeAll(async () => {
    db = await dbInit('event_search', getLogger);
    app = await setupAppWithCustomConfig(db.stores, {
        experimental: {
            flags: {
                strictSchemaValidation: true,
            },
        },
    });

    eventService = new EventService(db.stores, {
        getLogger,
        eventBus: new EventEmitter(),
    });
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

beforeEach(async () => {
    await db.stores.featureToggleStore.deleteAll();
    await db.stores.segmentStore.deleteAll();
    await db.stores.eventStore.deleteAll();
});

const searchEvents = async (
    queryParams: EventSearchQueryParameters,
    expectedCode = 200,
) => {
    const query = new URLSearchParams(queryParams as any).toString();
    return app.request
        .get(`/api/admin/search/events?${query}`)
        .expect(expectedCode);
};

test('should search events by query', async () => {
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'something-else',
        data: { id: 'some-other-feature' },
        tags: [],
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'something-else',
        data: { id: 'my-other-feature' },
        tags: [],
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    const { body } = await searchEvents({ query: 'some-other-feature' });

    expect(body).toMatchObject({
        events: [
            {
                type: 'feature-created',
                data: {
                    id: 'some-other-feature',
                },
            },
        ],
        total: 1,
    });
});

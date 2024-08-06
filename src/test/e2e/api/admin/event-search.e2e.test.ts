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

test('should filter events by feature', async () => {
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        featureName: 'my_feature_a',
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        featureName: 'my_feature_b',
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    const { body } = await searchEvents({ feature: 'IS:my_feature_b' });

    expect(body).toMatchObject({
        events: [
            {
                type: 'feature-created',
                featureName: 'my_feature_b',
            },
        ],
        total: 1,
    });
});

test('should filter events by project', async () => {
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'another_project',
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    const { body } = await searchEvents({ project: 'IS:another_project' });

    expect(body).toMatchObject({
        events: [
            {
                type: 'feature-created',
                project: 'another_project',
            },
        ],
        total: 1,
    });
});

test('should filter events by type', async () => {
    await eventService.storeEvent({
        type: 'change-added',
        project: 'default',
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    await eventService.storeEvent({
        type: 'feature-created',
        project: 'default',
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    const { body } = await searchEvents({ type: 'IS:change-added' });

    expect(body).toMatchObject({
        events: [
            {
                type: 'change-added',
            },
        ],
        total: 1,
    });
});

test('should filter events by created by', async () => {
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        createdBy: 'admin1@example.com',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    await eventService.storeEvent({
        type: FEATURE_CREATED,
        createdBy: 'admin2@example.com',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    const { body } = await searchEvents({ createdBy: 'IS:admin2@example.com' });

    expect(body).toMatchObject({
        events: [
            {
                createdBy: 'admin2@example.com',
            },
        ],
        total: 1,
    });
});

test('should filter events by created date range', async () => {
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        data: { featureName: 'my_feature_a' },
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        data: { featureName: 'my_feature_b' },
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    const today = new Date();

    const { body } = await searchEvents({
        createdAtFrom: `IS:${today.toISOString().split('T')[0]}`,
    });

    expect(body).toMatchObject({
        events: [
            {
                type: FEATURE_CREATED,
                data: { featureName: 'my_feature_b' },
            },
            {
                type: FEATURE_CREATED,
                data: { featureName: 'my_feature_a' },
            },
        ],
        total: 2,
    });
});

test('should include dates created on the `to` date', async () => {
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        data: { featureName: 'my_feature_b' },
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    const today = new Date();

    const { body } = await searchEvents({
        createdAtTo: `IS:${today.toISOString().split('T')[0]}`,
    });

    expect(body).toMatchObject({
        events: [
            {
                type: FEATURE_CREATED,
                data: { featureName: 'my_feature_b' },
            },
        ],
        total: 1,
    });
});

test('should paginate with offset and limit', async () => {
    for (let i = 0; i < 5; i++) {
        await eventService.storeEvent({
            type: FEATURE_CREATED,
            project: 'default',
            data: { featureName: `my_feature_${i}` },
            createdBy: 'test-user',
            createdByUserId: TEST_USER_ID,
            ip: '127.0.0.1',
        });
    }

    const { body: secondPage } = await searchEvents({
        offset: '2',
        limit: '2',
    });

    expect(secondPage.events).toMatchObject([
        {
            data: { featureName: `my_feature_2` },
        },
        {
            data: { featureName: `my_feature_1` },
        },
    ]);
});

test('should filter events by feature using IS_ANY_OF', async () => {
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        featureName: 'my_feature_a',
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        featureName: 'my_feature_b',
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        featureName: 'my_feature_c',
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    const { body } = await searchEvents({
        feature: 'IS_ANY_OF:my_feature_a,my_feature_b',
    });

    expect(body).toMatchObject({
        events: [
            {
                type: 'feature-created',
                featureName: 'my_feature_b',
            },
            {
                type: 'feature-created',
                featureName: 'my_feature_a',
            },
        ],
        total: 2,
    });
});

test('should filter events by project using IS_ANY_OF', async () => {
    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'project_a',
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'project_b',
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'project_c',
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    const { body } = await searchEvents({
        project: 'IS_ANY_OF:project_a,project_b',
    });

    expect(body).toMatchObject({
        events: [
            {
                type: 'feature-created',
                project: 'project_b',
            },
            {
                type: 'feature-created',
                project: 'project_a',
            },
        ],
        total: 2,
    });
});

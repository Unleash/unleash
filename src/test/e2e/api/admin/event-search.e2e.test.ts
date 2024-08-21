import type { EventSearchQueryParameters } from '../../../../lib/openapi/spec/event-search-query-parameters';
import dbInit, { type ITestDb } from '../../helpers/database-init';

import {
    FEATURE_CREATED,
    type IUnleashConfig,
    type IUnleashStores,
    RoleName,
    USER_CREATED,
} from '../../../../lib/types';
import type { AccessService, EventService } from '../../../../lib/services';
import getLogger from '../../../fixtures/no-logger';
import { type IUnleashTest, setupAppWithAuth } from '../../helpers/test-helper';
import { createEventsService } from '../../../../lib/features';
import { createTestConfig } from '../../../config/test-config';
import type { IRole } from '../../../../lib/types/stores/access-store';

let app: IUnleashTest;
let db: ITestDb;
let eventService: EventService;
const TEST_USER_ID = -9999;
const regularUserName = 'import-user';
const adminUserName = 'admin-user';

const config: IUnleashConfig = createTestConfig();
let adminRole: IRole;
let stores: IUnleashStores;
let accessService: AccessService;

const loginRegularUser = () =>
    app.request
        .post(`/auth/demo/login`)
        .send({
            email: `${regularUserName}@getunleash.io`,
        })
        .expect(200);

const loginAdminUser = () =>
    app.request
        .post(`/auth/demo/login`)
        .send({
            email: `${adminUserName}@getunleash.io`,
        })
        .expect(200);

const createUserEditorAccess = async (name, email) => {
    const { userStore } = stores;
    const user = await userStore.insert({
        name,
        email,
    });
    return user;
};

const createUserAdminAccess = async (name, email) => {
    const { userStore } = stores;
    const user = await userStore.insert({
        name,
        email,
    });
    await accessService.addUserToRole(user.id, adminRole.id, 'default');
    return user;
};

beforeAll(async () => {
    db = await dbInit('event_search', getLogger);
    stores = db.stores;
    app = await setupAppWithAuth(
        db.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                },
            },
        },
        db.rawDatabase,
    );

    eventService = createEventsService(db.rawDatabase, config);

    accessService = app.services.accessService;

    const roles = await accessService.getRootRoles();
    adminRole = roles.find((role) => role.name === RoleName.ADMIN)!;

    await createUserEditorAccess(
        regularUserName,
        `${regularUserName}@getunleash.io`,
    );
    await createUserAdminAccess(
        adminUserName,
        `${adminUserName}@getunleash.io`,
    );
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

beforeEach(async () => {
    await loginAdminUser();
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
        project: 'default',
        createdBy: 'admin1@example.com',
        createdByUserId: TEST_USER_ID + 1,
        ip: '127.0.0.1',
    });

    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        createdBy: 'admin2@example.com',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    const { body } = await searchEvents({ createdBy: `IS:${TEST_USER_ID}` });

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
        from: `IS:${today.toISOString().split('T')[0]}`,
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
        to: `IS:${today.toISOString().split('T')[0]}`,
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
        type: USER_CREATED,
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
                type: 'user-created',
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

test('should not show user creation events for non-admins', async () => {
    await loginRegularUser();
    await eventService.storeEvent({
        type: USER_CREATED,
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    const { body } = await searchEvents({});

    expect(body).toMatchObject({
        events: [
            {
                type: FEATURE_CREATED,
            },
        ],
        total: 1,
    });
});

test('should show user creation events for admins', async () => {
    await eventService.storeEvent({
        type: USER_CREATED,
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    await eventService.storeEvent({
        type: FEATURE_CREATED,
        project: 'default',
        createdBy: 'test-user',
        createdByUserId: TEST_USER_ID,
        ip: '127.0.0.1',
    });

    const { body } = await searchEvents({});

    expect(body).toMatchObject({
        events: [
            {
                type: FEATURE_CREATED,
            },
            {
                type: USER_CREATED,
            },
        ],
        total: 2,
    });
});

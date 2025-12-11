import type { EventEmitter } from 'stream';
import {
    createEventsService,
    createFeatureToggleService,
} from '../../lib/features/index.js';
import { FEATURES_CREATED_BY_PROCESSED } from '../../lib/metric-events.js';
import type {
    EventService,
    FeatureToggleService,
} from '../../lib/services/index.js';
import {
    ADMIN_TOKEN_USER,
    type IUnleashConfig,
    type IUnleashStores,
} from '../../lib/types/index.js';
import { createTestConfig } from '../config/test-config.js';
import dbInit, { type ITestDb } from './helpers/database-init.js';
import { DEFAULT_ENV } from '../../lib/server-impl.js';

let stores: IUnleashStores;
let db: ITestDb;
let service: FeatureToggleService;
let eventBus: EventEmitter;
let _eventService: EventService;
let _unleashConfig: IUnleashConfig;

beforeAll(async () => {
    const config = createTestConfig();
    eventBus = config.eventBus;
    db = await dbInit(
        'features_created_by_user_id_migration',
        config.getLogger,
    );
    _unleashConfig = config;
    stores = db.stores;

    service = createFeatureToggleService(db.rawDatabase, config);

    _eventService = createEventsService(db.rawDatabase, config);
});

afterAll(async () => {
    await db.rawDatabase('features').del();
    await db.rawDatabase('events').del();
    await db.rawDatabase('users').del();
    await db.destroy();
});

beforeEach(async () => {
    await db.rawDatabase('features').del();
    await db.rawDatabase('events').del();
    await db.rawDatabase('users').del();
});

test('should set created_by_user_id on features', async () => {
    for (let i = 0; i < 100; i++) {
        await db.rawDatabase('features').insert({
            name: `feature${i}`,
            type: 'release',
            project: 'default',
            description: '--created_by_test--',
        });
    }

    await db.rawDatabase('users').insert({
        username: 'test1',
    });
    await db.rawDatabase('users').insert({
        username: 'test2',
    });
    await db.rawDatabase('users').insert({
        username: 'test3',
    });
    await db.rawDatabase('users').insert({
        username: 'test4',
    });

    for (let i = 0; i < 25; i++) {
        await db.rawDatabase('events').insert({
            type: 'feature-created',
            created_by: 'test1',
            feature_name: `feature${i}`,
            data: `{"name":"feature${i}","description":null,"type":"release","project":"default","stale":false,"createdAt":"2024-01-08T10:36:32.866Z","lastSeenAt":null,"impressionData":false,"archivedAt":null,"archived":false}`,
        });
    }

    for (let i = 25; i < 50; i++) {
        await db.rawDatabase('events').insert({
            type: 'feature-created',
            created_by: 'test2',
            feature_name: `feature${i}`,
            data: `{"name":"feature${i}","description":null,"type":"release","project":"default","stale":false,"createdAt":"2024-01-08T10:36:32.866Z","lastSeenAt":null,"impressionData":false,"archivedAt":null,"archived":false}`,
        });
    }

    for (let i = 50; i < 75; i++) {
        await db.rawDatabase('events').insert({
            type: 'feature-created',
            created_by: 'test3',
            feature_name: `feature${i}`,
            data: `{"name":"feature${i}","description":null,"type":"release","project":"default","stale":false,"createdAt":"2024-01-08T10:36:32.866Z","lastSeenAt":null,"impressionData":false,"archivedAt":null,"archived":false}`,
        });
    }

    for (let i = 75; i < 100; i++) {
        await db.rawDatabase('events').insert({
            type: 'feature-created',
            created_by: 'test4',
            feature_name: `feature${i}`,
            data: `{"name":"feature${i}","description":null,"type":"release","project":"default","stale":false,"createdAt":"2024-01-08T10:36:32.866Z","lastSeenAt":null,"impressionData":false,"archivedAt":null,"archived":false}`,
        });
    }

    await stores.featureToggleStore.setCreatedByUserId(200);

    const features = await db.rawDatabase('features').select('*');
    const notSet = features.filter(
        (f) => !f.created_by_user_id && f.description === '--created_by_test--',
    );
    const test1 = features.filter((f) => f.created_by_user_id === 1);
    const test2 = features.filter((f) => f.created_by_user_id === 2);
    const test3 = features.filter((f) => f.created_by_user_id === 3);
    const test4 = features.filter((f) => f.created_by_user_id === 4);
    expect(notSet).toHaveLength(0);
    expect(test1).toHaveLength(25);
    expect(test2).toHaveLength(25);
    expect(test3).toHaveLength(25);
    expect(test4).toHaveLength(25);
});

test('admin tokens get populated to admin token user', async () => {
    for (let i = 0; i < 5; i++) {
        await db.rawDatabase('features').insert({
            name: `feature${i}`,
            type: 'release',
            project: 'default',
            description: '--created_by_test--',
        });
    }

    await db.rawDatabase('users').insert({
        username: 'input1',
    });

    await db.rawDatabase('api_tokens').insert({
        secret: 'token1',
        username: 'adm-token',
        type: 'admin',
        environment: DEFAULT_ENV,
        token_name: 'admin-token',
    });

    await db.rawDatabase('events').insert({
        type: 'feature-created',
        created_by: 'input1',
        feature_name: 'feature0',
        data: `{"name":"feature0","description":null,"type":"release","project":"default","stale":false,"createdAt":"2024-01-08T10:36:32.866Z","lastSeenAt":null,"impressionData":false,"archivedAt":null,"archived":false}`,
    });

    await db.rawDatabase('events').insert({
        type: 'feature-created',
        created_by: 'input1',
        feature_name: 'feature1',
        data: `{"name":"feature1","description":null,"type":"release","project":"default","stale":false,"createdAt":"2024-01-08T10:36:32.866Z","lastSeenAt":null,"impressionData":false,"archivedAt":null,"archived":false}`,
    });

    await db.rawDatabase('events').insert({
        type: 'feature-created',
        created_by: 'adm-token',
        feature_name: 'feature2',
        data: `{"name":"feature2","description":null,"type":"release","project":"default","stale":false,"createdAt":"2024-01-08T10:36:32.866Z","lastSeenAt":null,"impressionData":false,"archivedAt":null,"archived":false}`,
    });

    await db.rawDatabase('events').insert({
        type: 'feature-created',
        created_by: 'deleted-user',
        feature_name: 'feature3',
        data: `{"name":"feature3","description":null,"type":"release","project":"default","stale":false,"createdAt":"2024-01-08T10:36:32.866Z","lastSeenAt":null,"impressionData":false,"archivedAt":null,"archived":false}`,
    });

    await db.rawDatabase('events').insert({
        type: 'feature-created',
        created_by: 'adm-token',
        feature_name: 'feature4',
        data: `{"name":"feature4","description":null,"type":"release","project":"default","stale":false,"createdAt":"2024-01-08T10:36:32.866Z","lastSeenAt":null,"impressionData":false,"archivedAt":null,"archived":false}`,
    });

    await stores.featureToggleStore.setCreatedByUserId(200);

    const user = await db
        .rawDatabase('users')
        .where({ username: 'input1' })
        .first('id');

    const features = await db.rawDatabase('features').select('*');
    const notSet = features.filter(
        (f) => !f.created_by_user_id && f.description === '--created_by_test--',
    );
    const test1 = features.filter((f) => f.created_by_user_id === user.id);
    const test2 = features.filter(
        (f) => f.created_by_user_id === ADMIN_TOKEN_USER.id,
    );
    expect(notSet).toHaveLength(1);
    expect(test1).toHaveLength(2);
    expect(test2).toHaveLength(2);
});

test('emits event with updated rows count', async () => {
    for (let i = 0; i < 5; i++) {
        await db.rawDatabase('features').insert({
            name: `feature${i}`,
            type: 'release',
            project: 'default',
            description: '--created_by_test--',
        });
    }

    await db.rawDatabase('users').insert({
        username: 'input2',
    });

    await db.rawDatabase('api_tokens').insert({
        secret: 'token2',
        username: 'adm-token2',
        type: 'admin',
        environment: DEFAULT_ENV,
        token_name: 'admin-token2',
    });

    await db.rawDatabase('events').insert({
        type: 'feature-created',
        created_by: 'input2',
        feature_name: 'feature0',
        data: `{"name":"feature0","description":null,"type":"release","project":"default","stale":false,"createdAt":"2024-01-08T10:36:32.866Z","lastSeenAt":null,"impressionData":false,"archivedAt":null,"archived":false}`,
    });

    await db.rawDatabase('events').insert({
        type: 'feature-created',
        created_by: 'input2',
        feature_name: 'feature1',
        data: `{"name":"feature1","description":null,"type":"release","project":"default","stale":false,"createdAt":"2024-01-08T10:36:32.866Z","lastSeenAt":null,"impressionData":false,"archivedAt":null,"archived":false}`,
    });

    await db.rawDatabase('events').insert({
        type: 'feature-created',
        created_by: 'adm-token2',
        feature_name: 'feature2',
        data: `{"name":"feature2","description":null,"type":"release","project":"default","stale":false,"createdAt":"2024-01-08T10:36:32.866Z","lastSeenAt":null,"impressionData":false,"archivedAt":null,"archived":false}`,
    });

    await db.rawDatabase('events').insert({
        type: 'feature-created',
        created_by: 'deleted-user',
        feature_name: 'feature3',
        data: `{"name":"feature3","description":null,"type":"release","project":"default","stale":false,"createdAt":"2024-01-08T10:36:32.866Z","lastSeenAt":null,"impressionData":false,"archivedAt":null,"archived":false}`,
    });

    await db.rawDatabase('events').insert({
        type: 'feature-created',
        created_by: 'adm-token2',
        feature_name: 'feature4',
        data: `{"name":"feature4","description":null,"type":"release","project":"default","stale":false,"createdAt":"2024-01-08T10:36:32.866Z","lastSeenAt":null,"impressionData":false,"archivedAt":null,"archived":false}`,
    });

    let triggered = false;

    eventBus.on(FEATURES_CREATED_BY_PROCESSED, ({ updated }) => {
        expect(updated).toBe(4);
        triggered = true;
    });

    await service.setFeatureCreatedByUserIdFromEvents();

    expect(triggered).toBeTruthy();
});

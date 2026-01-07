import type {
    IOnboardingReadModel,
    IUnleashStores,
} from '../../../lib/types/index.js';
import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import { minutesToMilliseconds } from 'date-fns';
import type { OnboardingService } from './onboarding-service.js';
import { createTestConfig } from '../../../test/config/test-config.js';
import { createOnboardingService } from './createOnboardingService.js';
import type EventEmitter from 'events';
import { STAGE_ENTERED, USER_LOGIN } from '../../metric-events.js';
import { vi } from 'vitest';

let db: ITestDb;
let stores: IUnleashStores;
let onboardingService: OnboardingService;
let eventBus: EventEmitter;
let onboardingReadModel: IOnboardingReadModel;

beforeAll(async () => {
    db = await dbInit('onboarding_store', getLogger);
    const config = createTestConfig({
        experimental: { flags: {} },
    });
    stores = db.stores;
    eventBus = config.eventBus;
    onboardingService = createOnboardingService(config)(db.rawDatabase);
    onboardingService.listen();
    onboardingReadModel = db.stores.onboardingReadModel;
});

afterAll(async () => {
    await db.destroy();
});

beforeEach(async () => {
    await stores.featureToggleStore.deleteAll();
    await stores.projectStore.deleteAll();
    await stores.onboardingStore.deleteAll();
    await stores.userStore.deleteAll();
    vi.useRealTimers();
});

test('Default project should take first user created instead of project created as start time', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date());
    const { userStore, featureToggleStore, projectStore } = stores;

    // default projects are created in advance and should be ignored
    await projectStore.create({ id: 'default', name: 'irrelevant' });

    vi.advanceTimersByTime(minutesToMilliseconds(1));
    const user = await userStore.insert({});
    await featureToggleStore.create('default', {
        name: 'test-default',
        createdByUserId: user.id,
    });

    vi.advanceTimersByTime(minutesToMilliseconds(1));
    await onboardingService.insert({
        type: 'flag-created',
        flag: 'test-default',
    });
    await onboardingService.insert({ type: 'pre-live', flag: 'test-default' });
    await onboardingService.insert({ type: 'live', flag: 'test-default' });

    const { rows: projectEvents } = await db.rawDatabase.raw(
        'SELECT * FROM onboarding_events_project',
    );
    expect(projectEvents).toMatchObject([
        { event: 'first-flag', time_to_event: 60, project: 'default' },
        {
            event: 'first-pre-live',
            time_to_event: 60,
            project: 'default',
        },
        { event: 'first-live', time_to_event: 60, project: 'default' },
    ]);
});

test('Ignore events for existing customers', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 8, 2)); // day before we added metrics
    const { userStore } = stores;
    await userStore.insert({});

    vi.setSystemTime(new Date());
    await onboardingService.insert({ type: 'first-user-login' });

    const { rows: instanceEvents } = await db.rawDatabase.raw(
        'SELECT * FROM onboarding_events_instance',
    );
    expect(instanceEvents).toMatchObject([]);
});

test('Ignore system user in onboarding events', async () => {
    // system users are not counted towards onboarding metrics
    await db.rawDatabase.raw('INSERT INTO users (is_system) VALUES (true)');

    await onboardingService.insert({ type: 'first-user-login' });

    const { rows: instanceEvents } = await db.rawDatabase.raw(
        'SELECT * FROM onboarding_events_instance',
    );
    expect(instanceEvents).toMatchObject([]);
});

test('Storing onboarding events', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date());
    const { userStore, featureToggleStore, projectStore } = stores;
    const user = await userStore.insert({});
    await projectStore.create({ id: 'test_project', name: 'irrelevant' });
    await featureToggleStore.create('test_project', {
        name: 'test',
        createdByUserId: user.id,
    });

    vi.advanceTimersByTime(minutesToMilliseconds(1));
    await onboardingService.insert({ type: 'first-user-login' });
    vi.advanceTimersByTime(minutesToMilliseconds(1));
    await onboardingService.insert({ type: 'second-user-login' });
    vi.advanceTimersByTime(minutesToMilliseconds(1));
    await onboardingService.insert({ type: 'flag-created', flag: 'test' });
    await onboardingService.insert({ type: 'flag-created', flag: 'test' });
    await onboardingService.insert({ type: 'flag-created', flag: 'invalid' });
    vi.advanceTimersByTime(minutesToMilliseconds(1));
    await onboardingService.insert({ type: 'pre-live', flag: 'test' });
    await onboardingService.insert({ type: 'pre-live', flag: 'test' });
    await onboardingService.insert({ type: 'pre-live', flag: 'invalid' });
    vi.advanceTimersByTime(minutesToMilliseconds(1));
    await onboardingService.insert({ type: 'live', flag: 'test' });
    vi.advanceTimersByTime(minutesToMilliseconds(1));
    await onboardingService.insert({ type: 'live', flag: 'test' });
    vi.advanceTimersByTime(minutesToMilliseconds(1));
    await onboardingService.insert({ type: 'live', flag: 'invalid' });

    const { rows: instanceEvents } = await db.rawDatabase.raw(
        'SELECT * FROM onboarding_events_instance',
    );
    expect(instanceEvents).toMatchObject([
        { event: 'first-user-login', time_to_event: 60 },
        { event: 'second-user-login', time_to_event: 120 },
        { event: 'first-flag', time_to_event: 180 },
        { event: 'first-pre-live', time_to_event: 240 },
        { event: 'first-live', time_to_event: 300 },
    ]);

    const { rows: projectEvents } = await db.rawDatabase.raw(
        'SELECT * FROM onboarding_events_project',
    );
    expect(projectEvents).toMatchObject([
        { event: 'first-flag', time_to_event: 180, project: 'test_project' },
        {
            event: 'first-pre-live',
            time_to_event: 240,
            project: 'test_project',
        },
        { event: 'first-live', time_to_event: 300, project: 'test_project' },
    ]);
});

const reachedOnboardingEvents = (count: number) => {
    let processedOnboardingEvents = 0;
    return new Promise((resolve) => {
        eventBus.on('onboarding-event', () => {
            processedOnboardingEvents += 1;
            if (processedOnboardingEvents === count) resolve('done');
        });
    });
};

test('Reacting to events', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date());
    const { userStore, featureToggleStore, projectStore } = stores;
    const user = await userStore.insert({});
    await projectStore.create({ id: 'test_project', name: 'irrelevant' });
    await featureToggleStore.create('test_project', {
        name: 'test',
        createdByUserId: user.id,
    });
    vi.advanceTimersByTime(minutesToMilliseconds(1));

    eventBus.emit(USER_LOGIN, { loginOrder: 0 });
    eventBus.emit(USER_LOGIN, { loginOrder: 1 });
    eventBus.emit(STAGE_ENTERED, { stage: 'initial', feature: 'test' });
    eventBus.emit(STAGE_ENTERED, { stage: 'pre-live', feature: 'test' });
    eventBus.emit(STAGE_ENTERED, { stage: 'live', feature: 'test' });
    await reachedOnboardingEvents(5);

    const instanceMetrics =
        await onboardingReadModel.getInstanceOnboardingMetrics();
    const projectMetrics =
        await onboardingReadModel.getProjectsOnboardingMetrics();

    expect(instanceMetrics).toMatchObject({
        firstLogin: 60,
        secondLogin: 60,
        firstFeatureFlag: 60,
        firstPreLive: 60,
        firstLive: 60,
    });
    expect(projectMetrics).toMatchObject([
        {
            project: 'test_project',
            firstFeatureFlag: 60,
            firstPreLive: 60,
            firstLive: 60,
        },
    ]);
});

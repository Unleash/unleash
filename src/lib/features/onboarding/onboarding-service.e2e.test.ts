import type { IUnleashStores } from '../../../lib/types';
import dbInit, { type ITestDb } from '../../../test/e2e/helpers/database-init';
import getLogger from '../../../test/fixtures/no-logger';
import { minutesToMilliseconds } from 'date-fns';
import { OnboardingService } from './onboarding-service';
import { createTestConfig } from '../../../test/config/test-config';

let db: ITestDb;
let stores: IUnleashStores;
let onboardingService: OnboardingService;

beforeAll(async () => {
    db = await dbInit('onboarding_store', getLogger);
    const config = createTestConfig({
        experimental: { flags: { onboardingMetrics: true } },
    });
    stores = db.stores;
    const { userStore, onboardingStore, projectReadModel } = stores;
    onboardingService = new OnboardingService(
        { onboardingStore, userStore, projectReadModel },
        config,
    );
});

afterAll(async () => {
    await db.destroy();
});

beforeEach(async () => {
    jest.useRealTimers();
});

test('Storing onboarding events', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date());
    const { userStore, featureToggleStore, projectStore, projectReadModel } =
        stores;
    const user = await userStore.insert({});
    await projectStore.create({ id: 'test_project', name: 'irrelevant' });
    await featureToggleStore.create('test_project', {
        name: 'test',
        createdByUserId: user.id,
    });

    jest.advanceTimersByTime(minutesToMilliseconds(1));
    await onboardingService.insert({ type: 'first-user-login' });
    jest.advanceTimersByTime(minutesToMilliseconds(1));
    await onboardingService.insert({ type: 'second-user-login' });
    jest.advanceTimersByTime(minutesToMilliseconds(1));
    await onboardingService.insert({ type: 'flag-created', flag: 'test' });
    await onboardingService.insert({ type: 'flag-created', flag: 'test' });
    await onboardingService.insert({ type: 'flag-created', flag: 'invalid' });
    jest.advanceTimersByTime(minutesToMilliseconds(1));
    await onboardingService.insert({ type: 'pre-live', flag: 'test' });
    await onboardingService.insert({ type: 'pre-live', flag: 'test' });
    await onboardingService.insert({ type: 'pre-live', flag: 'invalid' });
    jest.advanceTimersByTime(minutesToMilliseconds(1));
    await onboardingService.insert({ type: 'live', flag: 'test' });
    jest.advanceTimersByTime(minutesToMilliseconds(1));
    await onboardingService.insert({ type: 'live', flag: 'test' });
    jest.advanceTimersByTime(minutesToMilliseconds(1));
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

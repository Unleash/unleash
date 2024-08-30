import type { IUnleashStores } from '../../../lib/types';
import dbInit, { type ITestDb } from '../../../test/e2e/helpers/database-init';
import getLogger from '../../../test/fixtures/no-logger';
import { minutesToMilliseconds } from 'date-fns';

let db: ITestDb;
let stores: IUnleashStores;

beforeAll(async () => {
    db = await dbInit('onboarding_store', getLogger);
    stores = db.stores;
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
    const { userStore, onboardingStore, featureToggleStore, projectStore } =
        stores;
    const user = await userStore.insert({});
    await projectStore.create({ id: 'test_project', name: 'irrelevant' });
    await featureToggleStore.create('test_project', {
        name: 'test',
        createdByUserId: user.id,
    });

    jest.advanceTimersByTime(minutesToMilliseconds(1));
    await onboardingStore.insert({ type: 'firstUserLogin' });
    jest.advanceTimersByTime(minutesToMilliseconds(1));
    await onboardingStore.insert({ type: 'secondUserLogin' });
    jest.advanceTimersByTime(minutesToMilliseconds(1));
    await onboardingStore.insert({ type: 'flagCreated', flag: 'test' });
    await onboardingStore.insert({ type: 'flagCreated', flag: 'test' });
    await onboardingStore.insert({ type: 'flagCreated', flag: 'invalid' });
    jest.advanceTimersByTime(minutesToMilliseconds(1));
    await onboardingStore.insert({ type: 'preLive', flag: 'test' });
    await onboardingStore.insert({ type: 'preLive', flag: 'test' });
    await onboardingStore.insert({ type: 'preLive', flag: 'invalid' });
    jest.advanceTimersByTime(minutesToMilliseconds(1));
    await onboardingStore.insert({ type: 'live', flag: 'test' });
    jest.advanceTimersByTime(minutesToMilliseconds(1));
    await onboardingStore.insert({ type: 'live', flag: 'test' });
    jest.advanceTimersByTime(minutesToMilliseconds(1));
    await onboardingStore.insert({ type: 'live', flag: 'invalid' });

    const { rows: instanceEvents } = await db.rawDatabase.raw(
        'SELECT * FROM onboarding_events_instance',
    );
    expect(instanceEvents).toMatchObject([
        { event: 'firstUserLogin', time_to_event: 60 },
        { event: 'secondUserLogin', time_to_event: 120 },
        { event: 'firstFlag', time_to_event: 180 },
        { event: 'firstPreLive', time_to_event: 240 },
        { event: 'firstLive', time_to_event: 300 },
    ]);

    const { rows: projectEvents } = await db.rawDatabase.raw(
        'SELECT * FROM onboarding_events_project',
    );
    expect(projectEvents).toMatchObject([
        { event: 'firstFlag', time_to_event: 180, project: 'test_project' },
        { event: 'firstPreLive', time_to_event: 240, project: 'test_project' },
        { event: 'firstLive', time_to_event: 300, project: 'test_project' },
    ]);
});

import dbInit, { type ITestDb } from '../../../test/e2e/helpers/database-init';
import getLogger from '../../../test/fixtures/no-logger';
import type {
    IFeatureLifecycleStore,
    IFeatureToggleStore,
    IUserStore,
} from '../../types';
import { OnboardingReadModel } from './onboarding-read-model';
import type { IOnboardingReadModel } from './onboarding-read-model-type';
import { minutesToMilliseconds } from 'date-fns';

let db: ITestDb;
let onboardingReadModel: IOnboardingReadModel;
let userStore: IUserStore;
let lifecycleStore: IFeatureLifecycleStore;
let featureToggleStore: IFeatureToggleStore;

beforeAll(async () => {
    db = await dbInit('onboarding_read_model', getLogger, {
        experimental: { flags: { onboardingMetrics: true } },
    });
    onboardingReadModel = new OnboardingReadModel(db.rawDatabase);
    userStore = db.stores.userStore;
    lifecycleStore = db.stores.featureLifecycleStore;
    featureToggleStore = db.stores.featureToggleStore;
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});

beforeEach(async () => {
    await userStore.deleteAll();
    jest.useRealTimers();
});

test('can get onboarding durations', async () => {
    jest.useFakeTimers();
    const initialResult =
        await onboardingReadModel.getInstanceOnboardingMetrics();
    expect(initialResult).toMatchObject({
        firstLogin: null,
        secondLogin: null,
        firstFeatureFlag: null,
        firstPreLive: null,
        firstLive: null,
    });

    const firstUser = await userStore.insert({});
    await userStore.successfullyLogin(firstUser);

    const firstLoginResult =
        await onboardingReadModel.getInstanceOnboardingMetrics();
    expect(firstLoginResult).toMatchObject({
        firstLogin: 0,
        secondLogin: null,
    });

    jest.advanceTimersByTime(minutesToMilliseconds(10));

    const secondUser = await userStore.insert({});
    await userStore.successfullyLogin(secondUser);

    jest.advanceTimersByTime(minutesToMilliseconds(10));

    await featureToggleStore.create('default', {
        name: 'test',
        createdByUserId: secondUser.id,
    });

    await lifecycleStore.insert([
        {
            feature: 'test',
            stage: 'initial',
        },
    ]);

    jest.advanceTimersByTime(minutesToMilliseconds(10));

    await lifecycleStore.insert([
        {
            feature: 'test',
            stage: 'pre-live',
        },
    ]);

    jest.advanceTimersByTime(minutesToMilliseconds(10));

    await lifecycleStore.insert([
        {
            feature: 'test',
            stage: 'live',
        },
    ]);

    const secondLoginResult =
        await onboardingReadModel.getInstanceOnboardingMetrics();
    expect(secondLoginResult).toMatchObject({
        firstLogin: 0,
        secondLogin: 10,
        firstFeatureFlag: 20,
        firstPreLive: 30,
        firstLive: 40,
    });

    const projectOnboardingResult =
        await onboardingReadModel.getProjectsOnboardingMetrics();

    expect(projectOnboardingResult).toMatchObject([
        {
            project: 'default',
            firstFeatureFlag: 20,
            firstPreLive: 30,
            firstLive: 40,
        },
    ]);
});

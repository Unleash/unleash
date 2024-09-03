import dbInit, { type ITestDb } from '../../../test/e2e/helpers/database-init';
import getLogger from '../../../test/fixtures/no-logger';
import {
    type IFeatureToggleStore,
    type ILastSeenStore,
    type IOnboardingStore,
    SYSTEM_USER,
} from '../../types';
import type { IOnboardingReadModel } from './onboarding-read-model-type';

let db: ITestDb;
let onboardingReadModel: IOnboardingReadModel;
let onBoardingStore: IOnboardingStore;
let featureToggleStore: IFeatureToggleStore;
let lastSeenStore: ILastSeenStore;

beforeAll(async () => {
    db = await dbInit('onboarding_read_model', getLogger, {
        experimental: { flags: { onboardingMetrics: true } },
    });
    onboardingReadModel = db.stores.onboardingReadModel;
    onBoardingStore = db.stores.onboardingStore;
    featureToggleStore = db.stores.featureToggleStore;
    lastSeenStore = db.stores.lastSeenStore;
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});

beforeEach(async () => {});

test('can get instance onboarding durations', async () => {
    const initialResult =
        await onboardingReadModel.getInstanceOnboardingMetrics();
    expect(initialResult).toMatchObject({
        firstLogin: null,
        secondLogin: null,
        firstFeatureFlag: null,
        firstPreLive: null,
        firstLive: null,
    });

    await onBoardingStore.insertInstanceEvent({
        type: 'first-user-login',
        timeToEvent: 0,
    });

    const firstLoginResult =
        await onboardingReadModel.getInstanceOnboardingMetrics();
    expect(firstLoginResult).toMatchObject({
        firstLogin: 0,
        secondLogin: null,
    });

    await onBoardingStore.insertInstanceEvent({
        type: 'second-user-login',
        timeToEvent: 10,
    });

    await onBoardingStore.insertInstanceEvent({
        type: 'flag-created',
        timeToEvent: 20,
    });

    await onBoardingStore.insertInstanceEvent({
        type: 'pre-live',
        timeToEvent: 30,
    });

    await onBoardingStore.insertInstanceEvent({
        type: 'live',
        timeToEvent: 40,
    });

    const secondLoginResult =
        await onboardingReadModel.getInstanceOnboardingMetrics();
    expect(secondLoginResult).toMatchObject({
        firstLogin: 0,
        secondLogin: 10,
        firstFeatureFlag: 20,
        firstPreLive: 30,
        firstLive: 40,
    });
});

test('can get instance onboarding durations', async () => {
    await onBoardingStore.insertProjectEvent({
        project: 'default',
        type: 'flag-created',
        timeToEvent: 20,
    });

    await onBoardingStore.insertProjectEvent({
        project: 'default',
        type: 'pre-live',
        timeToEvent: 30,
    });

    await onBoardingStore.insertProjectEvent({
        project: 'default',
        type: 'live',
        timeToEvent: 40,
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

test('can get project onboarding status', async () => {
    const onboardingStartedResult =
        await onboardingReadModel.getOnboardingStatusForProject('default');

    expect(onboardingStartedResult).toMatchObject({
        status: 'onboarding-started',
    });

    await featureToggleStore.create('default', {
        name: 'my-flag',
        createdByUserId: SYSTEM_USER.id,
    });

    const firstFlagResult =
        await onboardingReadModel.getOnboardingStatusForProject('default');

    expect(firstFlagResult).toMatchObject({
        status: 'first-flag-created',
        feature: 'my-flag',
    });

    await lastSeenStore.setLastSeen([
        {
            environment: 'default',
            featureName: 'my-flag',
        },
    ]);

    const onboardedResult =
        await onboardingReadModel.getOnboardingStatusForProject('default');

    expect(onboardedResult).toMatchObject({
        status: 'onboarded',
    });
});

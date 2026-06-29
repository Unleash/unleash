import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import {
    type IFeatureToggleStore,
    type ILastSeenStore,
    type IOnboardingStore,
    SYSTEM_USER,
} from '../../types/index.js';
import { FEATURE_ENVIRONMENT_ENABLED } from '../../events/index.js';
import type { IOnboardingReadModel } from './onboarding-read-model-type.js';
import type ClientInstanceService from '../metrics/instance/instance-service.js';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../test/e2e/helpers/test-helper.js';
import { ApiTokenType } from '../../types/model.js';
import { DEFAULT_ENV } from '../../server-impl.js';

let db: ITestDb;
let onboardingReadModel: IOnboardingReadModel;
let onBoardingStore: IOnboardingStore;
let featureToggleStore: IFeatureToggleStore;
let lastSeenStore: ILastSeenStore;
let instanceService: ClientInstanceService;
let app: IUnleashTest;

beforeAll(async () => {
    db = await dbInit('onboarding_read_model', getLogger, {
        experimental: { flags: {} },
    });

    app = await setupAppWithCustomConfig(
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

    onboardingReadModel = db.stores.onboardingReadModel;
    onBoardingStore = db.stores.onboardingStore;
    featureToggleStore = db.stores.featureToggleStore;
    lastSeenStore = db.stores.lastSeenStore;
    instanceService = app.services.clientInstanceService;
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});

beforeEach(async () => {
    await featureToggleStore.deleteAll();
    await db.rawDatabase('events').delete();
});

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
            environment: DEFAULT_ENV,
            featureName: 'my-flag',
        },
    ]);

    const sdkConnectedResult =
        await onboardingReadModel.getOnboardingStatusForProject('default');

    expect(sdkConnectedResult).toMatchObject({
        status: 'sdk-connected',
    });

    await db.stores.eventStore.store({
        type: FEATURE_ENVIRONMENT_ENABLED,
        createdBy: 'test',
        createdByUserId: SYSTEM_USER.id,
        project: 'default',
        featureName: 'my-flag',
        environment: DEFAULT_ENV,
        ip: '127.0.0.1',
    });

    const onboardedResult =
        await onboardingReadModel.getOnboardingStatusForProject('default');

    expect(onboardedResult).toMatchObject({
        status: 'onboarded',
    });
});

test('archived feature counts as sdk-connected', async () => {
    await featureToggleStore.create('default', {
        name: 'my-flag',
        createdByUserId: SYSTEM_USER.id,
    });

    await lastSeenStore.setLastSeen([
        {
            environment: DEFAULT_ENV,
            featureName: 'my-flag',
        },
    ]);

    await featureToggleStore.archive('my-flag');

    const onboardedResult =
        await onboardingReadModel.getOnboardingStatusForProject('default');

    expect(onboardedResult).toMatchObject({
        status: 'sdk-connected',
    });
});

test('sdk register sets project as sdk-connected', async () => {
    await featureToggleStore.create('default', {
        name: 'my-flag',
        createdByUserId: SYSTEM_USER.id,
    });

    const defaultProjectToken =
        await app.services.apiTokenService.createApiTokenWithProjects({
            type: ApiTokenType.CLIENT,
            projects: ['default'],
            environment: DEFAULT_ENV,
            tokenName: 'tester',
        });

    await app.request
        .post('/api/client/register')
        .set('Authorization', defaultProjectToken.secret)
        .send({
            appName: 'multi-project-app',
            instanceId: 'instance-1',
            strategies: ['default'],
            started: Date.now(),
            interval: 10,
        });

    await instanceService.bulkAdd();

    const onboardedResult =
        await onboardingReadModel.getOnboardingStatusForProject('default');

    expect(onboardedResult).toMatchObject({
        status: 'sdk-connected',
    });
});

test('bulk method returns a status per project', async () => {
    const { projectStore } = db.stores;
    await projectStore.create({ id: 'project-a', name: 'A' });
    await projectStore.create({ id: 'project-b', name: 'B' });
    await projectStore.create({ id: 'project-c', name: 'C' });

    await featureToggleStore.create('project-b', {
        name: 'project-b-flag',
        createdByUserId: SYSTEM_USER.id,
    });

    await featureToggleStore.create('project-c', {
        name: 'project-c-flag',
        createdByUserId: SYSTEM_USER.id,
    });

    await lastSeenStore.setLastSeen([
        { environment: DEFAULT_ENV, featureName: 'project-c-flag' },
    ]);

    const result = await onboardingReadModel.getOnboardingStatusesForProjects([
        'project-a',
        'project-b',
        'project-c',
        'does-not-exist',
    ]);

    expect(result).toEqual(
        new Map([
            ['project-a', { status: 'onboarding-started' }],
            [
                'project-b',
                {
                    status: 'first-flag-created',
                    feature: 'project-b-flag',
                },
            ],
            ['project-c', { status: 'sdk-connected' }],
        ]),
    );
});

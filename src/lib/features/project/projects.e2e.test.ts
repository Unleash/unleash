import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../test/e2e/helpers/test-helper.js';
import getLogger from '../../../test/fixtures/no-logger.js';

import type { IProjectStore } from '../../types/index.js';
import { DEFAULT_ENV } from '../../server-impl.js';

let app: IUnleashTest;
let db: ITestDb;

let projectStore: IProjectStore;
const _testDate = '2023-10-01T12:34:56.000Z';

beforeAll(async () => {
    db = await dbInit('projects_api_serial', getLogger);
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
    projectStore = db.stores.projectStore;
});

afterEach(async () => {
    await db.stores.featureToggleStore.deleteAll();
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('Should ONLY return default project', async () => {
    projectStore.create({
        id: 'test2',
        name: 'test',
        description: '',
        mode: 'open',
    });

    const { body } = await app.request
        .get('/api/admin/projects')
        .expect(200)
        .expect('Content-Type', /json/);

    expect(body.projects).toHaveLength(1);
    expect(body.projects[0].id).toBe('default');
});

test('response should include created_at', async () => {
    const { body } = await app.request
        .get('/api/admin/projects')
        .expect('Content-Type', /json/)
        .expect(200);
    expect(body.projects[0].createdAt).toBeDefined();
});

test('response for project overview should include feature type counts', async () => {
    await app.createFeature({
        name: 'my-new-release-toggle',
        type: 'release',
    });
    await app.createFeature({
        name: 'my-new-development-toggle',
        type: 'experiment',
    });
    const { body } = await app.request
        .get('/api/admin/projects/default/overview')
        .expect('Content-Type', /json/)
        .expect(200);
    expect(body).toMatchObject({
        featureTypeCounts: [
            {
                type: 'experiment',
                count: 1,
            },
            {
                type: 'release',
                count: 1,
            },
        ],
    });
});

test('response should include technical debt field', async () => {
    const { body } = await app.request
        .get('/api/admin/projects')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(body.projects).toHaveLength(1);
    expect(body.projects[0]).toHaveProperty('technicalDebt');
    expect(typeof body.projects[0].technicalDebt).toBe('number');
    expect(body.projects[0].technicalDebt).toBeGreaterThanOrEqual(0);
    expect(body.projects[0].technicalDebt).toBeLessThanOrEqual(100);
});

describe('onboardingStatus with onboardingProjectSetupNewSteps flag enabled', () => {
    let appWithNewSteps: IUnleashTest;
    let dbWithNewSteps: ITestDb;

    beforeAll(async () => {
        dbWithNewSteps = await dbInit(
            'projects_api_new_onboarding_steps',
            getLogger,
        );
        appWithNewSteps = await setupAppWithCustomConfig(
            dbWithNewSteps.stores,
            {
                experimental: {
                    flags: {
                        strictSchemaValidation: true,
                        onboardingProjectSetupNewSteps: true,
                    },
                },
            },
            dbWithNewSteps.rawDatabase,
        );
    });

    afterEach(async () => {
        await dbWithNewSteps.stores.featureToggleStore.deleteAll();
    });

    afterAll(async () => {
        await appWithNewSteps.destroy();
        await dbWithNewSteps.destroy();
    });

    test('returns sdk-connected when SDK is connected but no flag has been enabled in an environment', async () => {
        await appWithNewSteps.createFeature({ name: 'my-flag' });
        await dbWithNewSteps.stores.lastSeenStore.setLastSeen([
            { environment: DEFAULT_ENV, featureName: 'my-flag' },
        ]);

        const { body } = await appWithNewSteps.request
            .get('/api/admin/projects/default/overview')
            .expect(200);

        expect(body.onboardingStatus).toMatchObject({
            status: 'sdk-connected',
        });
    });

    test('returns onboarded when SDK is connected and a flag has been enabled in an environment', async () => {
        await appWithNewSteps.createFeature({ name: 'my-flag' });
        await dbWithNewSteps.stores.lastSeenStore.setLastSeen([
            { environment: DEFAULT_ENV, featureName: 'my-flag' },
        ]);
        await appWithNewSteps.request
            .post(
                `/api/admin/projects/default/features/my-flag/environments/${DEFAULT_ENV}/on`,
            )
            .expect(200);

        const { body } = await appWithNewSteps.request
            .get('/api/admin/projects/default/overview')
            .expect(200);

        expect(body.onboardingStatus).toMatchObject({ status: 'onboarded' });
    });
});

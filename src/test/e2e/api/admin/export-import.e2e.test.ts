import { IUnleashTest, setupApp } from '../../helpers/test-helper';
import dbInit, { ITestDb } from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import { IEventStore } from 'lib/types/stores/event-store';
import { FeatureToggle, FeatureToggleDTO, IStrategyConfig } from 'lib/types';
import { DEFAULT_ENV } from '../../../../lib/util';

let app: IUnleashTest;
let db: ITestDb;
let eventStore: IEventStore;

const createToggle = async (
    toggle: FeatureToggleDTO,
    strategy?: Omit<IStrategyConfig, 'id'>,
    projectId: string = 'default',
    username: string = 'test',
) => {
    await app.services.featureToggleServiceV2.createFeatureToggle(
        projectId,
        toggle,
        username,
    );
    if (strategy) {
        await app.services.featureToggleServiceV2.createStrategy(
            strategy,
            { projectId, featureName: toggle.name, environment: DEFAULT_ENV },
            username,
        );
    }
};

beforeAll(async () => {
    db = await dbInit('export_import_api_serial', getLogger);
    app = await setupApp(db.stores);
    eventStore = db.stores.eventStore;
});

beforeEach(async () => {
    await eventStore.deleteAll();
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

afterEach(() => {
    db.stores.featureToggleStore.deleteAll();
});

test('exports features', async () => {
    await createToggle({
        name: 'first_feature',
        description: 'the #1 feature',
    });
    const { body } = await app.request
        .post('/api/admin/features-batch/export')
        .send({
            features: ['first_feature'],
            environment: 'default',
        })
        .set('Content-Type', 'application/json')
        .expect(200);

    expect(body).toMatchObject({
        features: [
            {
                name: 'first_feature',
            },
        ],
    });
});

test('import features', async () => {
    const feature: FeatureToggle = { project: 'ignore', name: 'first_feature' };
    await app.request
        .post('/api/admin/features-batch/import')
        .send({
            data: { features: [feature] },
            project: 'default',
            environment: 'custom_environment',
        })
        .set('Content-Type', 'application/json')
        .expect(201);

    const { body } = await app.request
        .get('/api/admin/features/first_feature')
        .expect(200);

    expect(body).toMatchObject({
        name: 'first_feature',
        project: 'default',
    });
});

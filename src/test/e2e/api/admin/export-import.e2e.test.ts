import { IUnleashTest, setupApp } from '../../helpers/test-helper';
import dbInit, { ITestDb } from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import { IEventStore } from '../../../../lib/types/stores/event-store';
import { FeatureToggleDTO, IStrategyConfig } from '../../../../lib/types';
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

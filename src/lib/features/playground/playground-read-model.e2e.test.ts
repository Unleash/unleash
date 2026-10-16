import EventEmitter from 'events';
import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import type { IUnleashStores } from '../../types/index.js';
import { PlaygroundReadModel } from './playground-read-model.js';

let db: ITestDb;
let stores: IUnleashStores;
let readModel: PlaygroundReadModel;

beforeAll(async () => {
    db = await dbInit('playground_read_model_serial', getLogger);
    stores = db.stores;
    readModel = new PlaygroundReadModel(db.rawDatabase, new EventEmitter());
});

afterAll(async () => {
    await db.destroy();
});

describe('getFeatureWithParents', () => {
    afterEach(async () => {
        await stores.dependentFeaturesStore.deleteAll();
        await stores.featureToggleStore.deleteAll();
    });

    const createFlag = (name: string) =>
        stores.featureToggleStore.create('default', {
            name,
            createdByUserId: 9999,
        });

    const createStrategy = (featureName: string) =>
        stores.featureStrategiesStore.createStrategyFeatureEnv({
            featureName,
            projectId: 'default',
            environment: 'development',
            strategyName: 'default',
            parameters: {},
            constraints: [],
        });

    test('is empty for an unknown flag', async () => {
        expect(
            await readModel.getFeatureWithParents('missing', 'development'),
        ).toStrictEqual([]);
    });

    test('excludes unrelated flags', async () => {
        await createFlag('flag');
        await createFlag('other');

        const features = await readModel.getFeatureWithParents(
            'flag',
            'development',
        );

        expect(features).toMatchObject([{ name: 'flag' }]);
    });

    test.each([
        { child: 'a-child', parent: 'z-parent' },
        { child: 'z-child', parent: 'a-parent' },
        { child: '2024', parent: '2025' },
        { child: '2025', parent: '2024' },
        { child: '10', parent: '9' },
    ])('orders parent $parent before flag $child', async ({
        child,
        parent,
    }) => {
        await createFlag(child);
        await createStrategy(child);
        await createStrategy(child);
        await createFlag(parent);
        await stores.dependentFeaturesStore.upsert({
            parent,
            child,
            enabled: true,
        });

        const features = await readModel.getFeatureWithParents(
            child,
            'development',
        );

        expect(features).toMatchObject([
            { name: parent },
            {
                name: child,
                dependencies: [{ feature: parent, enabled: true }],
            },
        ]);
    });

    test('uses the state of the requested environment', async () => {
        await createFlag('flag');
        await stores.featureEnvironmentStore.addEnvironmentToFeature(
            'flag',
            'development',
            true,
        );
        await stores.featureEnvironmentStore.addEnvironmentToFeature(
            'flag',
            'production',
            false,
        );

        const [inDevelopment] = await readModel.getFeatureWithParents(
            'flag',
            'development',
        );
        const [inProduction] = await readModel.getFeatureWithParents(
            'flag',
            'production',
        );

        expect(inDevelopment.enabled).toBe(true);
        expect(inProduction.enabled).toBe(false);
    });

    test('excludes an archived flag and its parent', async () => {
        await createFlag('child');
        await createFlag('parent');
        await stores.dependentFeaturesStore.upsert({
            parent: 'parent',
            child: 'child',
            enabled: true,
        });
        await stores.featureToggleStore.archive('child');

        expect(
            await readModel.getFeatureWithParents('child', 'development'),
        ).toStrictEqual([]);
    });
});

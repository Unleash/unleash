import { createTestConfig } from '../../config/test-config';
import dbInit, { ITestDb } from '../helpers/database-init';
import StateService from '../../../lib/services/state-service';
import oldFormat from '../../examples/variantsexport_v3.json';
import { WeightType } from '../../../lib/types/model';
import { EventService } from '../../../lib/services';
import { IUnleashStores } from '../../../lib/types';

let stores: IUnleashStores;
let db: ITestDb;
let stateService: StateService;

beforeAll(async () => {
    const config = createTestConfig();
    db = await dbInit('state_service_serial', config.getLogger);
    stores = db.stores;
    const eventService = new EventService(stores, config);
    stateService = new StateService(stores, config, eventService);
});

afterAll(async () => {
    db.destroy();
});
test('Exporting featureEnvironmentVariants should work', async () => {
    await stores.projectStore.create({
        id: 'fancy',
        name: 'extra',
        description: 'No surprises here',
    });
    await stores.environmentStore.create({
        name: 'dev',
        type: 'development',
    });
    await stores.environmentStore.create({
        name: 'prod',
        type: 'production',
    });
    await stores.featureToggleStore.create('fancy', {
        name: 'Some-feature',
        createdByUserId: -1337,
    });
    await stores.featureToggleStore.create('fancy', {
        name: 'another-feature',
        createdByUserId: -1337,
    });
    await stores.featureEnvironmentStore.addEnvironmentToFeature(
        'Some-feature',
        'dev',
        true,
    );
    await stores.featureEnvironmentStore.addEnvironmentToFeature(
        'another-feature',
        'dev',
        true,
    );
    await stores.featureEnvironmentStore.addEnvironmentToFeature(
        'another-feature',
        'prod',
        true,
    );
    await stores.featureEnvironmentStore.addVariantsToFeatureEnvironment(
        'Some-feature',
        'dev',
        [
            {
                name: 'blue',
                weight: 333,
                stickiness: 'default',
                weightType: WeightType.VARIABLE,
            },
            {
                name: 'green',
                weight: 333,
                stickiness: 'default',
                weightType: WeightType.VARIABLE,
            },
            {
                name: 'red',
                weight: 333,
                stickiness: 'default',
                weightType: WeightType.VARIABLE,
            },
        ],
    );
    await stores.featureEnvironmentStore.addVariantsToFeatureEnvironment(
        'another-feature',
        'dev',
        [
            {
                name: 'purple',
                weight: 333,
                stickiness: 'default',
                weightType: 'variable',
            },
            {
                name: 'lilac',
                weight: 333,
                stickiness: 'default',
                weightType: 'fix',
            },
            {
                name: 'azure',
                weight: 333,
                stickiness: 'default',
                weightType: 'fix',
            },
        ],
    );
    await stores.featureEnvironmentStore.addVariantsToFeatureEnvironment(
        'another-feature',
        'prod',
        [
            {
                name: 'purple',
                weight: 333,
                stickiness: 'default',
                weightType: 'fix',
            },
            {
                name: 'lilac',
                weight: 333,
                stickiness: 'default',
                weightType: 'fix',
            },
            {
                name: 'azure',
                weight: 333,
                stickiness: 'default',
                weightType: 'variable',
            },
        ],
    );
    const exportedData = await stateService.export({});
    expect(
        exportedData.featureEnvironments.find(
            (fE) => fE.featureName === 'Some-feature',
        )!.variants,
    ).toHaveLength(3);
});

test('Should import variants from old format and convert to new format (per environment)', async () => {
    await stateService.import({
        data: oldFormat,
        keepExisting: false,
        dropBeforeImport: true,
        userId: -9999,
    });
    const featureEnvironments = await stores.featureEnvironmentStore.getAll();
    expect(featureEnvironments).toHaveLength(6); // There are 3 environments enabled and 2 features
    expect(
        featureEnvironments
            .filter((fE) => fE.featureName === 'variants-tester' && fE.enabled)
            .every((e) => e.variants?.length === 4),
    ).toBeTruthy();
});
test('Should import variants in new format (per environment)', async () => {
    await stateService.import({
        data: oldFormat,
        keepExisting: false,
        dropBeforeImport: true,
        userId: -9999,
    });
    const exportedJson = await stateService.export({});
    await stateService.import({
        data: exportedJson,
        keepExisting: false,
        dropBeforeImport: true,
        userId: -9999,
    });
    const featureEnvironments = await stores.featureEnvironmentStore.getAll();
    expect(featureEnvironments).toHaveLength(6); // 3 environments, 2 features === 6 rows
});

test('Importing states with deprecated strategies should keep their deprecated state', async () => {
    const deprecatedStrategyExample = {
        version: 4,
        features: [],
        strategies: [
            {
                name: 'deprecatedstrat',
                description: 'This should be deprecated when imported',
                deprecated: true,
                parameters: [],
                builtIn: false,
                sortOrder: 9999,
                displayName: 'Deprecated strategy',
            },
        ],
        featureStrategies: [],
    };
    await stateService.import({
        data: deprecatedStrategyExample,
        userName: 'strategy-importer',
        dropBeforeImport: true,
        keepExisting: false,
        userId: -9999,
    });
    const deprecatedStrategy =
        await stores.strategyStore.get('deprecatedstrat');
    expect(deprecatedStrategy.deprecated).toBe(true);
});

test('Exporting a deprecated strategy and then importing it should keep correct state', async () => {
    await stateService.import({
        data: oldFormat,
        keepExisting: false,
        dropBeforeImport: true,
        userName: 'strategy importer',
        userId: -9999,
    });
    const rolloutRandom = await stores.strategyStore.get(
        'gradualRolloutRandom',
    );
    expect(rolloutRandom.deprecated).toBe(true);
    const rolloutSessionId = await stores.strategyStore.get(
        'gradualRolloutSessionId',
    );
    expect(rolloutSessionId.deprecated).toBe(true);
    const rolloutUserId = await stores.strategyStore.get(
        'gradualRolloutUserId',
    );
    expect(rolloutUserId.deprecated).toBe(true);
});

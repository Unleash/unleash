import FeatureToggleServiceV2 from '../../../lib/services/feature-toggle-service-v2';
import { IStrategyConfig } from '../../../lib/types/model';
import { createTestConfig } from '../../config/test-config';
import dbInit from '../helpers/database-init';

let stores;
let db;
let service: FeatureToggleServiceV2;

beforeAll(async () => {
    const config = createTestConfig();
    db = await dbInit(
        'feature_toggle_service_v2_service_serial',
        config.getLogger,
    );
    stores = db.stores;
    service = new FeatureToggleServiceV2(stores, config);
});

afterAll(async () => {
    await db.destroy();
});

test('Should create feature toggle strategy configuration', async () => {
    const config: Omit<IStrategyConfig, 'id'> = {
        name: 'default',
        constraints: [],
        parameters: {},
    };

    await stores.featureToggleStore.createFeature({
        name: 'Demo',
        strategies: [],
    });

    const createdConfig = await service.createStrategy(
        config,
        'default',
        'Demo',
    );

    expect(createdConfig.name).toEqual('default');
    expect(createdConfig.id).toBeDefined();
});

test('Should be able to update existing strategy configuration', async () => {
    const config: Omit<IStrategyConfig, 'id'> = {
        name: 'default',
        constraints: [],
        parameters: {},
    };

    await stores.featureToggleStore.createFeature({
        name: 'Demo',
        strategies: [],
    });

    const createdConfig = await service.createStrategy(
        config,
        'default',
        'Demo',
    );
    expect(createdConfig.name).toEqual('default');
    const updatedConfig = await service.updateStrategy(createdConfig.id, {
        parameters: { b2b: true },
    });
    expect(createdConfig.id).toEqual(updatedConfig.id);
    expect(updatedConfig.parameters).toEqual({ b2b: true });
});

test('Should be able to get strategy by id', async () => {
    const config: Omit<IStrategyConfig, 'id'> = {
        name: 'default',
        constraints: [],
        parameters: {},
    };

    await stores.featureToggleStore.createFeature({
        name: 'Demo',
        strategies: [],
    });

    const createdConfig = await service.createStrategy(
        config,
        'default',
        'Demo',
    );
    const fetchedConfig = await service.getStrategy(createdConfig.id);
    expect(fetchedConfig).toEqual(createdConfig);
});

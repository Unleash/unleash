import FeatureToggleServiceV2 from '../../../lib/services/feature-toggle-service-v2';
import { IStrategyConfig } from '../../../lib/types/model';
import { createTestConfig } from '../../config/test-config';
import dbInit from '../helpers/database-init';
import { DEFAULT_ENV } from '../../../lib/util/constants';

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
    const projectId = 'default';
    const username = 'feature-toggle';
    const config: Omit<IStrategyConfig, 'id'> = {
        name: 'default',
        constraints: [],
        parameters: {},
    };

    await service.createFeatureToggle(
        'default',
        {
            name: 'Demo',
        },
        'test',
    );

    const createdConfig = await service.createStrategy(
        config,
        projectId,
        'Demo',
        username,
    );

    expect(createdConfig.name).toEqual('default');
    expect(createdConfig.id).toBeDefined();
});

test('Should be able to update existing strategy configuration', async () => {
    const projectId = 'default';
    const username = 'existing-strategy';
    const config: Omit<IStrategyConfig, 'id'> = {
        name: 'default',
        constraints: [],
        parameters: {},
    };

    await service.createFeatureToggle(
        projectId,
        {
            name: 'update-existing-strategy',
        },
        'test',
    );

    const createdConfig = await service.createStrategy(
        config,
        'default',
        'update-existing-strategy',
        username,
    );
    expect(createdConfig.name).toEqual('default');
    const updatedConfig = await service.updateStrategy(
        createdConfig.id,
        DEFAULT_ENV,
        projectId,
        username,
        {
            parameters: { b2b: true },
        },
    );
    expect(createdConfig.id).toEqual(updatedConfig.id);
    expect(updatedConfig.parameters).toEqual({ b2b: true });
});

test('Should be able to get strategy by id', async () => {
    const userName = 'strategy';
    const config: Omit<IStrategyConfig, 'id'> = {
        name: 'default',
        constraints: [],
        parameters: {},
    };
    await service.createFeatureToggle(
        'default',
        {
            name: 'get-strategy-by-id',
        },
        'test',
    );

    const createdConfig = await service.createStrategy(
        config,
        'default',
        'Demo',
        userName,
        DEFAULT_ENV,
    );
    const fetchedConfig = await service.getStrategy(createdConfig.id);
    expect(fetchedConfig).toEqual(createdConfig);
});

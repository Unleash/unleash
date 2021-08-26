import EventService from '../../../lib/services/event-service';
import { FEATURE_UPDATED } from '../../../lib/types/events';
import FeatureToggleServiceV2 from '../../../lib/services/feature-toggle-service-v2';
import { IStrategyConfig } from '../../../lib/types/model';
import { createTestConfig } from '../../config/test-config';
import dbInit from '../helpers/database-init';
import { GLOBAL_ENV } from '../../../lib/types/environment';

let stores;
let db;
let service: FeatureToggleServiceV2;
let eventService: EventService;

beforeAll(async () => {
    const config = createTestConfig();
    db = await dbInit(
        'feature_toggle_service_v2_service_serial',
        config.getLogger,
    );
    stores = db.stores;
    service = new FeatureToggleServiceV2(stores, config);
    eventService = new EventService(stores, config);
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

    await service.createFeatureToggle(
        'default',
        {
            name: 'Demo',
        },
        'test',
    );

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

    await service.createFeatureToggle(
        'default',
        {
            name: 'update-existing-strategy',
        },
        'test',
    );

    const createdConfig = await service.createStrategy(
        config,
        'default',
        'update-existing-strategy',
    );
    expect(createdConfig.name).toEqual('default');
    const updatedConfig = await service.updateStrategy(createdConfig.id, {
        parameters: { b2b: true },
    });
    expect(createdConfig.id).toEqual(updatedConfig.id);
    expect(updatedConfig.parameters).toEqual({ b2b: true });
});

test('Should include legacy props in event log when updating strategy configuration', async () => {
    const userName = 'event-tester';
    const featureName = 'update-existing-strategy-events';
    const config: Omit<IStrategyConfig, 'id'> = {
        name: 'default',
        constraints: [],
        parameters: {},
    };

    await service.createFeatureToggle(
        'default',
        {
            name: featureName,
        },
        userName,
    );

    await service.createStrategy(config, 'default', featureName);
    await service.updateEnabled(featureName, GLOBAL_ENV, true, userName);

    const events = await eventService.getEventsForToggle(featureName);
    expect(events[0].type).toBe(FEATURE_UPDATED);
    expect(events[0].data.enabled).toBe(true);
    expect(events[0].data.strategies).toBeDefined();
});

test('Should be able to get strategy by id', async () => {
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
    );
    const fetchedConfig = await service.getStrategy(createdConfig.id);
    expect(fetchedConfig).toEqual(createdConfig);
});

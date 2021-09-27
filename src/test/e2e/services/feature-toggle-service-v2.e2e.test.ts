import EventService from '../../../lib/services/event-service';
import { FEATURE_UPDATED } from '../../../lib/types/events';
import FeatureToggleServiceV2 from '../../../lib/services/feature-toggle-service-v2';
import { IStrategyConfig } from '../../../lib/types/model';
import { createTestConfig } from '../../config/test-config';
import dbInit from '../helpers/database-init';
import { DEFAULT_ENV } from '../../../lib/util/constants';

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

    await service.createStrategy(config, 'default', featureName, userName);
    await service.updateEnabled(
        'default',
        featureName,
        DEFAULT_ENV,
        true,
        userName,
    );

    const events = await eventService.getEventsForToggle(featureName);
    const updatedEvent = events.find((e) => e.type === FEATURE_UPDATED);
    expect(updatedEvent.type).toBe(FEATURE_UPDATED);
    expect(updatedEvent.data.enabled).toBe(true);
    expect(updatedEvent.data.strategies).toBeDefined();
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
    );
    const fetchedConfig = await service.getStrategy(createdConfig.id);
    expect(fetchedConfig).toEqual(createdConfig);
});

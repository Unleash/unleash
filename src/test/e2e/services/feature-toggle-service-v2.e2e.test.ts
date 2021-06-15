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
    const config: IStrategyConfig = {
        name: 'default',
        constraints: [],
        parameters: {},
    };

    await stores.featureToggleStore.createFeature({
        name: 'Demo',
        strategies: [],
    });

    const createdConfig = await service.create(config, 'default', 'Demo');

    expect(createdConfig.environment).toEqual(':global:');
    expect(createdConfig.strategyName).toEqual('default');
    expect(createdConfig.projectName).toEqual('default');
});

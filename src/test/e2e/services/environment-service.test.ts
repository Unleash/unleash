import EnvironmentService from '../../../lib/services/environment-service';
import { createTestConfig } from '../../config/test-config';
import dbInit from '../helpers/database-init';
import NotFoundError from '../../../lib/error/notfound-error';
import { IUnleashStores } from '../../../lib/types/stores';

let stores: IUnleashStores;
let db;
let service: EnvironmentService;

beforeAll(async () => {
    const config = createTestConfig();
    db = await dbInit('environment_service_serial', config.getLogger);
    stores = db.stores;
    service = new EnvironmentService(stores, config);
});
afterAll(async () => {
    await db.destroy();
});

test('Can create and get environment', async () => {
    const created = await service.create({
        name: 'testenv',
        displayName: 'Environment for testing',
    });

    const retrieved = await service.get('testenv');
    expect(retrieved).toEqual(created);
});

test('Can delete environment', async () => {
    await service.create({
        name: 'testenv',
        displayName: 'Environment for testing',
    });
    await service.delete('testenv');
    return expect(async () => service.get('testenv')).rejects.toThrow(
        NotFoundError,
    );
});

test('Can get all', async () => {
    await service.create({
        name: 'testenv',
        displayName: 'Environment for testing',
    });

    const environments = await service.getAll();
    expect(environments).toHaveLength(2); // the one we created plus ':global:'
});

test('Can update display name', async () => {
    await service.create({
        name: 'testenv',
        displayName: 'Environment for testing',
    });

    await service.update('testenv', { displayName: 'Different name' });
    const updated = await service.get('testenv');
    expect(updated.displayName).toEqual('Different name');
});

test('Can connect environment to project', async () => {
    await service.create({ name: 'test-connection', displayName: '' });
    await stores.featureToggleStore.createFeature({
        name: 'test_feature',
        project: 'default',
        strategies: [{ name: 'default' }],
    });
    await service.connectProjectToEnvironment('test-connection', 'default');
    const overview = await stores.featureStrategiesStore.getProjectOverview(
        'default',
    );
    overview.forEach(f => {
        expect(f.environments).toEqual([
            {
                name: 'test-connection',
                displayName: '',
                enabled: false,
            },
        ]);
    });
});

test('Can remove environment from project', async () => {
    await service.create({ name: 'removal-test', displayName: '' });
    await stores.featureToggleStore.createFeature({
        name: 'test_feature',
        project: 'default',
        strategies: [{ name: 'default' }],
    });
    await service.removeEnvironmentFromProject('test-connection', 'default');
    await service.connectProjectToEnvironment('removal-test', 'default');
    let overview = await stores.featureStrategiesStore.getProjectOverview(
        'default',
    );
    expect(overview.length).toBeGreaterThan(0);
    overview.forEach(f => {
        expect(f.environments).toEqual([
            {
                name: 'removal-test',
                displayName: '',
                enabled: false,
            },
        ]);
    });
    await service.removeEnvironmentFromProject('removal-test', 'default');
    overview = await stores.featureStrategiesStore.getProjectOverview(
        'default',
    );
    expect(overview.length).toBeGreaterThan(0);
    overview.forEach(o => {
        expect(o.environments).toEqual([]);
    });
});

import EnvironmentService from '../../../lib/services/environment-service';
import { createTestConfig } from '../../config/test-config';
import dbInit from '../helpers/database-init';
import NotFoundError from '../../../lib/error/notfound-error';
import { IUnleashStores } from '../../../lib/types/stores';
import NameExistsError from '../../../lib/error/name-exists-error';

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

test('Can get environment', async () => {
    const created = await db.stores.environmentStore.create({
        name: 'testenv',
        displayName: 'Environment for testing',
        type: 'production',
    });

    const retrieved = await service.get('testenv');
    expect(retrieved).toEqual(created);
});

test('Can get all', async () => {
    await db.stores.environmentStore.create({
        name: 'testenv2',
        displayName: 'Environment for testing',
        type: 'production',
    });

    const environments = await service.getAll();
    expect(environments).toHaveLength(3); // the one we created plus ':global:'
});

test('Can connect environment to project', async () => {
    await db.stores.environmentStore.create({
        name: 'test-connection',
        displayName: '',
        type: 'production',
    });
    await stores.featureToggleStore.create('default', {
        name: 'test-connection',
        type: 'release',
        description: '',
        stale: false,
        variants: [],
    });
    await service.addEnvironmentToProject('test-connection', 'default');
    const overview = await stores.featureStrategiesStore.getFeatureOverview(
        'default',
        false,
    );
    overview.forEach((f) => {
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
    await db.stores.environmentStore.create({
        name: 'removal-test',
        displayName: '',
        type: 'production',
    });
    await stores.featureToggleStore.create('default', {
        name: 'removal-test',
    });
    await service.removeEnvironmentFromProject('test-connection', 'default');
    await service.addEnvironmentToProject('removal-test', 'default');
    let overview = await stores.featureStrategiesStore.getFeatureOverview(
        'default',
        false,
    );
    expect(overview.length).toBeGreaterThan(0);
    overview.forEach((f) => {
        expect(f.environments).toEqual([
            {
                name: 'removal-test',
                displayName: '',
                enabled: false,
            },
        ]);
    });
    await service.removeEnvironmentFromProject('removal-test', 'default');
    overview = await stores.featureStrategiesStore.getFeatureOverview(
        'default',
        false,
    );
    expect(overview.length).toBeGreaterThan(0);
    overview.forEach((o) => {
        expect(o.environments).toEqual([]);
    });
});

test('Adding same environment twice should throw a NameExistsError', async () => {
    await db.stores.environmentStore.create({
        name: 'uniqueness-test',
        displayName: '',
        type: 'production',
    });
    await service.removeEnvironmentFromProject('test-connection', 'default');
    await service.removeEnvironmentFromProject('removal-test', 'default');

    await service.addEnvironmentToProject('uniqueness-test', 'default');
    return expect(async () =>
        service.addEnvironmentToProject('uniqueness-test', 'default'),
    ).rejects.toThrow(
        new NameExistsError(
            'default already has the environment uniqueness-test enabled',
        ),
    );
});

test('Removing environment not connected to project should be a noop', async () =>
    expect(async () =>
        service.removeEnvironmentFromProject(
            'some-non-existing-environment',
            'default',
        ),
    ).resolves);

test('Trying to get an environment that does not exist throws NotFoundError', async () => {
    const envName = 'this-should-not-exist';
    await expect(async () => service.get(envName)).rejects.toThrow(
        new NotFoundError(`Could not find environment with name: ${envName}`),
    );
});

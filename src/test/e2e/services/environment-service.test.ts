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
        type: 'production',
    });

    const retrieved = await service.get('testenv');
    expect(retrieved).toEqual(created);
});

test('Can get all', async () => {
    await db.stores.environmentStore.create({
        name: 'testenv2',
        type: 'production',
    });

    const environments = await service.getAll();
    expect(environments).toHaveLength(3); // the one we created plus 'default'
});

test('Can connect environment to project', async () => {
    await db.stores.environmentStore.create({
        name: 'test-connection',
        type: 'production',
    });
    await stores.featureToggleStore.create('default', {
        name: 'test-connection',
        type: 'release',
        description: '',
        stale: false,
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
                enabled: false,
                sortOrder: 9999,
                type: 'production',
            },
        ]);
    });
});

test('Can remove environment from project', async () => {
    await db.stores.environmentStore.create({
        name: 'removal-test',
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
                enabled: false,
                sortOrder: 9999,
                type: 'production',
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
        type: 'production',
    });
    await service.addEnvironmentToProject('uniqueness-test', 'default');

    await service.removeEnvironmentFromProject('test-connection', 'default');
    await service.removeEnvironmentFromProject('removal-test', 'default');

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

test('Setting an override disables all other envs', async () => {
    const enabledEnvName = 'should-get-enabled';
    const disabledEnvName = 'should-get-disabled';
    await db.stores.environmentStore.create({
        name: disabledEnvName,
        type: 'production',
    });

    await db.stores.environmentStore.create({
        name: enabledEnvName,
        type: 'production',
    });

    //Set these to the wrong state so we can assert that overriding them flips their state
    await service.toggleEnvironment(disabledEnvName, true);
    await service.toggleEnvironment(enabledEnvName, false);

    await service.overrideEnabledProjects([enabledEnvName]);

    const environments = await service.getAll();
    const targetedEnvironment = environments.find(
        (env) => env.name == enabledEnvName,
    );

    const allOtherEnvironments = environments
        .filter((x) => x.name != enabledEnvName)
        .map((env) => env.enabled);

    expect(targetedEnvironment.enabled).toBe(true);
    expect(allOtherEnvironments.every((x) => x === false)).toBe(true);
});

test('Passing an empty override does nothing', async () => {
    const enabledEnvName = 'should-be-enabled';

    await db.stores.environmentStore.create({
        name: enabledEnvName,
        type: 'production',
    });

    await service.toggleEnvironment(enabledEnvName, true);

    await service.overrideEnabledProjects([]);

    const environments = await service.getAll();
    const targetedEnvironment = environments.find(
        (env) => env.name == enabledEnvName,
    );

    expect(targetedEnvironment.enabled).toBe(true);
});

test('When given overrides should remap projects to override environments', async () => {
    const enabledEnvName = 'enabled';
    const ignoredEnvName = 'ignored';
    const disabledEnvName = 'disabled';
    const toggleName = 'test-toggle';

    await db.stores.environmentStore.create({
        name: enabledEnvName,
        type: 'production',
    });

    await db.stores.environmentStore.create({
        name: ignoredEnvName,
        type: 'production',
    });

    await db.stores.environmentStore.create({
        name: disabledEnvName,
        type: 'production',
    });

    await service.toggleEnvironment(disabledEnvName, true);
    await service.toggleEnvironment(ignoredEnvName, true);
    await service.toggleEnvironment(enabledEnvName, false);

    await stores.featureToggleStore.create('default', {
        name: toggleName,
        type: 'release',
        description: '',
        stale: false,
    });

    await service.addEnvironmentToProject(disabledEnvName, 'default');

    await service.overrideEnabledProjects([enabledEnvName]);

    const projects = await stores.projectStore.getEnvironmentsForProject(
        'default',
    );

    expect(projects).toContain('enabled');
    expect(projects).not.toContain('default');
});

test('Override works correctly when enabling default and disabling prod and dev', async () => {
    const defaultEnvironment = 'default';
    const prodEnvironment = 'production';
    const devEnvironment = 'development';

    await db.stores.environmentStore.create({
        name: prodEnvironment,
        type: 'production',
    });

    await db.stores.environmentStore.create({
        name: devEnvironment,
        type: 'development',
    });
    await service.toggleEnvironment(prodEnvironment, true);
    await service.toggleEnvironment(devEnvironment, true);

    await service.overrideEnabledProjects([defaultEnvironment]);

    const environments = await service.getAll();
    const targetedEnvironment = environments.find(
        (env) => env.name == defaultEnvironment,
    );

    const allOtherEnvironments = environments
        .filter((x) => x.name != defaultEnvironment)
        .map((env) => env.enabled);
    const envNames = environments.map((x) => x.name);

    expect(envNames).toContain('production');
    expect(envNames).toContain('development');
    expect(targetedEnvironment.enabled).toBe(true);
    expect(allOtherEnvironments.every((x) => x === false)).toBe(true);
});

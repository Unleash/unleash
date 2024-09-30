import EnvironmentService from './environment-service';
import { createTestConfig } from '../../../test/config/test-config';
import dbInit, { type ITestDb } from '../../../test/e2e/helpers/database-init';
import NotFoundError from '../../error/notfound-error';
import {
    type IUnleashStores,
    SYSTEM_USER,
    SYSTEM_USER_AUDIT,
} from '../../types';
import NameExistsError from '../../error/name-exists-error';
import type { EventService } from '../../services';
import { createEventsService } from '../events/createEventsService';

let stores: IUnleashStores;
let db: ITestDb;
let service: EnvironmentService;
let eventService: EventService;

beforeAll(async () => {
    const config = createTestConfig();
    db = await dbInit('environment_service_serial', config.getLogger);
    stores = db.stores;
    eventService = createEventsService(db.rawDatabase, config);
    service = new EnvironmentService(stores, config, eventService);
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
        createdByUserId: 9999,
    });
    await service.addEnvironmentToProject(
        'test-connection',
        'default',
        SYSTEM_USER_AUDIT,
    );
    const overview = await stores.featureStrategiesStore.getFeatureOverview({
        projectId: 'default',
    });
    overview.forEach((f) => {
        expect(f.environments).toEqual([
            {
                name: 'test-connection',
                enabled: false,
                sortOrder: 9999,
                type: 'production',
                variantCount: 0,
                lastSeenAt: null,
                hasStrategies: false,
                hasEnabledStrategies: false,
            },
        ]);
    });
    const { events } = await eventService.getEvents();
    expect(events[0]).toMatchObject({
        type: 'project-environment-added',
        project: 'default',
        environment: 'test-connection',
        createdBy: SYSTEM_USER.username,
        createdByUserId: SYSTEM_USER.id,
    });
});

test('Can remove environment from project', async () => {
    await db.stores.environmentStore.create({
        name: 'removal-test',
        type: 'production',
    });
    await stores.featureToggleStore.create('default', {
        name: 'removal-test',
        createdByUserId: 9999,
    });
    await service.removeEnvironmentFromProject(
        'test-connection',
        'default',
        SYSTEM_USER_AUDIT,
    );
    await service.addEnvironmentToProject(
        'removal-test',
        'default',
        SYSTEM_USER_AUDIT,
    );
    let overview = await stores.featureStrategiesStore.getFeatureOverview({
        projectId: 'default',
    });
    expect(overview.length).toBeGreaterThan(0);
    overview.forEach((f) => {
        expect(f.environments).toEqual([
            {
                name: 'removal-test',
                enabled: false,
                sortOrder: 9999,
                type: 'production',
                variantCount: 0,
                lastSeenAt: null,
                hasStrategies: false,
                hasEnabledStrategies: false,
            },
        ]);
    });
    await service.removeEnvironmentFromProject(
        'removal-test',
        'default',
        SYSTEM_USER_AUDIT,
    );
    overview = await stores.featureStrategiesStore.getFeatureOverview({
        projectId: 'default',
    });
    expect(overview.length).toBeGreaterThan(0);
    overview.forEach((o) => {
        expect(o.environments).toEqual([]);
    });
    const { events } = await eventService.getEvents();
    expect(events[0]).toMatchObject({
        type: 'project-environment-removed',
        project: 'default',
        environment: 'removal-test',
        createdBy: SYSTEM_USER.username,
        createdByUserId: SYSTEM_USER.id,
    });
});

test('Adding same environment twice should throw a NameExistsError', async () => {
    await db.stores.environmentStore.create({
        name: 'uniqueness-test',
        type: 'production',
    });
    await service.addEnvironmentToProject(
        'uniqueness-test',
        'default',
        SYSTEM_USER_AUDIT,
    );

    await service.removeEnvironmentFromProject(
        'test-connection',
        'default',
        SYSTEM_USER_AUDIT,
    );
    await service.removeEnvironmentFromProject(
        'removal-test',
        'default',
        SYSTEM_USER_AUDIT,
    );

    return expect(async () =>
        service.addEnvironmentToProject(
            'uniqueness-test',
            'default',
            SYSTEM_USER_AUDIT,
        ),
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
            SYSTEM_USER_AUDIT,
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
        (env) => env.name === enabledEnvName,
    );

    const allOtherEnvironments = environments
        .filter((x) => x.name !== enabledEnvName)
        .map((env) => env.enabled);

    expect(targetedEnvironment?.enabled).toBe(true);
    expect(allOtherEnvironments.every((x) => !x)).toBe(true);
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
        (env) => env.name === enabledEnvName,
    );

    expect(targetedEnvironment?.enabled).toBe(true);
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
        createdByUserId: 9999,
    });

    await service.addEnvironmentToProject(
        disabledEnvName,
        'default',
        SYSTEM_USER_AUDIT,
    );

    await service.overrideEnabledProjects([enabledEnvName]);

    const projects = (
        await stores.projectStore.getEnvironmentsForProject('default')
    ).map((e) => e.environment);

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
        (env) => env.name === defaultEnvironment,
    );

    const allOtherEnvironments = environments
        .filter((x) => x.name !== defaultEnvironment)
        .map((env) => env.enabled);
    const envNames = environments.map((x) => x.name);

    expect(envNames).toContain('production');
    expect(envNames).toContain('development');
    expect(targetedEnvironment?.enabled).toBe(true);
    expect(allOtherEnvironments.every((x) => !x)).toBe(true);
});

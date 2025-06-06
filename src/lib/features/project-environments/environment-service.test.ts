import EnvironmentService from './environment-service.js';
import { createTestConfig } from '../../../test/config/test-config.js';
import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import NotFoundError from '../../error/notfound-error.js';
import {
    type IEnvironment,
    type IUnleashStores,
    SYSTEM_USER,
    SYSTEM_USER_AUDIT,
} from '../../types/index.js';
import NameExistsError from '../../error/name-exists-error.js';
import type { EventService } from '../../services/index.js';
import { createEventsService } from '../events/createEventsService.js';
import { test, beforeAll, afterAll, expect } from 'vitest';
let stores: IUnleashStores;
let db: ITestDb;
let service: EnvironmentService;
let eventService: EventService;
let createdEnvironment: IEnvironment;
let withApprovals: IEnvironment;

beforeAll(async () => {
    const config = createTestConfig();
    db = await dbInit('environment_service_serial', config.getLogger);
    stores = db.stores;
    eventService = createEventsService(db.rawDatabase, config);
    service = new EnvironmentService(stores, config, eventService);

    createdEnvironment = await db.stores.environmentStore.create({
        name: 'testenv',
        type: 'production',
    });

    withApprovals = await db.stores.environmentStore.create({
        name: 'approval_env',
        type: 'production',
        requiredApprovals: 1,
    });
});

afterAll(async () => {
    await db.destroy();
});

test('Can get environment', async () => {
    const retrieved = await service.get(createdEnvironment.name);
    expect(retrieved).toEqual(createdEnvironment);
});

test('Can get all', async () => {
    const environments = await service.getAll();
    expect(environments).toHaveLength(4); // the 2 created plus 'development' and 'production''
});

test('Can manage required approvals', async () => {
    const retrieved = await service.get(withApprovals.name);
    await db.stores.environmentStore.update(
        {
            type: 'production',
            protected: false,
            requiredApprovals: 2,
        },
        'approval_env',
    );

    const updated = await service.get('approval_env');
    const groupRetrieved = (await service.getAll()).find(
        (env) => env.name === 'approval_env',
    );
    const changeRequestEnvs =
        await db.stores.environmentStore.getChangeRequestEnvironments([
            'approval_env',
            'development',
            'other',
        ]);

    expect(retrieved).toEqual(withApprovals);
    expect(updated).toEqual({ ...withApprovals, requiredApprovals: 2 });
    expect(groupRetrieved).toMatchObject({
        ...withApprovals,
        requiredApprovals: 2,
    });
    expect(changeRequestEnvs).toEqual([
        { name: 'approval_env', requiredApprovals: 2 },
    ]);
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
    ).rejects.errorWithMessage(
        new NameExistsError(
            'default already has the environment uniqueness-test enabled',
        ),
    );
});

test('Removing environment not connected to project should be a noop', async () => {
    await expect(
        service.removeEnvironmentFromProject(
            'some-non-existing-environment',
            'default',
            SYSTEM_USER_AUDIT,
        ),
    ).resolves;
});

test('Trying to get an environment that does not exist throws NotFoundError', async () => {
    const envName = 'this-should-not-exist';
    await expect(async () => service.get(envName)).rejects.errorWithMessage(
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

test('Override works correctly when enabling a custom environment and disabling prod and dev', async () => {
    const newEnvironment = 'custom';
    await db.stores.environmentStore.create({
        name: newEnvironment,
        type: 'production',
    });
    await service.toggleEnvironment(newEnvironment, true);
    await service.overrideEnabledProjects([newEnvironment]);

    const environments = await service.getAll();
    const targetedEnvironment = environments.find(
        (env) => env.name === newEnvironment,
    );

    const allOtherEnvironments = environments
        .filter((x) => x.name !== newEnvironment)
        .map((env) => env.enabled);
    const envNames = environments.map((x) => x.name);

    expect(envNames).toContain('production');
    expect(envNames).toContain('development');
    expect(targetedEnvironment?.enabled).toBe(true);
    expect(allOtherEnvironments.every((x) => !x)).toBe(true);
});

test('getProjectEnvironments also includes whether or not a given project is visible on a given environment', async () => {
    const assertContains = (environments, envName, visible) => {
        const env = environments.find((e) => e.name === envName);
        expect(env).toBeDefined();
        expect(env.visible).toBe(visible);
    };

    const assertContainsVisible = (environments, envName) => {
        assertContains(environments, envName, true);
    };

    const assertContainsNotVisible = (environments, envName) => {
        assertContains(environments, envName, false);
    };

    const projectId = 'default';
    const firstEnvTest = 'some-connected-environment';
    const secondEnvTest = 'some-also-connected-environment';
    await db.stores.environmentStore.create({
        name: firstEnvTest,
        type: 'production',
    });
    await db.stores.environmentStore.create({
        name: secondEnvTest,
        type: 'production',
    });

    await service.addEnvironmentToProject(
        firstEnvTest,
        projectId,
        SYSTEM_USER_AUDIT,
    );
    await service.addEnvironmentToProject(
        secondEnvTest,
        projectId,
        SYSTEM_USER_AUDIT,
    );
    let environments = await service.getProjectEnvironments(projectId);
    assertContainsVisible(environments, firstEnvTest);
    assertContainsVisible(environments, secondEnvTest);

    await service.removeEnvironmentFromProject(
        firstEnvTest,
        projectId,
        SYSTEM_USER_AUDIT,
    );
    environments = await service.getProjectEnvironments(projectId);
    assertContainsNotVisible(environments, firstEnvTest);
    assertContainsVisible(environments, secondEnvTest);
});

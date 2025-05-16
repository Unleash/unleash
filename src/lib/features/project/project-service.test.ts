import { createTestConfig } from '../../../test/config/test-config.js';
import { BadDataError } from '../../error/index.js';
import {
    type IFlagResolver,
    type ProjectCreated,
    RoleName,
    TEST_AUDIT_USER,
} from '../../types/index.js';
import { createFakeProjectService } from './createProjectService.js';

import { vi } from 'vitest';

describe('enterprise extension: enable change requests', () => {
    const createService = (mode: 'oss' | 'enterprise' = 'enterprise') => {
        const config = createTestConfig();
        config.isEnterprise = mode === 'enterprise';
        const alwaysOnFlagResolver = {
            isEnabled() {
                return true;
            },
        } as unknown as IFlagResolver;
        config.flagResolver = alwaysOnFlagResolver;
        const {
            projectService,
            accessService,
            environmentStore,
            eventService,
            projectStore,
        } = createFakeProjectService(config);

        accessService.createRole(
            {
                name: RoleName.OWNER,
                description: 'Project owner',
                createdByUserId: -1,
            },
            TEST_AUDIT_USER,
        );

        return {
            service: projectService,
            environmentStore,
            eventService,
            projectStore,
        };
    };

    test('it calls the change request enablement function on enterprise after creating the project', async () => {
        expect.assertions(1);
        const { service, projectStore } = createService();

        const projectId = 'fake-project-id';
        await service.createProject(
            {
                id: projectId,
                name: 'fake-project-name',
                changeRequestEnvironments: [],
            },
            {
                id: 5,
                permissions: [],
                isAPI: false,
            },
            TEST_AUDIT_USER,
            async () => {
                const project = await projectStore.get(projectId);

                expect(project).toBeTruthy();

                return [];
            },
        );
    });

    test("it does not call the change request enablement function if we're not enterprise", async () => {
        const { service } = createService('oss');

        const fn = vi.fn() as () => Promise<
            { name: string; requiredApprovals: number }[] | undefined
        >;

        const projectId = 'fake-project-id';
        await service.createProject(
            {
                id: projectId,
                name: 'fake-project-name',
            },
            {
                id: 5,
                permissions: [],
                isAPI: false,
            },
            TEST_AUDIT_USER,
            fn,
        );

        expect(fn).not.toHaveBeenCalled();
    });

    test('the emitted event contains an empty list of changeRequestEnvironments if the input had none', async () => {
        expect.assertions(1);
        const { service, eventService } = createService();

        const projectId = 'fake-project-id';
        await service.createProject(
            {
                id: projectId,
                name: 'fake-project-name',
            },
            {
                id: 5,
                permissions: [],
                isAPI: false,
            },
            TEST_AUDIT_USER,
        );

        const { events } = await eventService.getEvents();
        expect(events).toMatchObject([
            {
                type: 'project-created',
                data: { changeRequestEnvironments: [] },
            },
        ]);
    });

    test('the emitted event contains no changeRequestEnvironments if we are not on enterprise', async () => {
        const { service, eventService } = createService('oss');

        const projectId = 'fake-project-id';
        await service.createProject(
            {
                id: projectId,
                name: 'fake-project-name',
            },
            {
                id: 5,
                permissions: [],
                isAPI: false,
            },
            TEST_AUDIT_USER,
            async () => [],
        );

        const { events } = await eventService.getEvents();
        expect(events[0].data.changeRequestEnvironments).toBeUndefined();
    });

    test('the emitted event contains the list of change request envs returned from the extension function, *not* what was passed in', async () => {
        const { service, environmentStore, eventService } = createService();
        await environmentStore.create({
            name: 'dev',
            type: 'production',
            enabled: true,
            protected: false,
            sortOrder: 0,
        });

        const crEnvs = [{ name: 'prod', requiredApprovals: 10 }];

        const projectId = 'fake-project-id';
        await service.createProject(
            {
                id: projectId,
                name: 'fake-project-name',
                changeRequestEnvironments: [
                    { name: 'dev', requiredApprovals: 1 },
                ],
            },
            {
                id: 5,
                permissions: [],
                isAPI: false,
            },
            TEST_AUDIT_USER,
            async () => crEnvs,
        );

        const { events } = await eventService.getEvents();
        expect(events).toMatchObject([
            {
                type: 'project-created',
                data: {
                    changeRequestEnvironments: [
                        { name: 'prod', requiredApprovals: 10 },
                    ],
                },
            },
        ]);
    });

    test('prefer env approval settings over explicit user approvals', async () => {
        const { service, environmentStore, eventService } = createService();
        await environmentStore.create({
            name: 'dev',
            type: 'production',
            enabled: true,
            protected: false,
            sortOrder: 0,
        });
        await environmentStore.create({
            name: 'stage',
            type: 'production',
            enabled: true,
            protected: false,
            sortOrder: 0,
            requiredApprovals: 2,
        });
        await environmentStore.create({
            name: 'prod',
            type: 'production',
            enabled: true,
            protected: false,
            sortOrder: 0,
            requiredApprovals: 3,
        });

        const projectId = 'fake-project-id';
        await service.createProject(
            {
                id: projectId,
                name: 'fake-project-name',
                environments: ['prod', 'stage'], // stage selected but no approvals set by user
                changeRequestEnvironments: [
                    { name: 'dev', requiredApprovals: 1 },
                    { name: 'prod', requiredApprovals: 10 }, // ignored in favor of env config
                ],
            },
            {
                id: 5,
                permissions: [],
                isAPI: false,
            },
            TEST_AUDIT_USER,
            async (envs) => envs as ProjectCreated['changeRequestEnvironments'],
        );

        const { events } = await eventService.getEvents();
        expect(events).toMatchObject([
            {
                type: 'project-created',
                data: {
                    changeRequestEnvironments: [
                        { name: 'dev', requiredApprovals: 1 },
                        { name: 'stage', requiredApprovals: 2 },
                        { name: 'prod', requiredApprovals: 3 },
                    ],
                },
            },
        ]);
    });

    test('the create project function returns the list of change request envs returned from the extension function, *not* what was passed in', async () => {
        const { service, environmentStore } = createService();
        await environmentStore.create({
            name: 'dev',
            type: 'production',
            enabled: true,
            protected: false,
            sortOrder: 0,
        });

        const crEnvs = [{ name: 'prod', requiredApprovals: 10 }];

        const projectId = 'fake-project-id';
        const result = await service.createProject(
            {
                id: projectId,
                name: 'fake-project-name',
                changeRequestEnvironments: [
                    { name: 'dev', requiredApprovals: 1 },
                ],
            },
            {
                id: 5,
                permissions: [],
                isAPI: false,
            },
            TEST_AUDIT_USER,
            async () => crEnvs,
        );

        expect(result.changeRequestEnvironments).toStrictEqual(crEnvs);
    });

    test('the create project function defaults to returning an empty list if the input had no cr envs', async () => {
        const { service } = createService();

        const projectId = 'fake-project-id';
        const result = await service.createProject(
            {
                id: projectId,
                name: 'fake-project-name',
            },
            {
                id: 5,
                permissions: [],
                isAPI: false,
            },
            TEST_AUDIT_USER,
            async () => [],
        );

        expect(result.changeRequestEnvironments).toStrictEqual([]);
    });

    test('the create project function does not return a list of change request envs if we are not on enterprise', async () => {
        const { service } = createService('oss');

        const crEnvs = [{ name: 'prod', requiredApprovals: 10 }];

        const projectId = 'fake-project-id';
        const result = await service.createProject(
            {
                id: projectId,
                name: 'fake-project-name',
                changeRequestEnvironments: [
                    { name: 'dev', requiredApprovals: 1 },
                ],
            },
            {
                id: 5,
                permissions: [],
                isAPI: false,
            },
            TEST_AUDIT_USER,
            async () => crEnvs,
        );

        expect('changeRequestEnvironments' in result).toBeFalsy();
    });

    test("it throws an error if you provide it with environments that don't exist", async () => {
        const { service } = createService();

        const projectId = 'fake-project-id';
        await expect(
            service.createProject(
                {
                    id: projectId,
                    name: 'fake-project-name',
                    changeRequestEnvironments: [
                        { name: 'dev', requiredApprovals: 1 },
                    ],
                },
                {
                    id: 5,
                    permissions: [],
                    isAPI: false,
                },
                TEST_AUDIT_USER,
            ),
        ).rejects.toThrow(BadDataError);
    });

    test("it does not throw if an error if you provide it with environments that don't exist but aren't on enterprise", async () => {
        const { service } = createService('oss');

        const projectId = 'fake-project-id';
        await expect(
            service.createProject(
                {
                    id: projectId,
                    name: 'fake-project-name',
                    changeRequestEnvironments: [
                        { name: 'dev', requiredApprovals: 1 },
                    ],
                },
                {
                    id: 5,
                    permissions: [],
                    isAPI: false,
                },
                TEST_AUDIT_USER,
            ),
        ).resolves.toBeTruthy();
    });
});

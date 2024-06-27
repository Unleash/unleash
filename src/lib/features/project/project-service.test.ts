import { createTestConfig } from '../../../test/config/test-config';
import { BadDataError } from '../../error';
import { type IBaseEvent, RoleName, TEST_AUDIT_USER } from '../../types';
import { createFakeProjectService } from './createProjectService';

describe('enterprise extension: enable change requests', () => {
    const createService = () => {
        const config = createTestConfig();
        const service = createFakeProjectService(config);
        // @ts-expect-error: we're setting this up to test the change request
        service.flagResolver = {
            isEnabled: () => true,
        };
        // @ts-expect-error: we're setting this up to test the change request
        service.isEnterprise = true;

        // @ts-expect-error: if we don't set this up, the tests will fail due to a missing role.
        service.accessService.createRole(
            {
                name: RoleName.OWNER,
                description: 'Project owner',
                createdByUserId: -1,
            },
            TEST_AUDIT_USER,
        );

        return service;
    };

    test('it calls the change request enablement function on enterprise after creating the project', async () => {
        expect.assertions(1);
        const service = createService();

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
                // @ts-expect-error: we want to verify that the project /has/
                // been created when calling the function.
                const project = await service.projectStore.get(projectId);

                expect(project).toBeTruthy();

                return [];
            },
        );
    });

    test("it does not call the change request enablement function if we're not enterprise", async () => {
        const service = createService();
        // @ts-expect-error
        service.isEnterprise = false;

        const fn = jest.fn();

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
        const service = createService();

        const storeEvent = async (e: IBaseEvent) => {
            expect(e.data.changeRequestEnvironments).toStrictEqual([]);
        };

        // @ts-expect-error: for testing purposes
        service.eventService.storeEvent = storeEvent;

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
    });

    test('the emitted event contains no changeRequestEnvironments if we are not on enterprise', async () => {
        expect.assertions(1);
        const service = createService();
        // @ts-expect-error
        service.isEnterprise = false;

        const storeEvent = async (e: IBaseEvent) => {
            expect('changeRequestEnvironments' in e.data).toBeFalsy();
        };

        // @ts-expect-error: for testing purposes
        service.eventService.storeEvent = storeEvent;

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
    });

    test('the emitted event contains the list of change request envs returned from the extension function, *not* what was passed in', async () => {
        expect.assertions(1);
        const service = createService();

        // @ts-expect-error: we want this to pass to test the functionality
        service.environmentStore.exists = () => true;

        const crEnvs = [{ name: 'prod', requiredApprovals: 10 }];

        const storeEvent = async (e: IBaseEvent) => {
            expect(e.data.changeRequestEnvironments).toMatchObject(crEnvs);
        };

        // @ts-expect-error: for testing purposes
        service.eventService.storeEvent = storeEvent;

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
    });

    test('the create project function returns the list of change request envs returned from the extension function, *not* what was passed in', async () => {
        const service = createService();

        const crEnvs = [{ name: 'prod', requiredApprovals: 10 }];

        // @ts-expect-error: we want this to pass to test the functionality
        service.environmentStore.exists = () => true;

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
        const service = createService();

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
        const service = createService();
        // @ts-expect-error
        service.isEnterprise = false;

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
        const service = createService();
        // @ts-expect-error
        service.environmentStore.exists = () => false;

        const projectId = 'fake-project-id';
        expect(
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
        const service = createService();
        // @ts-expect-error
        service.isEnterprise = false;
        // @ts-expect-error
        service.environmentStore.exists = () => false;

        const projectId = 'fake-project-id';
        expect(
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

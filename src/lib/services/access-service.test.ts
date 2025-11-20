import NameExistsError from '../error/name-exists-error.js';
import getLogger from '../../test/fixtures/no-logger.js';
import {
    createFakeAccessService,
    type FakeAccessServiceConfig,
} from '../features/access/createAccessService.js';
import {
    AccessService,
    type IRoleCreation,
    type IRoleValidation,
} from './access-service.js';
import { createTestConfig } from '../../test/config/test-config.js';
import { CUSTOM_ROOT_ROLE_TYPE } from '../util/constants.js';
import FakeGroupStore from '../../test/fixtures/fake-group-store.js';
import { FakeAccountStore } from '../../test/fixtures/fake-account-store.js';
import FakeRoleStore from '../../test/fixtures/fake-role-store.js';
import FakeEnvironmentStore from '../features/project-environments/fake-environment-store.js';
import FakeAccessStore from '../../test/fixtures/fake-access-store.js';
import { GroupService } from '../services/group-service.js';
import type {
    IRole,
    IRoleWithProject,
} from '../../lib/types/stores/access-store.js';
import {
    type IGroup,
    SYSTEM_USER,
    SYSTEM_USER_AUDIT,
} from '../../lib/types/index.js';
import BadDataError from '../../lib/error/bad-data-error.js';
import { createFakeEventsService } from '../../lib/features/events/createEventsService.js';
import { createFakeAccessReadModel } from '../features/access/createAccessReadModel.js';
import { ROLE_CREATED } from '../events/index.js';
import { expect } from 'vitest';

function getSetup(accessServiceConfig?: FakeAccessServiceConfig) {
    const config = createTestConfig({
        getLogger,
    });

    const { accessService, eventStore, accessStore } = createFakeAccessService(
        config,
        accessServiceConfig,
    );

    return {
        accessService,
        eventStore,
        accessStore,
        accessReadModel: createFakeAccessReadModel(accessStore),
    };
}

test('should fail when name exists', async () => {
    const { accessService } = getSetup();
    const existingRole = await accessService.createRole(
        {
            name: 'existing role',
            description: 'description',
            permissions: [],
            createdByUserId: -9999,
        },
        SYSTEM_USER_AUDIT,
    );

    await expect(() =>
        accessService.validateRole(existingRole),
    ).rejects.toThrowError(
        expect.errorWithMessage(
            new NameExistsError(
                `There already exists a role with the name ${existingRole.name}`,
            ),
        ),
    );
});

test('should validate a role without permissions', async () => {
    const { accessService } = getSetup();

    const withoutPermissions: IRoleValidation = {
        name: 'name of the role',
        description: 'description',
    };
    expect(await accessService.validateRole(withoutPermissions)).toEqual(
        withoutPermissions,
    );
});

test('should complete description field when not present', async () => {
    const { accessService } = getSetup();
    const withoutDescription: IRoleValidation = {
        name: 'name of the role',
    };
    expect(await accessService.validateRole(withoutDescription)).toEqual({
        name: 'name of the role',
        description: '',
    });
});

test('should accept empty permissions', async () => {
    const { accessService } = getSetup();
    const withEmptyPermissions: IRoleValidation = {
        name: 'name of the role',
        description: 'description',
        permissions: [],
    };
    expect(await accessService.validateRole(withEmptyPermissions)).toEqual({
        name: 'name of the role',
        description: 'description',
        permissions: [],
    });
});

test('should not accept empty names', async () => {
    const { accessService } = getSetup();
    const withWhitespaceName: IRoleValidation = {
        name: '    ',
        description: 'description',
        permissions: [],
    };

    await expect(
        accessService.validateRole(withWhitespaceName),
    ).rejects.toThrowError('"name" is not allowed to be empty');
});

test('should trim leading and trailing whitespace from names', async () => {
    const { accessService } = getSetup();
    const withUntrimmedName: IRoleValidation = {
        name: '   untrimmed ',
        description: 'description',
        permissions: [],
    };
    expect(await accessService.validateRole(withUntrimmedName)).toEqual({
        name: 'untrimmed',
        description: 'description',
        permissions: [],
    });
});

test('should complete environment field of permissions when not present', async () => {
    const { accessService } = getSetup();
    const withoutEnvironmentInPermissions: IRoleValidation = {
        name: 'name of the role',
        description: 'description',
        permissions: [
            {
                id: 1,
            },
        ],
    };
    expect(
        await accessService.validateRole(withoutEnvironmentInPermissions),
    ).toEqual({
        name: 'name of the role',
        description: 'description',
        permissions: [
            {
                id: 1,
                environment: '',
            },
        ],
    });
});

test('should return the same object when all fields are valid and present', async () => {
    const { accessService } = getSetup();

    const roleWithAllFields: IRoleValidation = {
        name: 'name of the role',
        description: 'description',
        permissions: [
            {
                id: 1,
                environment: 'development',
            },
        ],
    };
    expect(await accessService.validateRole(roleWithAllFields)).toEqual({
        name: 'name of the role',
        description: 'description',
        permissions: [
            {
                id: 1,
                environment: 'development',
            },
        ],
    });
});

test('should be able to validate and cleanup with additional properties', async () => {
    const { accessService } = getSetup();
    const base = {
        name: 'name of the role',
        description: 'description',
        additional: 'property',
        permissions: [
            {
                id: 1,
                environment: 'development',
                name: 'name',
                displayName: 'displayName',
                type: 'type',
                additional: 'property',
            },
        ],
    };
    expect(await accessService.validateRole(base)).toEqual({
        name: 'name of the role',
        description: 'description',
        permissions: [
            {
                id: 1,
                name: 'name',
                environment: 'development',
            },
        ],
    });
});

test('user with custom root role should get a user root role', async () => {
    const availablePermissions = [
        {
            id: 1,
            environment: 'development',
            name: 'fake',
            displayName: 'fake',
            type: '',
        },
        {
            id: 2,
            name: 'root-fake-permission',
            displayName: '',
            type: '',
        },
    ];
    const { accessService, eventStore } = getSetup({
        accessStoreConfig: { availablePermissions },
    });
    const createRoleInput: IRoleCreation = {
        name: 'custom-root-role',
        description: 'test custom root role',
        type: CUSTOM_ROOT_ROLE_TYPE,
        createdByUserId: -9999,
        permissions: [
            {
                id: 1,
                environment: 'development',
                name: 'fake',
            },
            {
                name: 'root-fake-permission',
            },
        ],
    };

    const customRootRole = await accessService.createRole(
        createRoleInput,
        SYSTEM_USER_AUDIT,
    );
    const user = {
        id: 1,
        rootRole: customRootRole.id,
    };
    await accessService.setUserRootRole(user.id, customRootRole.id);

    const role = await accessService.getRootRoleForUser(user.id);
    expect(role.name).toBe('custom-root-role');
    const events = await eventStore.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
        type: ROLE_CREATED,
        createdBy: SYSTEM_USER_AUDIT.username,
        createdByUserId: SYSTEM_USER.id,
        ip: SYSTEM_USER_AUDIT.ip,
        data: {
            id: 0,
            name: 'custom-root-role',
            description: 'test custom root role',
            type: CUSTOM_ROOT_ROLE_TYPE,
            // make sure we have a cleaned up version of permissions in the event
            permissions: [
                { environment: 'development', name: 'fake' },
                { name: 'root-fake-permission', environment: undefined },
            ],
        },
    });
});

test('throws error when trying to delete a project role in use by group', async () => {
    const groupIdResultOverride = async (): Promise<number[]> => {
        return [1];
    };
    const config = createTestConfig({
        getLogger,
    });

    const groupStore = new FakeGroupStore();
    groupStore.getAllWithId = async (): Promise<IGroup[]> => {
        return [{ id: 1, name: 'group' }];
    };
    const accountStore = new FakeAccountStore();
    const roleStore = new FakeRoleStore();
    const environmentStore = new FakeEnvironmentStore();
    const accessStore = new FakeAccessStore();
    accessStore.getGroupIdsForRole = groupIdResultOverride;
    accessStore.getUserIdsForRole = async (): Promise<number[]> => {
        return [];
    };
    accessStore.get = async (): Promise<IRole> => {
        return { id: 1, type: 'custom', name: 'project role' };
    };
    const eventService = createFakeEventsService(config);
    const groupService = new GroupService(
        { groupStore, accountStore },
        { getLogger },
        eventService,
    );

    const accessService = new AccessService(
        {
            accessStore,
            accountStore,
            roleStore,
            environmentStore,
        },
        config,
        groupService,
        eventService,
    );

    try {
        await accessService.deleteRole(1, SYSTEM_USER_AUDIT);
    } catch (e) {
        expect(e.toString()).toBe(
            'RoleInUseError: Role is in use by users(0) or groups(1). You cannot delete a role that is in use without first removing the role from the users and groups.',
        );
    }
});

describe('addAccessToProject', () => {
    test('should throw an error when you try add access with an empty list of roles', async () => {
        const { accessService } = getSetup();
        await expect(() =>
            accessService.addAccessToProject(
                [],
                [1],
                [1],
                'projectId',
                'createdBy',
            ),
        ).rejects.toThrow(BadDataError);
    });
});

test('should return true if user has admin role', async () => {
    const { accessReadModel, accessStore } = getSetup();

    const userId = 1;
    let calledWithSameId = false;
    // @ts-expect-error role is missing the project. Should admin have a project?
    const role: IRoleWithProject = {
        id: userId,
        name: 'ADMIN',
        type: 'custom',
    };
    accessStore.getRolesForUserId = (id: number) => {
        calledWithSameId = id === userId;
        return Promise.resolve([role]);
    };

    const result = await accessReadModel.isRootAdmin(userId);

    expect(result).toBe(true);
    expect(calledWithSameId).toBe(true);
});

test('should return false if user does not have admin role', async () => {
    const { accessReadModel, accessStore } = getSetup();

    const userId = 2;
    let calledWithSameId = false;
    // @ts-expect-error role is missing the project. Should admin have a project?
    const role: IRoleWithProject = { id: userId, name: 'user', type: 'custom' };
    accessStore.getRolesForUserId = (id: number) => {
        calledWithSameId = id === userId;
        return Promise.resolve([role]);
    };

    const result = await accessReadModel.isRootAdmin(userId);

    expect(result).toBe(false);
    expect(calledWithSameId).toBe(true);
});

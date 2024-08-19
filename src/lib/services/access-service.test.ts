import NameExistsError from '../error/name-exists-error';
import getLogger from '../../test/fixtures/no-logger';
import { createFakeAccessService } from '../features/access/createAccessService';
import {
    AccessService,
    type IRoleCreation,
    type IRoleValidation,
} from './access-service';
import { createTestConfig } from '../../test/config/test-config';
import { CUSTOM_ROOT_ROLE_TYPE } from '../util/constants';
import FakeGroupStore from '../../test/fixtures/fake-group-store';
import { FakeAccountStore } from '../../test/fixtures/fake-account-store';
import FakeRoleStore from '../../test/fixtures/fake-role-store';
import FakeEnvironmentStore from '../features/project-environments/fake-environment-store';
import AccessStoreMock from '../../test/fixtures/fake-access-store';
import { GroupService } from '../services/group-service';
import type { IRole } from '../../lib/types/stores/access-store';
import {
    type IGroup,
    ROLE_CREATED,
    SYSTEM_USER,
    SYSTEM_USER_AUDIT,
} from '../../lib/types';
import BadDataError from '../../lib/error/bad-data-error';
import { createFakeEventsService } from '../../lib/features/events/createEventsService';
import { createFakeAccessReadModel } from '../features/access/createAccessReadModel';

function getSetup() {
    const config = createTestConfig({
        getLogger,
    });

    const { accessService, eventStore, accessStore } =
        createFakeAccessService(config);

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

    expect(accessService.validateRole(existingRole)).rejects.toThrow(
        new NameExistsError(
            `There already exists a role with the name ${existingRole.name}`,
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
    const { accessService, eventStore } = getSetup();
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
    const accessStore = new AccessStoreMock();
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
    accessStore.getRolesForUserId = jest
        .fn()
        .mockResolvedValue([{ id: 1, name: 'ADMIN', type: 'custom' }]);

    const result = await accessReadModel.isRootAdmin(userId);

    expect(result).toBe(true);
    expect(accessStore.getRolesForUserId).toHaveBeenCalledWith(userId);
});

test('should return false if user does not have admin role', async () => {
    const { accessReadModel, accessStore } = getSetup();

    const userId = 2;
    accessStore.getRolesForUserId = jest
        .fn()
        .mockResolvedValue([{ id: 2, name: 'user', type: 'custom' }]);

    const result = await accessReadModel.isRootAdmin(userId);

    expect(result).toBe(false);
    expect(accessStore.getRolesForUserId).toHaveBeenCalledWith(userId);
});

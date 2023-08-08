import NameExistsError from '../error/name-exists-error';
import getLogger from '../../test/fixtures/no-logger';
import { createFakeAccessService } from '../features/access/createAccessService';
import { AccessService, IRoleValidation } from './access-service';
import { createTestConfig } from '../../test/config/test-config';
import { CUSTOM_ROOT_ROLE_TYPE } from '../util/constants';
import FakeGroupStore from '../../test/fixtures/fake-group-store';
import { FakeAccountStore } from '../../test/fixtures/fake-account-store';
import FakeRoleStore from '../../test/fixtures/fake-role-store';
import FakeEnvironmentStore from '../../test/fixtures/fake-environment-store';
import AccessStoreMock from '../../test/fixtures/fake-access-store';
import { GroupService } from '../services/group-service';
import FakeEventStore from '../../test/fixtures/fake-event-store';
import { IRole } from 'lib/types/stores/access-store';
import { IGroup } from 'lib/types';

function getSetup(customRootRoles: boolean = false) {
    const config = createTestConfig({
        getLogger,
        experimental: {
            flags: {
                customRootRoles: customRootRoles,
            },
        },
    });

    return {
        accessService: createFakeAccessService(config),
    };
}

test('should fail when name exists', async () => {
    const { accessService } = getSetup();
    const existingRole = await accessService.createRole({
        name: 'existing role',
        description: 'description',
        permissions: [],
    });

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
                environment: 'development',
            },
        ],
    });
});

test('user with custom root role should get a user root role', async () => {
    const { accessService } = getSetup(true);
    const customRootRole = await accessService.createRole({
        name: 'custom-root-role',
        description: 'test custom root role',
        type: CUSTOM_ROOT_ROLE_TYPE,
        permissions: [],
    });
    const user = {
        id: 1,
        rootRole: customRootRole.id,
    };
    await accessService.setUserRootRole(user.id, customRootRole.id);

    const roles = await accessService.getUserRootRoles(user.id);
    expect(roles).toHaveLength(1);
    expect(roles[0].name).toBe('custom-root-role');
});

test('throws error when trying to delete a project role in use by group', async () => {
    const groupIdResultOverride = async (): Promise<number[]> => {
        return [1];
    };
    const config = createTestConfig({
        getLogger,
        experimental: {
            flags: {
                customRootRoles: false,
            },
        },
    });

    const eventStore = new FakeEventStore();
    const groupStore = new FakeGroupStore();
    groupStore.getAllWithId = async (): Promise<IGroup[]> => {
        return [{ name: 'group' }];
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
    const groupService = new GroupService(
        { groupStore, eventStore, accountStore },
        { getLogger },
    );

    const accessService = new AccessService(
        {
            accessStore,
            accountStore,
            roleStore,
            environmentStore,
            groupStore,
        },
        config,
        groupService,
    );

    try {
        await accessService.deleteRole(1);
    } catch (e) {
        expect(e.toString()).toBe(
            'RoleInUseError: Role is in use by one or more users or groups. You cannot delete a role that is in use without first removing the role from the users and groups.',
        );
    }
});

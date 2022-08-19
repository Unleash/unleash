import NameExistsError from '../error/name-exists-error';
import getLogger from '../../test/fixtures/no-logger';
import createStores from '../../test/fixtures/store';
import { AccessService, IRoleValidation } from './access-service';

function getSetup(withNameInUse: boolean) {
    const stores = createStores();

    stores.roleStore = {
        ...stores.roleStore,
        async nameInUse(): Promise<boolean> {
            return withNameInUse;
        },
    };
    return {
        accessService: new AccessService(
            stores,
            {
                getLogger,
            },
            undefined, // GroupService
        ),
        stores,
    };
}
test('should fail when name exists', async () => {
    const { accessService } = getSetup(true);

    const existingRole: IRoleValidation = {
        name: 'existing role',
        description: 'description',
    };
    expect(accessService.validateRole(existingRole)).rejects.toThrow(
        new NameExistsError(
            `There already exists a role with the name ${existingRole.name}`,
        ),
    );
});

test('should validate a role without permissions', async () => {
    const { accessService } = getSetup(false);

    const withoutPermissions: IRoleValidation = {
        name: 'name of the role',
        description: 'description',
    };
    expect(await accessService.validateRole(withoutPermissions)).toEqual(
        withoutPermissions,
    );
});

test('should complete description field when not present', async () => {
    const { accessService } = getSetup(false);
    const withoutDescription: IRoleValidation = {
        name: 'name of the role',
    };
    expect(await accessService.validateRole(withoutDescription)).toEqual({
        name: 'name of the role',
        description: '',
    });
});

test('should accept empty permissions', async () => {
    const { accessService } = getSetup(false);
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
    const { accessService } = getSetup(false);
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
    const { accessService } = getSetup(false);

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
    const { accessService } = getSetup(false);
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

import NameExistsError from '../error/name-exists-error';
import getLogger from '../../test/fixtures/no-logger';
import createStores from '../../test/fixtures/store';
import {
    AccessService,
    IRoleCreation,
    IRoleValidation,
} from './access-service';

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

    const test1: IRoleValidation = {
        name: 'existing role',
        description: 'description',
    };
    expect(accessService.validateRole(test1)).rejects.toThrow(
        new NameExistsError(
            `There already exists a role with the name ${test1.name}`,
        ),
    );
});

test('should be able to validate different role shapes', async () => {
    const { accessService } = getSetup(false);

    const test1: IRoleValidation = {
        name: 'name of the role',
        description: 'description',
    };
    expect(await accessService.validateRole(test1)).toEqual(test1);

    const test2: IRoleValidation = {
        name: 'name of the role',
    };
    expect(await accessService.validateRole(test2)).toEqual({
        ...test2,
        description: '',
    });

    const test3: IRoleValidation = {
        name: 'name of the role',
        permissions: [],
    };
    expect(await accessService.validateRole(test3)).toEqual({
        ...test3,
        description: '',
        permissions: [],
    });

    const test4: IRoleValidation = {
        name: 'name of the role',
        permissions: [
            {
                id: 1,
            },
        ],
    };
    expect(await accessService.validateRole(test4)).toEqual({
        ...test4,
        description: '',
        permissions: [
            {
                id: 1,
                environment: '',
            },
        ],
    });

    const test5: IRoleValidation = {
        name: 'name of the role',
        description: 'description',
        permissions: [
            {
                id: 1,
                environment: 'development',
            },
        ],
    };
    expect(await accessService.validateRole(test5)).toEqual({
        ...test5,
        permissions: [
            {
                id: 1,
                environment: 'development',
            },
        ],
    });
});

test('should be able to validate with IRoleCreation', async () => {
    const { accessService } = getSetup(false);
    const test: IRoleCreation = {
        name: 'name of the role',
        description: 'description',
        permissions: [
            {
                id: 1,
                environment: 'development',
                name: 'name',
                displayName: 'displayName',
                type: 'type',
            },
        ],
    };
    expect(await accessService.validateRole(test)).toEqual({
        ...test,
        permissions: [
            {
                id: 1,
                environment: 'development',
            },
        ],
    });
});

test('should be able to validate with IRoleCreation and additional properties', async () => {
    const { accessService } = getSetup(false);
    const base: IRoleCreation = {
        name: 'name of the role',
        description: 'description',
        permissions: [
            {
                id: 1,
                environment: 'development',
                name: 'name',
                displayName: 'displayName',
                type: 'type',
            },
        ],
    };
    let extended = { ...base, additional: 'property' };
    expect(await accessService.validateRole(extended)).toEqual({
        ...base,
        permissions: [
            {
                id: 1,
                environment: 'development',
            },
        ],
    });
});

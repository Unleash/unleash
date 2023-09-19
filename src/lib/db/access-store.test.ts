import dbInit from '../../test/e2e/helpers/database-init';
import getLogger from '../../test/fixtures/no-logger';
import { PermissionRef } from 'lib/services/access-service';
import { AccessStore } from './access-store';

let db;

beforeAll(async () => {
    db = await dbInit('feature_strategy_store_serial', getLogger);
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});

// Helper function to make the test cases more readable
const args = (permissions: PermissionRef[], expectations?: PermissionRef[]) => {
    if (expectations) {
        return [permissions, expectations];
    } else {
        return [permissions];
    }
};

test('resolvePermissions returns empty list if undefined', async () => {
    const access = db.stores.accessStore as AccessStore;
    const result = await access.resolvePermissions(
        undefined as unknown as PermissionRef[],
    );
    expect(result).toStrictEqual([]);
});

test('resolvePermissions returns empty list if empty list', async () => {
    const access = db.stores.accessStore as AccessStore;
    const result = await access.resolvePermissions(
        [] as PermissionRef[],
    );
    expect(result).toStrictEqual([]);
});

test.each([
    args([{ id: 1 }]),
    args([{ id: 4, environment: 'development' }]),
    args([{ id: 4, name: 'should keep the id' }]),
    args([
        { id: 1, environment: 'development' },
        { id: 2, name: 'ignore this name' },
    ]),
])(
    'resolvePermissions with permission ids (%o) returns the list unmodified',
    async (permissions) => {
        const access = db.stores.accessStore as AccessStore;
        const result = await access.resolvePermissions(permissions);
        expect(result).toStrictEqual(permissions);
    },
);

test.each([
    args(
        [{ name: 'CREATE_CONTEXT_FIELD' }],
        [{ id: 18, name: 'CREATE_CONTEXT_FIELD' }],
    ),
    args(
        [{ name: 'CREATE_FEATURE', environment: 'development' }],
        [{ id: 2, name: 'CREATE_FEATURE', environment: 'development' }],
    ),
    args(
        [
            { name: 'CREATE_CONTEXT_FIELD' },
            { name: 'CREATE_FEATURE', environment: 'development' },
        ],
        [
            { id: 18, name: 'CREATE_CONTEXT_FIELD' },
            { id: 2, name: 'CREATE_FEATURE', environment: 'development' },
        ],
    ),
])(
    'resolvePermissions with permission names (%o) will inject the ids',
    async (permissions, expected) => {
        const access = db.stores.accessStore as AccessStore;
        const result = await access.resolvePermissions(permissions);
        expect(result).toStrictEqual(expected);
    },
);

test.each([
    args(
        [
            { name: 'CREATE_CONTEXT_FIELD' },
            { id: 3 },
            { name: 'CREATE_FEATURE', environment: 'development' },
            { id: 15, environment: 'development' },
            { name: 'UPDATE_FEATURE', environment: 'development' },
        ],
        [
            { id: 18, name: 'CREATE_CONTEXT_FIELD' },
            { id: 3 },
            { id: 2, name: 'CREATE_FEATURE', environment: 'development' },
            { id: 15, environment: 'development' },
            { id: 7, name: 'UPDATE_FEATURE', environment: 'development' },
        ],
    ),
])(
    'resolvePermissions mixed ids and names (%o) will inject the ids where they are missing',
    async (permissions, expected) => {
        const access = db.stores.accessStore as AccessStore;
        const result = await access.resolvePermissions(permissions);
        expect(result).toStrictEqual(expected);
    },
);

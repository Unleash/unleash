import {
    createGetReadOnlyUsers,
    type GetReadOnlyUsers,
} from './getReadOnlyUsers.js';
import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../test/fixtures/no-logger.js';

let db: ITestDb;
let getReadOnlyUsers: GetReadOnlyUsers;
let _viewerRoleId: number;

beforeAll(async () => {
    db = await dbInit('read_only_users_serial', getLogger);
    getReadOnlyUsers = createGetReadOnlyUsers(db.rawDatabase);
});

afterEach(async () => {
    await db.rawDatabase('events').delete();
    await db.rawDatabase('role_user').delete();
    await db.rawDatabase('users').delete();
});

afterAll(async () => {
    await db.destroy();
});

test('should count user with Viewer root role and no events', async () => {
    const [user] = await db
        .rawDatabase('users')
        .insert({
            email: 'viewer@example.com',
            name: 'Viewer User',
            is_system: false,
            is_service: false,
        })
        .returning('id');

    await db.rawDatabase('role_user').insert({
        role_id: 3,
        user_id: user.id,
        project: '*',
    });

    await expect(getReadOnlyUsers()).resolves.toEqual(1);
});

import dbInit, { ITestDb } from '../helpers/database-init';
import getLogger from '../../fixtures/no-logger';
import { createTestConfig } from '../../config/test-config';
import { GroupService } from '../../../lib/services/group-service';

let stores;
let db: ITestDb;

let groupService: GroupService;
let user;

beforeAll(async () => {
    db = await dbInit('group_service_serial', getLogger);
    stores = db.stores;
    user = await stores.userStore.insert({
        name: 'Some Name',
        email: 'test@getunleash.io',
    });
    const config = createTestConfig({
        getLogger,
    });
    groupService = new GroupService(stores, config);
});

afterAll(async () => {
    await db.destroy();
});

afterEach(async () => {});

test('should have default project', async () => {
    const project = await groupService.syncExternalGroups(user.id, [
        'dev',
        'maintainer',
    ]);
    expect(project).toBeDefined();
});

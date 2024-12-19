import getLogger from '../../../fixtures/no-logger';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper';
import dbInit from '../../helpers/database-init';
import type { ITestDb } from '../../helpers/database-init';
import type { IAuditUser, IUser } from '../../../../lib/types';

let app: IUnleashTest;
let db: ITestDb;
let testUser: IUser;
const auditUser = {
    username: 'audituser',
    id: -42,
    ip: 'localhost',
} as IAuditUser;

let userIndex = 0;
const createUser = async (role?: number) => {
    const name = `User ${userIndex}`;
    const email = `user-${userIndex}@getunleash.io`;
    userIndex++;

    const { userStore } = db.stores;
    return userStore.insert({ name, email });
};

beforeAll(async () => {
    db = await dbInit('feature_api_client_is_oss', getLogger, { isOss: true });
    app = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                },
            },
            isOss: true,
        },
        db.rawDatabase,
    );
    testUser = await createUser();
    await app.services.projectService.createProject(
        { id: 'secondproject', name: 'Second project not returned when oss' },
        testUser,
        auditUser,
    );
    await app.services.featureToggleService.createFeatureToggle(
        'secondproject',
        {
            name: 'my.feature.toggle',
        },
        auditUser,
        true,
    );
    await app.services.featureToggleService.createFeatureToggle(
        'default',
        {
            name: 'my.default.toggle',
        },
        auditUser,
        true,
    );
});
afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

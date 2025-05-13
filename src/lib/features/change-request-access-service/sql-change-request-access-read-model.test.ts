import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import { createChangeRequestAccessReadModel } from './createChangeRequestAccessReadModel.js';
import { createTestConfig } from '../../../test/config/test-config.js';
import type { IChangeRequestAccessReadModel } from './change-request-access-read-model.js';

let db: ITestDb;

let readModel: IChangeRequestAccessReadModel;

beforeAll(async () => {
    db = await dbInit('change_request_access_read_model', getLogger);

    const config = createTestConfig({
        getLogger,
    });

    readModel = createChangeRequestAccessReadModel(db.rawDatabase, config);
});

afterAll(async () => {
    await db.destroy();
});

test(`Should indicate change request enabled status`, async () => {
    // no change requests
    const defaultStatus =
        await readModel.isChangeRequestsEnabledForProject('default');
    expect(defaultStatus).toBe(false);

    // change request enabled in enabled environment
    await db.rawDatabase('change_request_settings').insert({
        project: 'default',
        environment: 'development',
        required_approvals: 1,
    });
    const enabledStatus =
        await readModel.isChangeRequestsEnabledForProject('default');
    expect(enabledStatus).toBe(true);

    // change request enabled in disabled environment
    await db.stores.projectStore.deleteEnvironmentForProject(
        'default',
        'development',
    );
    const disabledStatus =
        await readModel.isChangeRequestsEnabledForProject('default');
    expect(disabledStatus).toBe(false);
});

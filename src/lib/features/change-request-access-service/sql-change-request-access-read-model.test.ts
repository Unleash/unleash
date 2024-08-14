import dbInit, { type ITestDb } from '../../../test/e2e/helpers/database-init';
import getLogger from '../../../test/fixtures/no-logger';
import { createChangeRequestAccessReadModel } from './createChangeRequestAccessReadModel';
import { createTestConfig } from '../../../test/config/test-config';
import type { IChangeRequestAccessReadModel } from './change-request-access-read-model';

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

test(`Should indicate change request enabled`, async () => {
    const defaultStatus =
        await readModel.isChangeRequestsEnabledForProject('default');

    expect(defaultStatus).toBe(false);

    await db.rawDatabase('change_request_settings').insert({
        project: 'default',
        environment: 'default',
        required_approvals: 1,
    });

    const enabledStatus =
        await readModel.isChangeRequestsEnabledForProject('default');
    expect(enabledStatus).toBe(true);

    await db.stores.projectStore.deleteEnvironmentForProject(
        'default',
        'default',
    );

    const disabledStatus =
        await readModel.isChangeRequestsEnabledForProject('default');
    expect(disabledStatus).toBe(false);
});

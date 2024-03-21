import dbInit, { type ITestDb } from '../../../test/e2e/helpers/database-init';
import getLogger from '../../../test/fixtures/no-logger';
import type { IUser } from '../../types';
import type { IProjectInsightsReadModel } from './project-insights-read-model-type';
import {
    type ChangeRequestDBState,
    ProjectInsightsReadModel,
} from './project-insights-read-model';

let projectInsightsReadModel: IProjectInsightsReadModel;
let user: IUser;
let db: ITestDb;
const projectId = 'default';

beforeAll(async () => {
    db = await dbInit('project_insights_read_model', getLogger);
    projectInsightsReadModel = new ProjectInsightsReadModel(db.rawDatabase);
    user = await db.stores.userStore.insert({
        username: 'test',
    });
});

afterAll(async () => {
    await db.destroy();
});

beforeEach(async () => {
    await db.rawDatabase.table('change_requests').delete();
});

const createChangeRequest = (id: number, state: string) =>
    db.rawDatabase.table('change_requests').insert({
        id,
        state,
        environment: 'default',
        project: projectId,
        created_by: user.id,
    });

test('can read change request status counts', async () => {
    const states: ChangeRequestDBState[] = [
        'Approved',
        'Approved',
        'Applied',
        'Rejected',
        'Scheduled',
        'In review',
        'Draft',
        'Cancelled',
    ];
    await Promise.all(
        states.map((state, id) => createChangeRequest(id, state)),
    );

    const changeRequests =
        await projectInsightsReadModel.getChangeRequests(projectId);

    expect(changeRequests).toEqual({
        total: 6,
        approved: 2,
        applied: 1,
        rejected: 1,
        reviewRequired: 1,
        scheduled: 1,
    });
});

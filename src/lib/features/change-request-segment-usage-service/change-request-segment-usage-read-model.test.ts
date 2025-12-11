import type { IUser } from '../../types/index.js';
import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import type { IChangeRequestSegmentUsageReadModel } from './change-request-segment-usage-read-model.js';
import { createChangeRequestSegmentUsageReadModel } from './createChangeRequestSegmentUsageReadModel.js';
import { DEFAULT_ENV, randomId } from '../../util/index.js';

let db: ITestDb;
let user: IUser;
let user2: IUser;

const CR_ID = 123456;
const CR_ID_2 = 234567;

const CR_TITLE = 'My change request';

const FLAG_NAME = 'crarm-test-flag';

let readModel: IChangeRequestSegmentUsageReadModel;

beforeAll(async () => {
    db = await dbInit('change_request_segment_usage_read_model', getLogger);

    user = await db.stores.userStore.insert({
        username: 'cr-creator',
    });

    user2 = await db.stores.userStore.insert({
        username: 'cr-creator-2',
    });

    readModel = createChangeRequestSegmentUsageReadModel(db.rawDatabase);

    await db.stores.featureToggleStore.create('default', {
        name: FLAG_NAME,
        createdByUserId: 9999,
    });
});

afterAll(async () => {
    await db.destroy();
});

afterEach(async () => {
    await db.rawDatabase
        .table('change_requests')
        .where('id', CR_ID)
        .orWhere('id', CR_ID_2)
        .delete();

    await db.rawDatabase
        .table('change_request_events')
        .where('change_request_id', CR_ID)
        .orWhere('change_request_id', CR_ID_2)
        .delete();
});

const createCR = async (
    state,
    changeRequestId = CR_ID,
    changeRequestTitle: string | null = CR_TITLE,
    userId = user.id,
) => {
    await db.rawDatabase.table('change_requests').insert({
        id: changeRequestId,
        environment: DEFAULT_ENV,
        state,
        project: 'default',
        created_by: userId,
        created_at: '2023-01-01 00:00:00',
        min_approvals: 1,
        title: changeRequestTitle,
    });
};

const addChangeRequestChange = async (
    flagName,
    action,
    change,
    changeRequestId,
) => {
    await db.rawDatabase.table('change_request_events').insert({
        feature: flagName,
        action,
        payload: change,
        created_at: '2023-01-01 00:01:00',
        change_request_id: changeRequestId,
        created_by: user.id,
    });
};

const addStrategyToCr = async (
    segmentId: number,
    flagName: string,
    changeRequestId = CR_ID,
) => {
    await addChangeRequestChange(
        flagName,
        'addStrategy',
        {
            name: 'flexibleRollout',
            title: '',
            disabled: false,
            segments: [segmentId],
            variants: [],
            parameters: {
                groupId: flagName,
                rollout: '100',
                stickiness: 'default',
            },
            constraints: [],
        },
        changeRequestId,
    );
};

const updateStrategyInCr = async (
    strategyId: string,
    segmentId: number,
    flagName: string,
    changeRequestId = CR_ID,
) => {
    await addChangeRequestChange(
        flagName,
        'updateStrategy',
        {
            id: strategyId,
            name: 'flexibleRollout',
            title: '',
            disabled: false,
            segments: [segmentId],
            variants: [],
            parameters: {
                groupId: flagName,
                rollout: '100',
                stickiness: 'default',
            },
            constraints: [],
        },
        changeRequestId,
    );
};

test.each([
    ['Draft', true],
    ['In review', true],
    ['Scheduled', true],
    ['Approved', true],
    ['Rejected', false],
    ['Cancelled', false],
    ['Applied', false],
])('addStrategy events in %s CRs should show up only if the CR is active', async (state, isActiveCr) => {
    await createCR(state);

    const segmentId = 3;

    await addStrategyToCr(segmentId, FLAG_NAME);

    const result =
        await readModel.getStrategiesUsedInActiveChangeRequests(segmentId);
    if (isActiveCr) {
        expect(result).toStrictEqual([
            {
                projectId: 'default',
                strategyName: 'flexibleRollout',
                environment: DEFAULT_ENV,
                featureName: FLAG_NAME,
                changeRequest: { id: CR_ID, title: CR_TITLE },
            },
        ]);
    } else {
        expect(result).toStrictEqual([]);
    }
});

test.each([
    ['Draft', true],
    ['In review', true],
    ['Scheduled', true],
    ['Approved', true],
    ['Rejected', false],
    ['Cancelled', false],
    ['Applied', false],
])(`updateStrategy events in %s CRs should show up only if the CR is active`, async (state, isActiveCr) => {
    await createCR(state);

    const segmentId = 3;

    const strategyId = randomId();
    await updateStrategyInCr(strategyId, segmentId, FLAG_NAME);

    const result =
        await readModel.getStrategiesUsedInActiveChangeRequests(segmentId);

    if (isActiveCr) {
        expect(result).toMatchObject([
            {
                id: strategyId,
                projectId: 'default',
                strategyName: 'flexibleRollout',
                environment: DEFAULT_ENV,
                featureName: FLAG_NAME,
                changeRequest: { id: CR_ID, title: CR_TITLE },
            },
        ]);
    } else {
        expect(result).toStrictEqual([]);
    }
});

test(`If the same strategy appears in multiple CRs with the same segment, each segment should be listed as its own entry`, async () => {
    await createCR('In review', CR_ID, CR_TITLE);
    await createCR('In review', CR_ID_2, null, user2.id);

    const segmentId = 3;
    const strategyId = randomId();

    await updateStrategyInCr(strategyId, segmentId, FLAG_NAME, CR_ID);
    await updateStrategyInCr(strategyId, segmentId, FLAG_NAME, CR_ID_2);

    const result =
        await readModel.getStrategiesUsedInActiveChangeRequests(segmentId);

    expect(result).toHaveLength(2);

    expect(result).toContainEqual({
        id: strategyId,
        projectId: 'default',
        strategyName: 'flexibleRollout',
        environment: DEFAULT_ENV,
        featureName: FLAG_NAME,
        changeRequest: { id: CR_ID, title: CR_TITLE },
    });
    expect(result).toContainEqual({
        id: strategyId,
        projectId: 'default',
        strategyName: 'flexibleRollout',
        environment: DEFAULT_ENV,
        featureName: FLAG_NAME,
        changeRequest: { id: CR_ID_2, title: null },
    });
});

import { IUser } from 'lib/server-impl';
import dbInit, { ITestDb } from '../../../test/e2e/helpers/database-init';
import getLogger from '../../../test/fixtures/no-logger';
import { IChangeRequestSegmentUsageReadModel } from './change-request-segment-usage-read-model';
import { createChangeRequestSegmentUsageReadModel } from './createChangeRequestSegmentUsageReadModel';
import { randomId } from '../../../lib/util';

let db: ITestDb;
let user: IUser;

const CR_ID = 123456;
const CR_ID_2 = 234567;
const FLAG_NAME = 'crarm-test-flag';

let readModel: IChangeRequestSegmentUsageReadModel;

beforeAll(async () => {
    db = await dbInit('change_request_access_read_model_serial', getLogger);

    user = await db.stores.userStore.insert({
        username: 'cr-creator',
    });

    readModel = createChangeRequestSegmentUsageReadModel(db.rawDatabase);

    await db.stores.featureToggleStore.create('default', {
        name: FLAG_NAME,
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

const createCR = async (state, changeRequestId = CR_ID) => {
    await db.rawDatabase.table('change_requests').insert({
        id: changeRequestId,
        environment: 'default',
        state,
        project: 'default',
        created_by: user.id,
        created_at: '2023-01-01 00:00:00',
        min_approvals: 1,
        title: 'My change request',
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
])(
    'addStrategy events in %s CRs should show up only of the CR is active',
    async (state, isActiveCr) => {
        await createCR(state);

        const segmentId = 3;

        await addStrategyToCr(segmentId, FLAG_NAME);

        const result = await readModel.getStrategiesUsedInActiveChangeRequests(
            segmentId,
        );
        if (isActiveCr) {
            expect(result).toStrictEqual([
                {
                    projectId: 'default',
                    strategyName: 'flexibleRollout',
                    environment: 'default',
                    featureName: FLAG_NAME,
                    changeRequestIds: [CR_ID],
                },
            ]);
        } else {
            expect(result).toStrictEqual([]);
        }
    },
);

test.each([
    ['Draft', true],
    ['In review', true],
    ['Scheduled', true],
    ['Approved', true],
    ['Rejected', false],
    ['Cancelled', false],
    ['Applied', false],
])(
    `updateStrategy events in %s CRs should show up only of the CR is active`,
    async (state, isActiveCr) => {
        await createCR(state);

        const segmentId = 3;

        const strategyId = randomId();
        await updateStrategyInCr(strategyId, segmentId, FLAG_NAME);

        const result = await readModel.getStrategiesUsedInActiveChangeRequests(
            segmentId,
        );

        if (isActiveCr) {
            expect(result).toMatchObject([
                {
                    id: strategyId,
                    projectId: 'default',
                    strategyName: 'flexibleRollout',
                    environment: 'default',
                    featureName: FLAG_NAME,
                    changeRequestIds: [CR_ID],
                },
            ]);
        } else {
            expect(result).toStrictEqual([]);
        }
    },
);

test(`If the same strategy appears in multiple CRs with the same segment, they should all be listed in its changeRequestIds`, async () => {
    await createCR('In review', CR_ID);
    await createCR('In review', CR_ID_2);

    const segmentId = 3;
    const strategyId = randomId();

    await updateStrategyInCr(strategyId, segmentId, FLAG_NAME, CR_ID);
    await updateStrategyInCr(strategyId, segmentId, FLAG_NAME, CR_ID_2);

    const result = await readModel.getStrategiesUsedInActiveChangeRequests(
        segmentId,
    );

    expect(result).toHaveLength(1);

    expect(result).toMatchObject([
        {
            id: strategyId,
            projectId: 'default',
            strategyName: 'flexibleRollout',
            environment: 'default',
            featureName: FLAG_NAME,
        },
    ]);

    const crIds = result[0].changeRequestIds;
    expect(crIds).toContain(CR_ID);
    expect(crIds).toContain(CR_ID_2);
    expect(crIds).toHaveLength(2);
});

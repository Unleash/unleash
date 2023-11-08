import { IUser } from 'lib/server-impl';
import {
    IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../test/e2e/helpers/test-helper';
import dbInit, { ITestDb } from '../../../test/e2e/helpers/database-init';
import getLogger from '../../../test/fixtures/no-logger';
import { IChangeRequestAccessReadModel } from './change-request-access-read-model';
import { createChangeRequestAccessReadModel } from './createChangeRequestAccessReadModel';
import { randomId } from '../../../lib/util';

let db: ITestDb;
let app: IUnleashTest;
let user: IUser;

const CR_ID = 123456;
const FLAG_NAME = 'crarm-test-flag';

let readModel: IChangeRequestAccessReadModel;

beforeAll(async () => {
    db = await dbInit('change_request_access_read_model_serial', getLogger);
    app = await setupAppWithCustomConfig(db.stores, {
        experimental: {
            flags: {
                strictSchemaValidation: true,
                anonymiseEventLog: true,
            },
        },
    });

    user = await db.stores.userStore.insert({
        username: 'cr-creator',
    });

    readModel = createChangeRequestAccessReadModel(db.rawDatabase, app.config);

    await db.stores.featureToggleStore.create('default', {
        name: FLAG_NAME,
    });
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

afterEach(async () => {
    await db.rawDatabase.table('change_requests').where('id', CR_ID).delete();
    await db.rawDatabase
        .table('change_request_events')
        .where('change_request_id', CR_ID)
        .delete();
});

const createCR = async (state) => {
    await db.rawDatabase.table('change_requests').insert({
        id: CR_ID,
        environment: 'default',
        state,
        project: 'default',
        created_by: user.id,
        created_at: '2023-01-01 00:00:00',
        min_approvals: 1,
        title: 'My change request',
    });
};

const addChangeRequestChange = async (flagName, action, change) => {
    await db.rawDatabase.table('change_request_events').insert({
        feature: flagName,
        action,
        payload: change,
        created_at: '2023-01-01 00:01:00',
        change_request_id: CR_ID,
        created_by: user.id,
    });
};

const addStrategyPayload = (segmentId: number, groupId: string) => ({
    name: 'flexibleRollout',
    title: '',
    disabled: false,
    segments: [segmentId],
    variants: [],
    parameters: {
        groupId,
        rollout: '100',
        stickiness: 'default',
    },
    constraints: [],
});

const updateStrategyPayload = (
    strategyId: string,
    segmentId: number,
    groupId: string,
) => ({
    id: strategyId,
    name: 'flexibleRollout',
    title: '',
    disabled: false,
    segments: [segmentId],
    variants: [],
    parameters: {
        groupId,
        rollout: '100',
        stickiness: 'default',
    },
    constraints: [],
});

const addStrategyToCr = async (segmentId: number, flagName: string) => {
    await addChangeRequestChange(
        flagName,
        'addStrategy',
        addStrategyPayload(segmentId, flagName),
    );
};

const updateStrategyInCr = async (
    strategyId: string,
    segmentId: number,
    flagName: string,
) => {
    await addChangeRequestChange(
        flagName,
        'updateStrategy',
        updateStrategyPayload(strategyId, segmentId, flagName),
    );
};

describe.each([
    [
        'updateStrategy',
        (segmentId: number) =>
            updateStrategyInCr(randomId(), segmentId, FLAG_NAME),
    ],
    [
        'addStrategy',
        (segmentId: number) => addStrategyToCr(segmentId, FLAG_NAME),
    ],
])('Should handle %s changes correctly', (_, addOrUpdateStrategy) => {
    test.each([
        ['Draft', true],
        ['In Review', true],
        ['Scheduled', true],
        ['Approved', true],
        ['Rejected', false],
        ['Cancelled', false],
        ['Applied', false],
    ])(
        'Changes in %s CRs should make it %s',
        async (state, expectedOutcome) => {
            await createCR(state);

            const segmentId = 3;
            await addOrUpdateStrategy(segmentId);

            expect(
                await readModel.isSegmentUsedInActiveChangeRequests(segmentId),
            ).toBe(expectedOutcome);
        },
    );
});

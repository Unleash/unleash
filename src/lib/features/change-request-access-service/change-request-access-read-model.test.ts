import { Db, IUnleashConfig } from 'lib/server-impl';
import dbInit, { ITestDb } from '../../../test/e2e/helpers/database-init';
import getLogger from '../../../test/fixtures/no-logger';
import { IChangeRequestAccessReadModel } from './change-request-access-read-model';
import { createChangeRequestAccessReadModel } from './createChangeRequestAccessReadModel';

let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('change_request_access_read_model_serial', getLogger);
});

const CR_ID = 123456;
let user;

let readModel: IChangeRequestAccessReadModel;

beforeAll(async () => {
    user = await db.stores.userStore.insert({
        username: 'cr-creator',
    });

    readModel = createChangeRequestAccessReadModel(
        db as unknown as Db,
        {} as unknown as IUnleashConfig,
    );
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

describe.each(['updateStrategy', 'addStrategy'])(
    'Should handle %s changes correctly',
    (action) => {
        test.each(['Draft', 'In Review', 'Scheduled', 'Approved'])(
            'Should find changes in CRs in %s',
            async (state) => {
                await createCR(state);

                if (action === 'updateStrategy') {
                    await addStrategyToFeatureEnv(
                        app,
                        { ...featureFlag.strategies[0] },
                        'default',
                        featureFlag.name,
                    );

                    await updateStrategyInCr(
                        featureFlag.strategies[0].id,
                        segment.id,
                        featureFlag.name,
                    );
                } else {
                    await addStrategyToCr(segment.id, featureFlag.name);
                }

                expect(
                    await readModel.isSegmentUsedInActiveChangeRequests(
                        segment.id,
                    ),
                ).toBe(true);
            },
        );

        test.each(['Rejected', 'Cancelled', 'Applied'])(
            'Should not count changes in %s CRs',
            async (state) => {
                await createCR(state);

                if (action === 'updateStrategy') {
                    await addStrategyToFeatureEnv(
                        app,
                        { ...featureFlag.strategies[0] },
                        'default',
                        featureFlag.name,
                    );

                    await updateStrategyInCr(
                        featureFlag.strategies[0].id,
                        segment.id,
                        featureFlag.name,
                    );
                } else {
                    await addStrategyToCr(segment.id, featureFlag.name);
                }

                expect(
                    await readModel.isSegmentUsedInActiveChangeRequests(
                        segment.id,
                    ),
                ).toBe(false);
            },
        );
    },
);

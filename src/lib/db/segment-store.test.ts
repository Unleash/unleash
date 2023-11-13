import { ISegmentStore } from '../types/stores/segment-store';
import dbInit from '../../test/e2e/helpers/database-init';
import getLogger from '../../test/fixtures/no-logger';
import NotFoundError from '../error/notfound-error';

let stores;
let db;
let segmentStore: ISegmentStore;

beforeAll(async () => {
    db = await dbInit('segment_store_serial', getLogger, {
        experimental: {
            flags: {
                detectSegmentUsageInChangeRequests: true,
            },
        },
    });
    stores = db.stores;
    segmentStore = stores.segmentStore;
});

afterAll(async () => {
    await db.destroy();
});

describe('unexpected input handling for get segment', () => {
    test("gives a NotFoundError with the ID of the segment if it doesn't exist", async () => {
        const id = 123;
        try {
            await segmentStore.get(id);
        } catch (e) {
            expect(e instanceof NotFoundError).toBeTruthy();
            expect(e.message).toEqual(expect.stringMatching(id.toString()));
        }
    });
});

describe('usage counting', () => {
    let user;
    beforeAll(async () => {
        user = await db.stores.userStore.insert({
            username: 'test',
        });
    });

    afterEach(async () => {
        await db.stores.featureToggleStore.deleteAll();
        await db.rawDatabase.table('change_requests').delete();
    });

    test('segment usage in active CRs is also counted', async () => {
        const CR_ID = 54321;

        const flag1 = await db.stores.featureToggleStore.create('default', {
            name: 'test',
        });

        const flag2 = await db.stores.featureToggleStore.create('default', {
            name: 'test2',
        });

        const segment = await segmentStore.create(
            {
                name: 'cr-segment',
                constraints: [],
                createdAt: new Date(),
            },
            user,
        );

        await db.rawDatabase.table('change_requests').insert({
            id: CR_ID,
            environment: 'default',
            state: 'In Review',
            project: 'default',
            created_by: user.id,
            created_at: '2023-01-01 00:00:00',
            min_approvals: 1,
            title: 'My change request',
        });

        await db.rawDatabase.table('change_request_events').insert({
            feature: flag1.name,
            action: 'addStrategy',
            payload: {
                name: 'flexibleRollout',
                title: '',
                disabled: false,
                segments: [segment.id],
                variants: [],
                parameters: {
                    groupId: flag1.name,
                    rollout: '100',
                    stickiness: 'default',
                },
                constraints: [],
            },
            created_at: '2023-01-01 00:01:00',
            change_request_id: CR_ID,
            created_by: user.id,
        });

        await db.rawDatabase.table('change_request_events').insert({
            feature: flag2.name,
            action: 'updateStrategy',
            payload: {
                strategyId: 'not-a-real-strategy-id',
                name: 'flexibleRollout',
                title: '',
                disabled: false,
                segments: [segment.id],
                variants: [],
                parameters: {
                    groupId: flag2.name,
                    rollout: '100',
                    stickiness: 'default',
                },
                constraints: [],
            },
            created_at: '2023-01-01 00:01:00',
            change_request_id: CR_ID,
            created_by: user.id,
        });

        const [storedSegment] = await segmentStore.getAll();

        console.log('segments', segment);

        expect(storedSegment.usedInFeatures).toBe(2);
        expect(storedSegment.usedInProjects).toBe(1);
    });

    test('Segment usage is only counted once per strategy', async () => {
        // if the segment is used in a strategy, but there is also a change request updateStrategy event for the same strategy, it should only be counted once.
        // Because updateStrategy events contain all existing segments, as well as any potentially newly added segments, we need to control for that.

        const CR_ID = 54321;

        const flag = await db.stores.featureToggleStore.create('default', {
            name: 'test',
        });

        const segment1 = await segmentStore.create(
            {
                name: 'cr-segment',
                constraints: [],
                createdAt: new Date(),
            },
            user,
        );

        const segment2 = await segmentStore.create(
            {
                name: 'cr-segment-2',
                constraints: [],
                createdAt: new Date(),
            },
            user,
        );

        console.log(Object.keys(stores));

        const strategy =
            await stores.featureToggleStrategiesStore.createStrategyFeatureEnv({
                featureName: flag.name,
                projectId: 'default',
                environment: 'default',
                strategyName: 'flexibleRollout',
                segments: [segment1.id],
                parameters: {
                    groupId: flag.name,
                    rollout: '100',
                    stickiness: 'default',
                },
            });

        await db.rawDatabase.table('change_requests').insert({
            id: CR_ID,
            environment: 'default',
            state: 'In Review',
            project: 'default',
            created_by: user.id,
            created_at: '2023-01-01 00:00:00',
            min_approvals: 1,
            title: 'My change request',
        });

        await db.rawDatabase.table('change_request_events').insert({
            feature: flag.name,
            action: 'updateStrategy',
            payload: {
                strategyId: 'not-a-real-strategy-id',
                name: 'flexibleRollout',
                title: '',
                disabled: false,
                segments: [segment2.id],
                variants: [],
                parameters: {
                    groupId: flag.name,
                    rollout: '100',
                    stickiness: 'default',
                },
                constraints: [],
            },
            created_at: '2023-01-01 00:01:00',
            change_request_id: CR_ID,
            created_by: user.id,
        });

        const [storedSegment] = await segmentStore.getAll();

        expect(storedSegment.usedInFeatures).toBe(2);
        expect(storedSegment.usedInProjects).toBe(1);
    });
});

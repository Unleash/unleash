import { beforeAll, afterAll, expect, test, vi } from 'vitest';
import dbInit, {
    type ITestDb,
} from '../../../../test/e2e/helpers/database-init.js';
import { FEATURE_UPDATED, SEGMENT_UPDATED } from '../../../events/index.js';
import ConfigurationRevisionService from '../../feature-toggle/configuration-revision-service.js';
import ClientFeatureToggleDeltaReadModel from './client-feature-toggle-delta-read-model.js';
import { createClientFeatureToggleDelta } from './createClientFeatureToggleDelta.js';

let db: ITestDb;
const environment = 'hydration-snapshot-test';
const featureName = 'hydration-snapshot-feature';

beforeAll(async () => {
    db = await dbInit('delta_hydration_snapshot');
    await db
        .rawDatabase('environments')
        .insert({ name: environment, type: 'development' });
    await db
        .rawDatabase('features')
        .insert({ name: featureName, project: 'default' });
    await db.rawDatabase('feature_environments').insert({
        environment,
        feature_name: featureName,
        enabled: false,
    });
    await db.rawDatabase('feature_strategies').insert({
        id: 'hydration-snapshot-strategy',
        feature_name: featureName,
        project_name: 'default',
        environment,
        strategy_name: 'default',
        parameters: {},
        constraints: JSON.stringify([]),
        sort_order: 0,
    });
    await db.rawDatabase('segments').insert({
        id: 1,
        name: 'snapshot-segment',
        constraints: JSON.stringify([]),
    });
    await db.rawDatabase('feature_strategy_segment').insert({
        feature_strategy_id: 'hydration-snapshot-strategy',
        segment_id: 1,
    });
});

afterAll(async () => {
    await db.destroy();
});

const insertInitialEvents = async () => {
    const [initialFeatureEvent] = await db
        .rawDatabase('events')
        .insert({
            type: FEATURE_UPDATED,
            feature_name: featureName,
            project: 'default',
            environment,
            created_by: 'test',
            data: { enabled: false },
        })
        .returning('id');
    const [initialSegmentEvent] = await db
        .rawDatabase('events')
        .insert({
            type: SEGMENT_UPDATED,
            created_by: 'test',
            data: { id: 1 },
        })
        .returning('id');
    return Math.max(initialFeatureEvent.id, initialSegmentEvent.id);
};

const updatedConstraints = [
    { contextName: 'userId', operator: 'IN', values: ['new-user'] },
];

// Commit state and its events atomically, on a separate connection from hydration.
const commitFeatureAndSegmentUpdate = () =>
    db.rawDatabase.transaction(async (writer) => {
        await writer('feature_environments')
            .where({ environment, feature_name: featureName })
            .update({ enabled: true });
        await writer('segments')
            .where({ id: 1 })
            .update({ constraints: JSON.stringify(updatedConstraints) });
        const [featureEvent] = await writer('events')
            .insert({
                type: FEATURE_UPDATED,
                feature_name: featureName,
                project: 'default',
                environment,
                created_by: 'test',
                data: { enabled: true },
            })
            .returning('id');
        const [segmentEvent] = await writer('events')
            .insert({
                type: SEGMENT_UPDATED,
                created_by: 'test',
                data: { id: 1 },
            })
            .returning('id');
        return {
            featureRevision: featureEvent.id,
            segmentRevision: segmentEvent.id,
        };
    });

test('hydration keeps the old snapshot and delivers a concurrent commit on the next delta', async () => {
    const initialRevision = await insertInitialEvents();
    const config = db.config;
    const flags = vi
        .spyOn(config.flagResolver, 'isEnabled')
        .mockImplementation((flag) => flag === 'deltaApi');
    const revisionService = ConfigurationRevisionService.getInstance(
        db.stores,
        config,
    );
    const delta = createClientFeatureToggleDelta(db.rawDatabase, config);
    delta.resetDelta();
    let committedUpdate: Awaited<
        ReturnType<typeof commitFeatureAndSegmentUpdate>
    >;
    const originalGetAll = ClientFeatureToggleDeltaReadModel.prototype.getAll;
    const read = vi
        .spyOn(ClientFeatureToggleDeltaReadModel.prototype, 'getAll')
        .mockImplementationOnce(async function (
            this: ClientFeatureToggleDeltaReadModel,
            query,
        ) {
            const features = await originalGetAll.call(this, query);
            // Force the race: read old features, commit new state and events,
            // then let hydration read its watermark and segments.
            committedUpdate = await commitFeatureAndSegmentUpdate();
            return features;
        });
    const query = { environment, project: ['default'] };
    try {
        // Hydration must contain only pre-commit state, including its cursor.
        const initial = await delta.getDelta(0, query);
        expect(initial?.events).toEqual([
            expect.objectContaining({
                type: 'hydration',
                eventId: initialRevision,
                features: [
                    expect.objectContaining({
                        name: featureName,
                        enabled: false,
                    }),
                ],
                segments: [expect.objectContaining({ id: 1, constraints: [] })],
            }),
        ]);
        // The previously committed update must remain available for an SDK
        // reconnecting from the hydration cursor, rather than being skipped.
        await delta.onUpdateRevisionEvent();
        const catchUp = await delta.getDelta(initialRevision, query);
        expect(catchUp?.events).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    type: 'feature-updated',
                    eventId: committedUpdate!.featureRevision,
                    feature: expect.objectContaining({
                        name: featureName,
                        enabled: true,
                    }),
                }),
                expect.objectContaining({
                    type: 'segment-updated',
                    eventId: committedUpdate!.segmentRevision,
                    segment: expect.objectContaining({
                        id: 1,
                        constraints: updatedConstraints,
                    }),
                }),
            ]),
        );
    } finally {
        read.mockRestore();
        flags.mockRestore();
        revisionService.destroy();
    }
});

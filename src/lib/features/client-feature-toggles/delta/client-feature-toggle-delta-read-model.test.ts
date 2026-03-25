import EventEmitter from 'events';
import dbInit, {
    type ITestDb,
} from '../../../../test/e2e/helpers/database-init.js';
import ClientFeatureToggleDeltaReadModel from './client-feature-toggle-delta-read-model.js';

let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('client_feature_toggle_delta_read_model');

    await db
        .rawDatabase('environments')
        .insert({
            name: 'some-cool-new-test-env',
            type: 'development',
        })
        .onConflict('name')
        .ignore();

    await db.rawDatabase('features').insert({
        name: 'seg-flag',
    });

    await db.rawDatabase('feature_environments').insert({
        environment: 'some-cool-new-test-env',
        feature_name: 'seg-flag',
        enabled: true,
    });

    await db.rawDatabase('feature_strategies').insert({
        id: 's1',
        feature_name: 'seg-flag',
        project_name: 'default',
        environment: 'some-cool-new-test-env',
        strategy_name: 'default',
        parameters: {},
        constraints: [],
        sort_order: 0,
    });

    await db.rawDatabase('segments').insert([
        { id: 1, name: 'seg-1', constraints: [] },
        { id: 2, name: 'seg-2', constraints: [] },
        { id: 3, name: 'seg-3', constraints: [] },
    ]);

    // Insert in non-sorted order to ensure we normalize deterministically.
    // This is mostly hopes and dreams - prior to the fix this was introduced in
    // the ordering was whatever the database felt like returning. This test
    // can't really prove that that behavior is gone because random can sometimes be correct
    await db.rawDatabase('feature_strategy_segment').insert([
        { feature_strategy_id: 's1', segment_id: 3 },
        { feature_strategy_id: 's1', segment_id: 1 },
        { feature_strategy_id: 's1', segment_id: 2 },
    ]);
});

afterAll(async () => {
    await db.destroy();
});

test('sorts segment ids on strategies in delta read model', async () => {
    const readModel = new ClientFeatureToggleDeltaReadModel(
        db.rawDatabase,
        new EventEmitter(),
    );

    const result = await readModel.getAll({
        environment: 'some-cool-new-test-env',
    });

    expect(result).toHaveLength(1);
    expect(result[0].strategies?.[0].segments).toEqual([1, 2, 3]);
});

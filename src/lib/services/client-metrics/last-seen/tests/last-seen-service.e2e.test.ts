import dbInit, { ITestDb } from '../../../../../test/e2e/helpers/database-init';
import {
    IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../../../test/e2e/helpers/test-helper';
import getLogger from '../../../../../test/fixtures/no-logger';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('last_seen_at_service_e2e', getLogger);
    app = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                    disableEnvsOnRevive: true,
                    useLastSeenRefactor: true,
                },
            },
        },
        db.rawDatabase,
    );
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('should clean unknown feature toggle names from last seen store', async () => {
    const { lastSeenService, featureToggleService } = app.services;

    const clean = ['clean1', 'clean2', 'clean3', 'clean4'];
    const dirty = ['dirty1', 'dirty2', 'dirty3', 'dirty4'];

    await Promise.all(
        clean.map((featureName) =>
            featureToggleService.createFeatureToggle(
                'default',
                { name: featureName },
                'user',
            ),
        ),
    );

    const inserts = [...clean, ...dirty].map((feature) => {
        return {
            featureName: feature,
            environment: 'default',
            yes: 1,
            no: 0,
            appName: 'test',
            timestamp: new Date(),
        };
    });

    lastSeenService.updateLastSeen(inserts);
    await lastSeenService.store();

    // We have no method to get these from the last seen service or any other service or store
    let stored = await db.rawDatabase.raw(
        'SELECT * FROM last_seen_at_metrics;',
    );

    expect(stored.rows.length).toBe(8);

    await lastSeenService.cleanLastSeen();

    stored = await db.rawDatabase.raw('SELECT * FROM last_seen_at_metrics;');

    expect(stored.rows.length).toBe(4);
    expect(stored.rows).toMatch;

    const notInDirty = stored.rows.filter(
        (row) => !dirty.includes(row.feature_name),
    );

    expect(notInDirty.length).toBe(4);
});

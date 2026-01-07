import dbInit, {
    type ITestDb,
} from '../../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../../test/fixtures/no-logger.js';
import type {
    IFeatureToggleStore,
    IProjectStore,
    IUnleashStores,
} from '../../../types/index.js';
import type { FeatureToggleInsert } from '../feature-toggle-store.js';

let stores: IUnleashStores;
let db: ITestDb;
let featureToggleStore: IFeatureToggleStore;
let projectStore: IProjectStore;

beforeAll(async () => {
    getLogger.setMuteError(true);
    db = await dbInit('feature_toggle_store_serial', getLogger);
    stores = db.stores;
    featureToggleStore = stores.featureToggleStore;
    projectStore = stores.projectStore;
});

afterAll(async () => {
    await db.destroy();
});

test('should not crash for unknown toggle', async () => {
    const project = await featureToggleStore.getProjectId(
        'missing-toggle-name',
    );
    expect(project).toBe(undefined);
});

test('should not crash for undefined toggle name', async () => {
    const project = await featureToggleStore.getProjectId(undefined);
    expect(project).toBe(undefined);
});

describe('potentially_stale marking', () => {
    afterEach(async () => {
        await featureToggleStore.deleteAll();
    });
    const getFutureTimestamp = (days: number) => {
        return new Date(
            Date.now() +
                days * 24 * 60 * 60 * 1000 +
                // add an extra second
                1000,
        ).toISOString();
    };

    test('it returns an empty list if no toggles were updated', async () => {
        const features: FeatureToggleInsert[] = [
            {
                name: 'feature1',
                type: 'release',
                createdByUserId: 9999,
            },
        ];
        await Promise.all(
            features.map((feature) =>
                featureToggleStore.create('default', feature),
            ),
        );

        const markedToggles =
            await featureToggleStore.updatePotentiallyStaleFeatures();

        expect(markedToggles).toStrictEqual([]);
    });

    test('it returns only updated toggles', async () => {
        const features: FeatureToggleInsert[] = [
            {
                name: 'feature1',
                type: 'release',
                createdByUserId: 9999,
            },
            {
                name: 'feature2',
                type: 'kill-switch',
                createdByUserId: 9999,
            },
        ];
        await Promise.all(
            features.map((feature) =>
                featureToggleStore.create('default', feature),
            ),
        );

        const markedToggles =
            await featureToggleStore.updatePotentiallyStaleFeatures(
                getFutureTimestamp(41),
            );

        expect(markedToggles).toStrictEqual([
            { name: 'feature1', potentiallyStale: true, project: 'default' },
        ]);
    });

    test.each([
        [0, []],
        [7, ['operational']],
        [40, ['operational', 'release', 'experiment']],
        [10000, ['operational', 'release', 'experiment']],
    ])('it marks toggles based on their type (days elapsed: %s)', async (daysElapsed, expectedMarkedFeatures) => {
        const features: FeatureToggleInsert[] = [
            'release',
            'experiment',
            'operational',
            'kill-switch',
            'permission',
        ].map((type) => ({ name: type, type, createdByUserId: 9999 }));
        await Promise.all(
            features.map((feature) =>
                featureToggleStore.create('default', feature),
            ),
        );

        for (const feature of expectedMarkedFeatures) {
            expect(await featureToggleStore.get(feature)).toBeTruthy();
        }

        const markedToggles =
            await featureToggleStore.updatePotentiallyStaleFeatures(
                getFutureTimestamp(daysElapsed),
            );

        expect(markedToggles).toEqual(
            expect.arrayContaining(
                expectedMarkedFeatures.map((name: string) => ({
                    name,
                    potentiallyStale: true,
                    project: 'default',
                })),
            ),
        );
        expect(markedToggles.length).toEqual(expectedMarkedFeatures.length);

        for (const feature of expectedMarkedFeatures) {
            expect(
                await featureToggleStore.isPotentiallyStale(feature),
            ).toBeTruthy();
        }
    });
    test('it does not mark toggles already flagged as stale', async () => {
        const features: FeatureToggleInsert[] = [
            {
                name: 'feature1',
                type: 'release',
                stale: true,
                createdByUserId: 9999,
            },
        ];
        await Promise.all(
            features.map((feature) =>
                featureToggleStore.create('default', feature),
            ),
        );
        const markedToggles =
            await featureToggleStore.updatePotentiallyStaleFeatures(
                getFutureTimestamp(1000),
            );
        expect(markedToggles).toStrictEqual([]);
    });

    test('it does not mark archived toggles potentially stale', async () => {
        const features: FeatureToggleInsert[] = [
            {
                name: 'feature1',
                type: 'release',
                archived: true,
                createdByUserId: 9999,
            },
        ];
        await Promise.all(
            features.map((feature) =>
                featureToggleStore.create('default', feature),
            ),
        );
        const markedToggles =
            await featureToggleStore.updatePotentiallyStaleFeatures(
                getFutureTimestamp(1000),
            );
        expect(markedToggles).toStrictEqual([]);
    });

    test('it does not return toggles previously marked as potentially_stale', async () => {
        const features: FeatureToggleInsert[] = [
            {
                name: 'feature1',
                type: 'release',
                createdByUserId: 9999,
            },
        ];
        await Promise.all(
            features.map((feature) =>
                featureToggleStore.create('default', feature),
            ),
        );
        const markedToggles =
            await featureToggleStore.updatePotentiallyStaleFeatures(
                getFutureTimestamp(50),
            );

        expect(markedToggles).toStrictEqual([
            { name: 'feature1', potentiallyStale: true, project: 'default' },
        ]);

        expect(
            await featureToggleStore.isPotentiallyStale('feature1'),
        ).toBeTruthy();

        const secondPass =
            await featureToggleStore.updatePotentiallyStaleFeatures(
                getFutureTimestamp(100),
            );

        expect(secondPass).toStrictEqual([]);
    });

    describe('changing feature types', () => {
        test("if a potentially stale feature changes to a type that shouldn't be stale, it's 'potentially_stale' marker is removed.", async () => {
            const features: FeatureToggleInsert[] = [
                {
                    name: 'feature1',
                    type: 'release',
                    createdByUserId: 9999,
                },
            ];
            await Promise.all(
                features.map((feature) =>
                    featureToggleStore.create('default', feature),
                ),
            );
            const markedToggles =
                await featureToggleStore.updatePotentiallyStaleFeatures(
                    getFutureTimestamp(50),
                );

            expect(markedToggles).toStrictEqual([
                {
                    name: 'feature1',
                    potentiallyStale: true,
                    project: 'default',
                },
            ]);

            expect(
                await featureToggleStore.isPotentiallyStale('feature1'),
            ).toBeTruthy();

            await featureToggleStore.update('default', {
                name: 'feature1',
                type: 'kill-switch',
            });

            expect(
                await featureToggleStore.updatePotentiallyStaleFeatures(),
            ).toStrictEqual([
                {
                    name: 'feature1',
                    potentiallyStale: false,
                    project: 'default',
                },
            ]);

            const potentiallyStale =
                await featureToggleStore.isPotentiallyStale('feature1');

            expect(potentiallyStale).toBeFalsy();
        });

        test('if a fresh feature changes to a type that should be stale, it gets marked as potentially stale', async () => {
            const features: FeatureToggleInsert[] = [
                {
                    name: 'feature1',
                    type: 'kill-switch',
                    createdByUserId: 9999,
                },
            ];
            await Promise.all(
                features.map((feature) =>
                    featureToggleStore.create('default', feature),
                ),
            );
            const markedToggles =
                await featureToggleStore.updatePotentiallyStaleFeatures(
                    getFutureTimestamp(50),
                );

            expect(markedToggles).toStrictEqual([]);

            await featureToggleStore.update('default', {
                name: 'feature1',
                type: 'release',
            });

            await featureToggleStore.updatePotentiallyStaleFeatures(
                getFutureTimestamp(40),
            );
            const potentiallyStale =
                await featureToggleStore.isPotentiallyStale('feature1');

            expect(potentiallyStale).toBeTruthy();
        });

        test('if a stale feature changes to a type that should be stale, it does not get marked as potentially stale', async () => {
            const features: FeatureToggleInsert[] = [
                {
                    name: 'feature1',
                    type: 'kill-switch',
                    stale: true,
                    createdByUserId: 9999,
                },
            ];
            await Promise.all(
                features.map((feature) =>
                    featureToggleStore.create('default', feature),
                ),
            );

            await featureToggleStore.update('default', {
                name: 'feature1',
                type: 'release',
            });

            await featureToggleStore.updatePotentiallyStaleFeatures(
                getFutureTimestamp(40),
            );

            const potentiallyStale =
                await featureToggleStore.isPotentiallyStale('feature1');

            expect(potentiallyStale).toBeFalsy();
        });

        test('it should filter projects for playground', async () => {
            await projectStore.create({
                id: 'MyProject',
                name: 'MyProject',
                description: 'MyProject',
            });
            await featureToggleStore.create('default', {
                name: 'featureA',
                createdByUserId: 9999,
            });

            await featureToggleStore.create('MyProject', {
                name: 'featureB',
                createdByUserId: 9999,
            });

            const playgroundFeatures =
                await featureToggleStore.getPlaygroundFeatures({
                    project: ['MyProject'],
                });

            expect(playgroundFeatures).toHaveLength(1);
            expect(playgroundFeatures[0].project).toBe('MyProject');
        });
    });
});

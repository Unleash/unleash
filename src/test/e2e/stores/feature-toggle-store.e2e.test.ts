import dbInit from '../helpers/database-init';
import getLogger from '../../fixtures/no-logger';
import { FeatureToggleDTO, IFeatureToggleStore } from '../../../lib/types';

let stores;
let db;
let featureToggleStore: IFeatureToggleStore;

beforeAll(async () => {
    getLogger.setMuteError(true);
    db = await dbInit('feature_toggle_store_serial', getLogger);
    stores = db.stores;
    featureToggleStore = stores.featureToggleStore;
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
            new Date().getTime() +
                days * 24 * 60 * 60 * 1000 +
                // add an extra second
                1000,
        ).toISOString();
    };

    test('it returns an empty list of no toggles were updated', async () => {
        const features: FeatureToggleDTO[] = [
            {
                name: 'feature1',
                type: 'release',
            },
        ];
        await Promise.all(
            features.map((feature) =>
                featureToggleStore.create('default', feature),
            ),
        );

        const markedToggles =
            await featureToggleStore.markPotentiallyStaleFeatures();

        expect(markedToggles).toStrictEqual([]);
    });
    test('it returns the names of only the marked toggles', async () => {
        const features: FeatureToggleDTO[] = [
            {
                name: 'feature1',
                type: 'release',
            },
            {
                name: 'feature2',
                type: 'kill-switch',
            },
        ];
        await Promise.all(
            features.map((feature) =>
                featureToggleStore.create('default', feature),
            ),
        );

        const markedToggles =
            await featureToggleStore.markPotentiallyStaleFeatures(
                getFutureTimestamp(41),
            );

        expect(markedToggles).toStrictEqual(['feature1']);
    });

    test.each([
        [0, []],
        [7, ['operational']],
        [40, ['operational', 'release', 'experiment']],
        [10000, ['operational', 'release', 'experiment']],
    ])(
        'it marks toggles based on their type (days elapsed: %s)',
        async (daysElapsed, expectedMarkedFeatures) => {
            const features: FeatureToggleDTO[] = [
                'release',
                'experiment',
                'operational',
                'kill-switch',
                'permission',
            ].map((type) => ({ name: type, type }));
            await Promise.all(
                features.map((feature) =>
                    featureToggleStore.create('default', feature),
                ),
            );

            for (const feature of expectedMarkedFeatures) {
                expect(await featureToggleStore.get(feature)).toBeTruthy();
            }

            const markedToggles =
                await featureToggleStore.markPotentiallyStaleFeatures(
                    getFutureTimestamp(daysElapsed),
                );

            expect(markedToggles).toEqual(
                expect.arrayContaining(expectedMarkedFeatures),
            );
            expect(markedToggles.length).toEqual(expectedMarkedFeatures.length);

            for (const feature of expectedMarkedFeatures) {
                console.log('checking feature', feature);

                expect(
                    await featureToggleStore.getPotentiallyStaleStatus(feature),
                ).toBeTruthy();
            }
        },
    );
    test('it does not mark toggles already flagged as stale', async () => {
        const features: FeatureToggleDTO[] = [
            {
                name: 'feature1',
                type: 'release',
                stale: true,
            },
        ];
        await Promise.all(
            features.map((feature) =>
                featureToggleStore.create('default', feature),
            ),
        );
        const markedToggles =
            await featureToggleStore.markPotentiallyStaleFeatures(
                getFutureTimestamp(1000),
            );
        expect(markedToggles).toStrictEqual([]);
    });
    test('it does not return toggles previously marked as potentially_stale', async () => {
        const features: FeatureToggleDTO[] = [
            {
                name: 'feature1',
                type: 'release',
            },
        ];
        await Promise.all(
            features.map((feature) =>
                featureToggleStore.create('default', feature),
            ),
        );
        const markedToggles =
            await featureToggleStore.markPotentiallyStaleFeatures(
                getFutureTimestamp(50),
            );
        expect(markedToggles).toStrictEqual(['feature1']);

        const secondPass =
            await featureToggleStore.markPotentiallyStaleFeatures(
                getFutureTimestamp(100),
            );
        expect(secondPass).toStrictEqual([]);
    });

    describe('changing feature types', () => {
        const getPastDate = (days: number) => {
            return new Date(
                new Date().getTime() -
                    days * 24 * 60 * 60 * 1000 -
                    // subtract an extra second
                    1000,
            );
        };

        test("if a potentially stale feature changes to a type that shouldn't be stale, it's 'potentially_stale' marker is removed.", async () => {
            const features: FeatureToggleDTO[] = [
                {
                    name: 'feature1',
                    type: 'release',
                },
            ];
            await Promise.all(
                features.map((feature) =>
                    featureToggleStore.create('default', feature),
                ),
            );
            const markedToggles =
                await featureToggleStore.markPotentiallyStaleFeatures(
                    getFutureTimestamp(50),
                );

            expect(markedToggles).toStrictEqual(['feature1']);
            expect(
                await featureToggleStore.getPotentiallyStaleStatus('feature1'),
            ).toBeTruthy();

            await featureToggleStore.update('default', {
                name: 'feature1',
                type: 'kill-switch',
            });

            const potentiallyStale =
                await featureToggleStore.getPotentiallyStaleStatus('feature1');

            expect(potentiallyStale).toBeFalsy();
        });

        test('if a fresh feature changes to a type that should be stale, it gets marked as potentially stale', async () => {
            const features: FeatureToggleDTO[] = [
                {
                    name: 'feature1',
                    type: 'kill-switch',
                },
            ];
            await Promise.all(
                features.map((feature) =>
                    featureToggleStore.create('default', feature),
                ),
            );
            const markedToggles =
                await featureToggleStore.markPotentiallyStaleFeatures(
                    getFutureTimestamp(50),
                );

            expect(markedToggles).toStrictEqual([]);

            await featureToggleStore.update('default', {
                name: 'feature1',
                type: 'release',
                createdAt: getPastDate(40),
            });

            const potentiallyStale =
                await featureToggleStore.getPotentiallyStaleStatus('feature1');

            expect(potentiallyStale).toBeTruthy();
        });
    });
});

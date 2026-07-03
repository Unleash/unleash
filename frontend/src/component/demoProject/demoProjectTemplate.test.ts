import { describe, expect, test } from 'vitest';
import {
    buildDemoImportPayload,
    DEMO_PROJECT_ID,
    DEMO_SEGMENT,
    demoProjectImportData,
    withoutSegments,
} from './demoProjectTemplate.ts';

describe('demoProjectTemplate', () => {
    const featureNames = demoProjectImportData.features.map(
        (feature) => feature.name,
    );

    test('contains the expected story flags', () => {
        expect(featureNames).toEqual([
            'new-checkout',
            'dark-mode',
            'beta-search',
            'holiday-banner',
            'legacy-payment-kill',
        ]);
        demoProjectImportData.features.forEach((feature) => {
            expect(feature.description).toBeTruthy();
            expect(feature.project).toBe(DEMO_PROJECT_ID);
            expect(feature.archived).toBe(false);
        });
    });

    test('every strategy references an included feature', () => {
        demoProjectImportData.featureStrategies.forEach((strategy) => {
            expect(featureNames).toContain(strategy.featureName);
        });
    });

    test('flexibleRollout strategies define rollout, stickiness and groupId', () => {
        demoProjectImportData.featureStrategies
            .filter((strategy) => strategy.name === 'flexibleRollout')
            .forEach((strategy) => {
                expect(strategy.parameters).toMatchObject({
                    rollout: expect.any(String),
                    stickiness: expect.any(String),
                    groupId: strategy.featureName,
                });
            });
    });

    test('every feature has an environment entry where name matches the feature', () => {
        // The import endpoint resolves the feature by `name` when setting the
        // enabled state and by `featureName` when importing variants.
        const environmentEntries =
            demoProjectImportData.featureEnvironments ?? [];
        expect(environmentEntries.map((entry) => entry.name)).toEqual(
            featureNames,
        );
        environmentEntries.forEach((entry) => {
            expect(entry.featureName).toBe(entry.name);
        });
    });

    test('variant weights add up to 1000 per feature environment', () => {
        const withVariants = (
            demoProjectImportData.featureEnvironments ?? []
        ).filter((entry) => (entry.variants ?? []).length > 0);
        expect(withVariants.length).toBeGreaterThan(0);
        withVariants.forEach((entry) => {
            const totalWeight = (entry.variants ?? []).reduce(
                (total, variant) => total + variant.weight,
                0,
            );
            expect(totalWeight).toBe(1000);
        });
    });

    test('segments referenced by strategies are declared and match the pre-created segment', () => {
        const declaredSegmentIds = (demoProjectImportData.segments ?? []).map(
            (segment) => segment.id,
        );
        const referencedSegmentIds =
            demoProjectImportData.featureStrategies.flatMap(
                (strategy) => strategy.segments ?? [],
            );
        expect(referencedSegmentIds.length).toBeGreaterThan(0);
        referencedSegmentIds.forEach((segmentId) => {
            expect(declaredSegmentIds).toContain(segmentId);
        });
        expect(
            demoProjectImportData.segments?.map((segment) => segment.name),
        ).toContain(DEMO_SEGMENT.name);
    });

    test('feature tags reference included features and declared tag types', () => {
        const tagTypeNames = demoProjectImportData.tagTypes.map(
            (tagType) => tagType.name,
        );
        (demoProjectImportData.featureTags ?? []).forEach((featureTag) => {
            expect(featureNames).toContain(featureTag.featureName);
            expect(tagTypeNames).toContain(featureTag.tagType);
        });
    });

    test('buildDemoImportPayload targets the demo project and given environment', () => {
        const payload = buildDemoImportPayload('development');
        expect(payload.project).toBe(DEMO_PROJECT_ID);
        expect(payload.environment).toBe('development');
        expect(payload.data).toBe(demoProjectImportData);
    });

    test('withoutSegments strips all segment references', () => {
        const stripped = withoutSegments(buildDemoImportPayload('production'));
        expect(stripped.data.segments).toEqual([]);
        stripped.data.featureStrategies.forEach((strategy) => {
            expect(strategy).not.toHaveProperty('segments');
        });
        // The original template must remain untouched.
        expect(
            demoProjectImportData.featureStrategies.some(
                (strategy) => (strategy.segments ?? []).length > 0,
            ),
        ).toBe(true);
    });
});

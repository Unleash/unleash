import type { FeatureInterface } from 'unleash-client/lib/feature.js';
import type { Segment } from 'unleash-client/lib/strategy/strategy.js';
import { enhanceFeaturesWithSegments } from './enhance-features-with-segments.js';

const segment = {
    id: 1,
    constraints: [
        {
            contextName: 'appName',
            operator: 'IN',
            values: ['my-app'],
        },
    ],
} as Segment;

const toggleWithSegments = {
    name: 'flagA',
    enabled: true,
    impressionData: false,
    strategies: [
        {
            name: 'default',
            parameters: {},
            constraints: [],
            segments: [1],
        },
    ],
} as FeatureInterface;

test('resolves segment ids to segment objects', () => {
    const [enhanced] = enhanceFeaturesWithSegments(
        [toggleWithSegments],
        [segment],
    );

    expect(enhanced.strategies?.[0].segments).toEqual([segment]);
});

test('preserves missing segments as undefined instead of dropping them', () => {
    const [enhanced] = enhanceFeaturesWithSegments([toggleWithSegments], []);

    expect(enhanced.strategies?.[0].segments).toEqual([undefined]);
});

test('passes through toggles without strategies or segments', () => {
    const withoutStrategies = {
        name: 'flagB',
        enabled: false,
        impressionData: false,
    } as FeatureInterface;
    const withoutSegments = {
        name: 'flagC',
        enabled: true,
        impressionData: false,
        strategies: [
            {
                name: 'default',
                parameters: {},
                constraints: [],
            },
        ],
    } as FeatureInterface;

    const [enhancedB, enhancedC] = enhanceFeaturesWithSegments(
        [withoutStrategies, withoutSegments],
        [segment],
    );

    expect(enhancedB.strategies).toBeUndefined();
    expect(enhancedC.strategies?.[0].segments).toBeUndefined();
});

test('returns empty array for uninitialized input', () => {
    expect(enhanceFeaturesWithSegments(undefined, undefined)).toEqual([]);
    expect(enhanceFeaturesWithSegments(undefined, [segment])).toEqual([]);
    expect(
        enhanceFeaturesWithSegments([toggleWithSegments], undefined),
    ).toEqual([
        expect.objectContaining({
            strategies: [expect.objectContaining({ segments: [undefined] })],
        }),
    ]);
});

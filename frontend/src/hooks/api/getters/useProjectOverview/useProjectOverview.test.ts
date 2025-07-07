import { featuresCount } from './useProjectOverview.js';

test('features count based on feature types', () => {
    expect(
        featuresCount({
            featureTypeCounts: [
                { type: 'release', count: 10 },
                { type: 'operational', count: 20 },
            ],
        }),
    ).toBe(30);
    expect(
        featuresCount({ featureTypeCounts: [{ type: 'release', count: 10 }] }),
    ).toBe(10);
    expect(featuresCount({ featureTypeCounts: [] })).toBe(0);
});

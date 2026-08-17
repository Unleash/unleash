import { createClientPayloadCanonicalizer } from './client-payload-canonicalizer.js';

test('canonicalizes cache payloads in place without changing their values', () => {
    const canonicalizer = createClientPayloadCanonicalizer();
    const constraint = {
        contextName: 'userId',
        operator: 'IN' as const,
        values: ['123'],
    };
    const feature = {
        name: 'example',
        type: 'release',
        strategies: [
            {
                name: 'flexibleRollout',
                constraints: [{ ...constraint }],
            },
        ],
    };
    const segment = {
        id: 1,
        name: 'example',
        constraints: [{ ...constraint }],
    };

    expect(canonicalizer.feature(feature)).toBe(feature);
    expect(canonicalizer.segment(segment)).toBe(segment);
    expect(feature).toEqual({
        name: 'example',
        type: 'release',
        strategies: [
            {
                name: 'flexibleRollout',
                constraints: [constraint],
            },
        ],
    });
    expect(segment).toEqual({
        id: 1,
        name: 'example',
        constraints: [constraint],
    });
});

test('leaves optional feature fields alone', () => {
    const canonicalizer = createClientPayloadCanonicalizer();
    const feature: {
        name: string;
        type?: string;
        strategies?: { name: string; constraints?: [] }[];
    } = { name: 'example' };

    expect(canonicalizer.feature(feature)).toEqual({ name: 'example' });

    feature.strategies = [{ name: 'default' }];

    expect(canonicalizer.feature(feature)).toEqual({
        name: 'example',
        strategies: [{ name: 'default' }],
    });
});

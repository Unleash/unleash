import { applyPatch } from './client-feature-toggle-cache';
import type * as jsonpatch from 'fast-json-patch';

test('feature-dependency-added event handled when no existing dependencies', () => {
    const original = {
        version: 2,
        features: [
            {
                name: 'child.with.matching.constraint',
            },
        ],
    };

    const patch: jsonpatch.Operation[] = [
        {
            op: 'add',
            path: '/features/0/dependencies',
            value: [],
        },
        {
            op: 'add',
            path: '/features/0/dependencies/0',
            value: {
                feature: 'parent.with.variant',
                variants: ['parent.variant'],
                enabled: false,
            },
        },
    ];

    const diffs = applyPatch(original, patch);

    expect(diffs).toMatchObject({
        features: [
            {
                dependencies: [
                    {
                        enabled: false,
                        feature: 'parent.with.variant',
                        variants: ['parent.variant'],
                    },
                ],
                name: 'child.with.matching.constraint',
            },
        ],
        version: 2,
    });
});

test('feature-dependency-added event handled when existing dependencies', () => {
    const original = {
        version: 2,
        features: [
            {
                name: 'child.with.matching.constraint',
                dependencies: [
                    {
                        feature: 'existing',
                    },
                ],
            },
        ],
    };

    const patch: jsonpatch.Operation[] = [
        {
            op: 'add',
            path: '/features/0/dependencies/0', // TODO: check if adding as first is fine or order matters
            value: {
                feature: 'parent.with.variant',
                variants: ['parent.variant'],
                enabled: false,
            },
        },
    ];

    const diffs = applyPatch(original, patch);

    expect(diffs).toMatchObject({
        features: [
            {
                dependencies: [
                    {
                        enabled: false,
                        feature: 'parent.with.variant',
                        variants: ['parent.variant'],
                    },
                    {
                        feature: 'existing',
                    },
                ],
                name: 'child.with.matching.constraint',
            },
        ],
        version: 2,
    });
});

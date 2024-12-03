import { calculateRequiredClientRevision } from './client-feature-toggle-cache';

const mockAdd = (params): any => {
    const base = {
        name: 'feature',
        project: 'default',
        stale: false,
        type: 'release',
        enabled: true,
        strategies: [],
        variants: [],
        description: 'A feature',
        impressionData: [],
        dependencies: [],
    };
    return { ...base, ...params };
};

test('compresses multiple revisions to a single update', () => {
    const revisionList = [
        {
            revisionId: 1,
            updated: [mockAdd({ type: 'release' })],
            removed: [],
        },
        {
            revisionId: 2,
            updated: [mockAdd({ type: 'test' })],
            removed: [],
        },
    ];

    const revisions = calculateRequiredClientRevision(revisionList, 0, [
        'default',
    ]);

    expect(revisions).toEqual({
        revisionId: 2,
        updated: [mockAdd({ type: 'test' })],
        removed: [],
    });
});

test('revision that adds, removes then adds again does not end up with the remove', () => {
    const revisionList = [
        {
            revisionId: 1,
            updated: [mockAdd({ name: 'some-toggle' })],
            removed: [],
        },
        {
            revisionId: 2,
            updated: [],
            removed: [
                {
                    name: 'some-toggle',
                    project: 'default',
                },
            ],
        },
        {
            revisionId: 3,
            updated: [mockAdd({ name: 'some-toggle' })],
            removed: [],
        },
    ];

    const revisions = calculateRequiredClientRevision(revisionList, 0, [
        'default',
    ]);

    expect(revisions).toEqual({
        revisionId: 3,
        updated: [mockAdd({ name: 'some-toggle' })],
        removed: [],
    });
});

test('revision that removes, adds then removes again does not end up with the remove', () => {
    const revisionList = [
        {
            revisionId: 1,
            updated: [],
            removed: [
                {
                    name: 'some-toggle',
                    project: 'default',
                },
            ],
        },
        {
            revisionId: 2,
            updated: [mockAdd({ name: 'some-toggle' })],
            removed: [],
        },
        {
            revisionId: 3,
            updated: [],
            removed: [
                {
                    name: 'some-toggle',
                    project: 'default',
                },
            ],
        },
    ];

    const revisions = calculateRequiredClientRevision(revisionList, 0, [
        'default',
    ]);

    expect(revisions).toEqual({
        revisionId: 3,
        updated: [],
        removed: [
            {
                name: 'some-toggle',
                project: 'default',
            },
        ],
    });
});

test('revision equal to the base case returns only later revisions ', () => {
    const revisionList = [
        {
            revisionId: 1,
            updated: [
                mockAdd({ name: 'feature1' }),
                mockAdd({ name: 'feature2' }),
                mockAdd({ name: 'feature3' }),
            ],
            removed: [],
        },
        {
            revisionId: 2,
            updated: [mockAdd({ name: 'feature4' })],
            removed: [],
        },
        {
            revisionId: 3,
            updated: [mockAdd({ name: 'feature5' })],
            removed: [],
        },
    ];

    const revisions = calculateRequiredClientRevision(revisionList, 1, [
        'default',
    ]);

    expect(revisions).toEqual({
        revisionId: 3,
        updated: [mockAdd({ name: 'feature4' }), mockAdd({ name: 'feature5' })],
        removed: [],
    });
});

test('project filter removes features not in project', () => {
    const revisionList = [
        {
            revisionId: 1,
            updated: [mockAdd({ name: 'feature1', project: 'project1' })],
            removed: [],
        },
        {
            revisionId: 2,
            updated: [mockAdd({ name: 'feature2', project: 'project2' })],
            removed: [],
        },
    ];

    const revisions = calculateRequiredClientRevision(revisionList, 0, [
        'project1',
    ]);

    expect(revisions).toEqual({
        revisionId: 2,
        updated: [mockAdd({ name: 'feature1', project: 'project1' })],
        removed: [],
    });
});

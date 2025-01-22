import {
    type DeltaEvent,
    filterEventsByQuery,
} from './client-feature-toggle-delta';

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

test('revision equal to the base case returns only later revisions ', () => {
    const revisionList: DeltaEvent[] = [
        {
            eventId: 1,
            type: 'hydration',
            features: [
                mockAdd({ name: 'feature1' }),
                mockAdd({ name: 'feature2' }),
                mockAdd({ name: 'feature3' }),
            ],
        },
        {
            eventId: 2,
            type: 'feature-updated',
            feature: mockAdd({ name: 'feature4' }),
        },
        {
            eventId: 3,
            type: 'feature-updated',
            feature: mockAdd({ name: 'feature5' }),
        },
    ];

    const revisions = filterEventsByQuery(revisionList, 1, ['default'], '');

    expect(revisions).toEqual([
        {
            eventId: 2,
            type: 'feature-updated',
            feature: mockAdd({ name: 'feature4' }),
        },
        {
            eventId: 3,
            type: 'feature-updated',
            feature: mockAdd({ name: 'feature5' }),
        },
    ]);
});

test('should serve hydration event when all events returned', () => {
    const revisionList: DeltaEvent[] = [
        {
            eventId: 1,
            type: 'hydration',
            features: [mockAdd({ name: 'feature1', project: 'project1' })],
        },
        {
            eventId: 2,
            type: 'feature-updated',
            feature: mockAdd({ name: 'feature2', project: 'project2' }),
        },
    ];

    const revisions = filterEventsByQuery(revisionList, 0, ['project1'], '');

    expect(revisions).toEqual([
        {
            eventId: 1,
            type: 'hydration',
            features: [mockAdd({ name: 'feature1', project: 'project1' })],
        },
    ]);
});

test('project filter removes features not in project', () => {
    const revisionList: DeltaEvent[] = [
        {
            eventId: 1,
            type: 'hydration',
            features: [mockAdd({ name: 'feature1', project: 'project1' })],
        },
        {
            eventId: 2,
            type: 'feature-updated',
            feature: mockAdd({ name: 'feature2', project: 'project2' }),
        },
    ];

    const revisions = filterEventsByQuery(revisionList, 0, ['project1'], '');

    expect(revisions).toEqual([
        {
            eventId: 1,
            type: 'hydration',
            features: [mockAdd({ name: 'feature1', project: 'project1' })],
        },
    ]);
});

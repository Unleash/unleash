import {
    type DeltaEvent,
    filterEventsByQuery,
    filterHydrationEventByQuery,
} from './client-feature-toggle-delta';
import {
    DELTA_EVENT_TYPES,
    type DeltaHydrationEvent,
} from './client-feature-toggle-delta-types';

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
            eventId: 2,
            type: DELTA_EVENT_TYPES.FEATURE_UPDATED,
            feature: mockAdd({ name: 'feature4' }),
        },
        {
            eventId: 3,
            type: DELTA_EVENT_TYPES.FEATURE_UPDATED,
            feature: mockAdd({ name: 'feature5' }),
        },
    ];

    const revisions = filterEventsByQuery(revisionList, 1, ['default'], '');

    expect(revisions).toEqual([
        {
            eventId: 2,
            type: DELTA_EVENT_TYPES.FEATURE_UPDATED,
            feature: mockAdd({ name: 'feature4' }),
        },
        {
            eventId: 3,
            type: DELTA_EVENT_TYPES.FEATURE_UPDATED,
            feature: mockAdd({ name: 'feature5' }),
        },
    ]);
});

test('project filter removes features not in project and nameprefix', () => {
    const revisionList: DeltaEvent[] = [
        {
            eventId: 1,
            type: DELTA_EVENT_TYPES.FEATURE_UPDATED,
            feature: mockAdd({ name: 'feature1', project: 'project1' }),
        },
        {
            eventId: 2,
            type: DELTA_EVENT_TYPES.FEATURE_UPDATED,
            feature: mockAdd({ name: 'feature2', project: 'project2' }),
        },
        {
            eventId: 3,
            type: DELTA_EVENT_TYPES.FEATURE_UPDATED,
            feature: mockAdd({ name: 'ffeature1', project: 'project1' }),
        },
    ];

    const revisions = filterEventsByQuery(revisionList, 0, ['project1'], 'ff');

    expect(revisions).toEqual([
        {
            eventId: 3,
            type: DELTA_EVENT_TYPES.FEATURE_UPDATED,
            feature: mockAdd({ name: 'ffeature1', project: 'project1' }),
        },
    ]);
});

test('project filter removes features not in project in hydration', () => {
    const revisionList: DeltaHydrationEvent = {
        eventId: 1,
        type: 'hydration',
        segments: [
            {
                name: 'test',
                constraints: [],
                id: 1,
            },
        ],
        features: [
            mockAdd({ name: 'feature1', project: 'project1' }),
            mockAdd({ name: 'feature2', project: 'project2' }),
            mockAdd({ name: 'myfeature2', project: 'project2' }),
        ],
    };

    const revisions = filterHydrationEventByQuery(
        revisionList,
        ['project2'],
        'my',
    );

    expect(revisions).toEqual({
        eventId: 1,
        type: 'hydration',
        segments: [
            {
                name: 'test',
                constraints: [],
                id: 1,
            },
        ],
        features: [mockAdd({ name: 'myfeature2', project: 'project2' })],
    });
});

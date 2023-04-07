import { addDays, subDays } from 'date-fns';
import { IEvent } from 'lib/types';
import { TimeToProduction } from './time-to-production';

const modifyEventCreatedAt = (events: IEvent[], days: number): IEvent[] => {
    return events.map((event) => {
        const newEvent = { ...event };
        newEvent.createdAt = addDays(newEvent.createdAt, days);
        newEvent.id = newEvent.id + days;
        return newEvent;
    });
};

const createEvent = (env: string, overrides: Partial<IEvent>) => {
    return {
        id: Math.floor(Math.random() * 1000),
        type: 'feature-environment-enabled',
        createdBy: 'Fredrik',
        createdAt: new Date('2023-01-25T09:37:32.504Z'),
        data: null,
        preData: null,
        tags: [],
        featureName: 'average-prod-time',
        project: 'average-time-to-prod',
        environment: env,
        ...overrides,
    };
};

const events = [
    {
        id: 65,
        type: 'feature-environment-enabled',
        createdBy: 'Fredrik',
        createdAt: new Date('2023-01-25T09:37:32.504Z'),
        data: null,
        preData: null,
        tags: [],
        featureName: 'average-prod-time',
        project: 'average-time-to-prod',
        environment: 'default',
    },
    {
        id: 66,
        type: 'feature-environment-enabled',
        createdBy: 'Fredrik',
        createdAt: new Date('2023-01-31T09:37:32.506Z'),
        data: null,
        preData: null,
        tags: [],
        featureName: 'average-prod-time-2',
        project: 'average-time-to-prod',
        environment: 'default',
    },
    {
        id: 67,
        type: 'feature-environment-enabled',
        createdBy: 'Fredrik',
        createdAt: new Date('2023-01-26T09:37:32.508Z'),
        data: null,
        preData: null,
        tags: [],
        featureName: 'average-prod-time-3',
        project: 'average-time-to-prod',
        environment: 'default',
    },
    {
        id: 68,
        type: 'feature-environment-enabled',
        createdBy: 'Fredrik',
        createdAt: new Date('2023-02-02T09:37:32.509Z'),
        data: null,
        preData: null,
        tags: [],
        featureName: 'average-prod-time-4',
        project: 'average-time-to-prod',
        environment: 'default',
    },
];

const environments = [
    {
        name: 'default',
        type: 'production',
        sortOrder: 1,
        enabled: true,
        protected: true,
        projectApiTokenCount: 0,
        projectEnabledToggleCount: 0,
    },
];

const features = [
    {
        name: 'average-prod-time',
        type: 'release',
        project: 'average-time-to-prod',
        stale: false,
        createdAt: new Date('2022-12-05T09:37:32.483Z'),
        impressionData: false,
        archived: false,
    },
    {
        name: 'average-prod-time-4',
        type: 'release',
        project: 'average-time-to-prod',
        stale: false,
        createdAt: new Date('2023-01-19T09:37:32.484Z'),
        impressionData: false,
        archived: false,
    },
    {
        name: 'average-prod-time-2',
        type: 'release',
        project: 'average-time-to-prod',
        stale: false,
        createdAt: new Date('2023-01-19T09:37:32.484Z'),
        impressionData: false,
        archived: false,
    },
    {
        name: 'average-prod-time-3',
        type: 'release',
        project: 'average-time-to-prod',
        stale: false,
        createdAt: new Date('2023-01-19T09:37:32.486Z'),
        impressionData: false,
        archived: false,
    },
];

describe('calculate average time to production', () => {
    test('should build a map of feature events', () => {
        const projectStatus = new TimeToProduction(
            features,
            environments,
            events,
        );

        const featureEvents = projectStatus.getFeatureEvents();

        expect(Object.keys(featureEvents).length).toBe(4);
        expect(featureEvents['average-prod-time'].createdAt).toBeTruthy();
        expect(featureEvents['average-prod-time'].events).toBeInstanceOf(Array);
    });

    test('[legacy] should calculate average correctly', () => {
        const projectStatus = new TimeToProduction(
            features,
            environments,
            events,
        );

        const timeToProduction = projectStatus.calculateAverageTimeToProd();

        expect(timeToProduction).toBe(21);
    });

    test('should calculate average correctly', () => {
        const timeToProduction = TimeToProduction.calculateAverageTimeToProd([
            {
                created: new Date('2022-12-05T09:37:32.483Z'),
                enabled: new Date('2023-01-25T09:37:32.504Z'),
            },
            {
                created: new Date('2023-01-19T09:37:32.484Z'),
                enabled: new Date('2023-01-31T09:37:32.506Z'),
            },
            {
                created: new Date('2023-01-19T09:37:32.484Z'),
                enabled: new Date('2023-02-02T09:37:32.509Z'),
            },
            {
                created: new Date('2023-01-19T09:37:32.486Z'),
                enabled: new Date('2023-01-26T09:37:32.508Z'),
            },
        ]);

        expect(timeToProduction).toBe(21);
    });

    test('should sort events by createdAt', () => {
        const projectStatus = new TimeToProduction(features, environments, [
            ...modifyEventCreatedAt(events, 5),
            ...events,
        ]);

        const featureEvents = projectStatus.getFeatureEvents();
        const sortedFeatureEvents =
            projectStatus.sortFeatureEventsByCreatedAt(featureEvents);

        const [firstEvent, secondEvent] =
            sortedFeatureEvents['average-prod-time'].events;

        const firstEventCreatedAt = new Date(firstEvent.createdAt);
        const secondEventCreatedAt = new Date(secondEvent.createdAt);

        expect(firstEventCreatedAt.getTime()).toBeLessThan(
            secondEventCreatedAt.getTime(),
        );

        const [firstEvent2, secondEvent2] =
            sortedFeatureEvents['average-prod-time-2'].events;

        const firstEventCreatedAt2 = new Date(firstEvent2.createdAt);
        const secondEventCreatedAt2 = new Date(secondEvent2.createdAt);

        expect(firstEventCreatedAt2.getTime()).toBeLessThan(
            secondEventCreatedAt2.getTime(),
        );
    });

    test('should not count events that are development environments', () => {
        const projectStatus = new TimeToProduction(features, environments, [
            createEvent('development', {
                createdAt: subDays(new Date('2023-01-25T09:37:32.504Z'), 10),
            }),
            createEvent('development', {
                createdAt: subDays(new Date('2023-01-25T09:37:32.504Z'), 10),
            }),
            ...events,
        ]);

        const timeToProduction = projectStatus.calculateAverageTimeToProd();
        expect(timeToProduction).toBe(21);
    });
});

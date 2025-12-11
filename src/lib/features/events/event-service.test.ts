import log4js from 'log4js';
const { getLogger } = log4js;
import type {
    IEventStore,
    IFeatureTagStore,
    IUnleashConfig,
} from '../../internals.js';
import type { IAccessReadModel } from '../access/access-read-model-type.js';
import type { IPrivateProjectChecker } from '../private-project/privateProjectCheckerType.js';
import type { ProjectAccess } from '../private-project/privateProjectStore.js';
import EventService, { filterAccessibleProjects } from './event-service.js';
import { type IBaseEvent, USER_UPDATED } from '../../events/index.js';

import { vi } from 'vitest';

describe('filterPrivateProjectsFromParams', () => {
    it('should return IS_ANY_OF with allowed projects when projectParam is undefined and mode is limited', () => {
        const projectAccess: ProjectAccess = {
            mode: 'limited',
            projects: ['project1', 'project2'],
        };

        const projectParam = undefined;

        const result = filterAccessibleProjects(projectParam, projectAccess);

        expect(result).toBe('IS_ANY_OF:project1,project2');
    });

    it('should return the original projectParam when mode is all', () => {
        const projectAccess: ProjectAccess = {
            mode: 'all',
        };

        const projectParam = 'IS:project3';

        const result = filterAccessibleProjects(projectParam, projectAccess);

        expect(result).toBe(projectParam);
    });

    it('should filter out projects not in allowedProjects when mode is limited', () => {
        const projectAccess: ProjectAccess = {
            mode: 'limited',
            projects: ['project1', 'project2'],
        };

        const projectParam = 'IS_ANY_OF:project1,project3';

        const result = filterAccessibleProjects(projectParam, projectAccess);

        expect(result).toBe('IS_ANY_OF:project1');
    });

    it('should return a single project if only one is allowed', () => {
        const projectAccess: ProjectAccess = {
            mode: 'limited',
            projects: ['project1'],
        };

        const projectParam = 'IS_ANY_OF:project1,project2';

        const result = filterAccessibleProjects(projectParam, projectAccess);

        expect(result).toBe('IS_ANY_OF:project1');
    });

    it('should return undefined if projectParam is undefined and projectAccess mode is all', () => {
        const projectAccess: ProjectAccess = {
            mode: 'all',
        };

        const projectParam = undefined;

        const result = filterAccessibleProjects(projectParam, projectAccess);

        expect(result).toBeUndefined();
    });

    it('should return the original projectParam if all projects are allowed when mode is limited', () => {
        const projectAccess: ProjectAccess = {
            mode: 'limited',
            projects: ['project1', 'project2', 'project3'],
        };

        const projectParam = 'IS_ANY_OF:project1,project2';

        const result = filterAccessibleProjects(projectParam, projectAccess);

        expect(result).toBe('IS_ANY_OF:project1,project2');
    });

    it('should throw an error if no projects match', () => {
        const projectAccess: ProjectAccess = {
            mode: 'limited',
            projects: ['project1', 'project2'],
        };

        const projectParam = 'IS_ANY_OF:project3,project4';

        expect(() =>
            filterAccessibleProjects(projectParam, projectAccess),
        ).toThrow('No accessible projects in the search parameters');
    });
});

describe('storeEvents', () => {
    test.each([
        {},
        {
            data: {
                name: 'test',
            },
        },
        {
            predata: {
                name: 'pretest',
            },
            data: {
                name: 'test',
            },
        },
    ])('should store the event %s', async (preDataAndData: Pick<
        IBaseEvent,
        'preData' | 'data'
    >) => {
        const eventStore = {
            batchStore: vi.fn(),
        } as unknown as IEventStore;
        const eventService = new EventService(
            {
                eventStore,
                featureTagStore: {
                    getAllByFeatures: vi.fn().mockReturnValue([]),
                } as unknown as IFeatureTagStore,
            },
            { getLogger, eventBus: undefined } as unknown as IUnleashConfig,
            undefined as unknown as IPrivateProjectChecker,
            undefined as unknown as IAccessReadModel,
        );

        const event = {
            type: USER_UPDATED,
            createdBy: 'test',
            createdByUserId: 1,
            ip: '127.0.0.1',
            ...preDataAndData,
        };

        await eventService.storeEvent(event);
        expect(eventStore.batchStore).toHaveBeenCalledWith([event]);
    });
    test('should not store the event when predata and data are the same', async () => {
        const eventStore = {
            batchStore: vi.fn(),
        } as unknown as IEventStore;
        const eventService = new EventService(
            {
                eventStore,
                featureTagStore: {
                    getAllByFeatures: vi.fn().mockReturnValue([]),
                } as unknown as IFeatureTagStore,
            },
            { getLogger, eventBus: undefined } as unknown as IUnleashConfig,
            undefined as unknown as IPrivateProjectChecker,
            undefined as unknown as IAccessReadModel,
        );

        const event = {
            type: USER_UPDATED,
            createdBy: 'test',
            createdByUserId: 1,
            ip: '127.0.0.1',
            preData: {
                name: 'test',
                nest: {
                    this: 'object',
                },
            },
            data: {
                name: 'test',
                nest: {
                    this: 'object',
                },
            },
        };

        await eventService.storeEvent(event);
        expect(eventStore.batchStore).not.toHaveBeenCalled();
    });
});

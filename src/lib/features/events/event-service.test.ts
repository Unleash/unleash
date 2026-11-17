import log4js from 'log4js';
const { getLogger } = log4js;
import type {
    IEventStore,
    IFeatureTagStore,
    IUnleashConfig,
} from '../../internals.js';
import type { IAccessReadModel } from '../access/access-read-model-type.js';
import type { IPrivateProjectChecker } from '../private-project/privateProjectCheckerType.js';
import EventService from './event-service.js';
import { type IBaseEvent, USER_UPDATED } from '../../events/index.js';

import { vi } from 'vitest';

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

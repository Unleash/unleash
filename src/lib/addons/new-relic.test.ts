import {
    type IFlagResolver,
    type IAddonConfig,
    serializeDates,
    type IFlagKey,
} from '../types/index.js';

import NewRelicAddon, { type INewRelicParameters } from './new-relic.js';

import noLogger from '../../test/fixtures/no-logger.js';
import { gunzip } from 'node:zlib';
import { promisify } from 'util';
import type { IntegrationEventsService } from '../services/index.js';
import {
    FEATURE_CREATED,
    type IEvent,
    FEATURE_ARCHIVED,
    FEATURE_ENVIRONMENT_DISABLED,
} from '../events/index.js';
import { vi } from 'vitest';
import nock from 'nock';

const _asyncGunzip = promisify(gunzip);

const registerEventMock = vi.fn();

const INTEGRATION_ID = 1337;
const ARGS: IAddonConfig = {
    getLogger: noLogger,
    unleashUrl: 'http://some-url.com',
    integrationEventsService: {
        registerEvent: registerEventMock,
    } as unknown as IntegrationEventsService,
    flagResolver: { isEnabled: (_expName: IFlagKey) => false } as IFlagResolver,
    eventBus: {
        emit: vi.fn(),
    } as any,
};

const defaultParameters = {
    url: 'http://fakeurl',
    licenseKey: 'fakeLicenseKey',
} as INewRelicParameters;

const defaultEvent = {
    id: 1,
    createdAt: new Date(),
    type: FEATURE_CREATED,
    createdBy: 'some@user.com',
    createdByUserId: -1337,
    featureName: 'some-toggle',
    data: {
        name: 'some-toggle',
        enabled: false,
        strategies: [{ name: 'default' }],
    },
} as IEvent;

const makeAddHandleEvent = (
    event: IEvent,
    parameters: INewRelicParameters,
): (() => Promise<void>) => {
    const addon = new NewRelicAddon(ARGS);

    return async () => {
        await addon.handleEvent(event, parameters, INTEGRATION_ID);
    };
};

describe('New Relic integration', () => {
    beforeEach(() => {
        registerEventMock.mockClear();
    });

    test.each([
        {
            partialEvent: { type: FEATURE_CREATED },
            test: '$type toggle',
        },
        {
            partialEvent: {
                type: FEATURE_ARCHIVED,
                data: {
                    name: 'some-toggle',
                },
            },
            test: 'FEATURE_ARCHIVED toggle with project info',
        },
        {
            partialEvent: {
                type: FEATURE_ARCHIVED,
                project: 'some-project',
                data: {
                    name: 'some-toggle',
                },
            },
            test: 'FEATURE_ARCHIVED with project info',
        },
        {
            partialEvent: {
                type: FEATURE_ENVIRONMENT_DISABLED,
                environment: 'development',
            },
            test: 'toggled environment',
        },
        {
            partialEvent: {
                type: FEATURE_ENVIRONMENT_DISABLED,
                environment: 'development',
            },
            partialParameters: {
                customHeaders: `{ "MY_CUSTOM_HEADER": "MY_CUSTOM_VALUE" }`,
            },
            test: 'customHeaders in headers when calling service',
        },
        {
            partialEvent: {
                type: FEATURE_ENVIRONMENT_DISABLED,
                environment: 'development',
            },
            partialParameters: {
                bodyTemplate:
                    '{\n  "eventType": "{{event.type}}",\n  "createdBy": "{{event.createdBy}}"\n}',
            },
            test: 'custom body template',
        },
    ] as Array<{
        partialEvent: Partial<IEvent>;
        partialParameters?: Partial<INewRelicParameters>;
        test: String;
    }>)('Should call New Relic Event API for $test', async ({
        partialEvent,
        partialParameters,
    }) => {
        const event = {
            ...defaultEvent,
            ...partialEvent,
        };

        const parameters = {
            ...defaultParameters,
            ...partialParameters,
        };

        const handleEvent = makeAddHandleEvent(event, parameters);

        let body: any;
        nock('http://fakeurl')
            .post('/')
            .matchHeader('Content-Type', 'application/json')
            .matchHeader('Api-Key', parameters.licenseKey)
            .matchHeader('Content-Encoding', 'gzip')
            .reply(200, (_uri, requestBody) => {
                body = requestBody;
                return [200, 'OK'];
            });
        await handleEvent();
        expect(nock.isDone()).toBe(true);

        const jsonBody = body;

        expect(jsonBody.eventType).toBe('UnleashServiceEvent');
        expect(jsonBody.unleashEventType).toBe(event.type);
        expect(jsonBody.featureName).toBe(event.data.name);
        expect(jsonBody.environment).toBe(event.environment);
        expect(jsonBody.createdBy).toBe(event.createdBy);
        expect(jsonBody.createdByUserId).toBe(event.createdByUserId);
        expect(jsonBody.createdAt).toBe(event.createdAt.getTime());
    });

    test('Should call registerEvent', async () => {
        const handleEvent = makeAddHandleEvent(defaultEvent, defaultParameters);

        nock('http://fakeurl')
            .post('/')
            .matchHeader('Content-Type', 'application/json')
            .matchHeader('Api-Key', defaultParameters.licenseKey)
            .matchHeader('Content-Encoding', 'gzip')
            .reply(200, () => {
                return [200, 'OK'];
            });
        await handleEvent();

        expect(registerEventMock).toHaveBeenCalledTimes(1);
        expect(registerEventMock).toHaveBeenCalledWith({
            integrationId: INTEGRATION_ID,
            state: 'success',
            stateDetails:
                'New Relic Events API request was successful with status code: 200.',
            event: serializeDates(defaultEvent),
            details: {
                url: defaultParameters.url,
                body: {
                    eventType: 'UnleashServiceEvent',
                    unleashEventType: defaultEvent.type,
                    featureName: defaultEvent.featureName,
                    environment: defaultEvent.environment,
                    createdBy: defaultEvent.createdBy,
                    createdByUserId: defaultEvent.createdByUserId,
                    createdAt: defaultEvent.createdAt.getTime(),
                    ...defaultEvent.data,
                },
            },
        });
    });
});

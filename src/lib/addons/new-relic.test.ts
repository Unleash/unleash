import {
    FEATURE_ARCHIVED,
    FEATURE_CREATED,
    FEATURE_ENVIRONMENT_DISABLED,
    type IFlagResolver,
    type IAddonConfig,
    type IEvent,
} from '../types';
import type { Logger } from '../logger';

import NewRelicAddon, { type INewRelicParameters } from './new-relic';

import noLogger from '../../test/fixtures/no-logger';
import { gunzip } from 'node:zlib';
import { promisify } from 'util';
import type { IntegrationEventsService } from '../services';

const asyncGunzip = promisify(gunzip);

let fetchRetryCalls: any[] = [];

const INTEGRATION_ID = 1337;
const ARGS: IAddonConfig = {
    getLogger: noLogger,
    unleashUrl: 'http://some-unleash-url',
    integrationEventsService: {} as IntegrationEventsService,
    flagResolver: {} as IFlagResolver,
};

jest.mock(
    './addon',
    () =>
        class Addon {
            logger: Logger;

            constructor(definition, { getLogger }) {
                this.logger = getLogger('addon/test');
                fetchRetryCalls = [];
            }

            async fetchRetry(url, options, retries, backoff) {
                fetchRetryCalls.push({
                    url,
                    options,
                    retries,
                    backoff,
                });
                return Promise.resolve({ status: 200 });
            }

            async registerEvent(_) {
                return Promise.resolve();
            }
        },
);

const defaultParameters = {
    url: 'fakeUrl',
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

const makeAddHandleEvent = (event: IEvent, parameters: INewRelicParameters) => {
    const addon = new NewRelicAddon(ARGS);

    return () => addon.handleEvent(event, parameters, INTEGRATION_ID);
};

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
}>)(
    'Should call New Relic Event API for $test',
    async ({ partialEvent, partialParameters }) => {
        const event = {
            ...defaultEvent,
            ...partialEvent,
        };

        const parameters = {
            ...defaultParameters,
            ...partialParameters,
        };

        const handleEvent = makeAddHandleEvent(event, parameters);

        await handleEvent();
        expect(fetchRetryCalls.length).toBe(1);

        const { url, options } = fetchRetryCalls[0];
        const jsonBody = JSON.parse(
            (await asyncGunzip(options.body)).toString(),
        );

        expect(url).toBe(parameters.url);
        expect(options.method).toBe('POST');
        expect(options.headers['Api-Key']).toBe(parameters.licenseKey);
        expect(options.headers['Content-Type']).toBe('application/json');
        expect(options.headers['Content-Encoding']).toBe('gzip');
        expect(options.headers).toMatchSnapshot();

        expect(jsonBody.eventType).toBe('UnleashServiceEvent');
        expect(jsonBody.unleashEventType).toBe(event.type);
        expect(jsonBody.featureName).toBe(event.data.name);
        expect(jsonBody.environment).toBe(event.environment);
        expect(jsonBody.createdBy).toBe(event.createdBy);
        expect(jsonBody.createdByUserId).toBe(event.createdByUserId);
        expect(jsonBody.createdAt).toBe(event.createdAt.getTime());
    },
);

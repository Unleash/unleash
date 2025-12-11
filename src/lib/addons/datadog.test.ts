import {
    FEATURE_ARCHIVED,
    FEATURE_CREATED,
    FEATURE_ENVIRONMENT_DISABLED,
    type IEvent,
} from '../events/index.js';

import DatadogAddon from './datadog.js';

import noLogger from '../../test/fixtures/no-logger.js';
import {
    type IFlagKey,
    serializeDates,
    type IAddonConfig,
    type IFlagResolver,
} from '../types/index.js';
import type { IntegrationEventsService } from '../services/index.js';
import nock from 'nock';
import { vi } from 'vitest';

const INTEGRATION_ID = 1337;
const ARGS: IAddonConfig = {
    getLogger: noLogger,
    unleashUrl: 'http://some-url.com',
    integrationEventsService: {
        registerEvent: vi.fn(),
    } as unknown as IntegrationEventsService,
    flagResolver: { isEnabled: (_expName: IFlagKey) => false } as IFlagResolver,
    eventBus: <any>{ emit: vi.fn() },
};

describe('Datadog integration', () => {
    beforeEach(() => {
        nock.disableNetConnect();
    });

    afterEach(() => {
        nock.cleanAll();
        nock.enableNetConnect();
    });

    test('Should call datadog webhook', async () => {
        const addon = new DatadogAddon(ARGS);
        const event: IEvent = {
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
        };

        const parameters = {
            url: 'http://api.datadoghq.com/api/v1/events',
            apiKey: 'fakeKey',
        };

        let body: any;
        nock('http://api.datadoghq.com')
            .post('/api/v1/events')
            .matchHeader('Content-Type', 'application/json')
            .matchHeader('dd-api-key', 'fakeKey')
            .reply(200, (_uri, requestBody) => {
                body = requestBody;
                return {
                    status: 'ok',
                    status_code: 200,
                };
            });
        await addon.handleEvent(event, parameters, INTEGRATION_ID);
        expect(JSON.stringify(body)).toMatchSnapshot();
        expect(nock.isDone()).toBe(true);
    });

    test('Should call datadog webhook  for archived toggle', async () => {
        const addon = new DatadogAddon(ARGS);
        const event: IEvent = {
            id: 2,
            createdAt: new Date(),
            type: FEATURE_ARCHIVED,
            createdBy: 'some@user.com',
            createdByUserId: -1337,
            featureName: 'some-toggle',
            data: {
                name: 'some-toggle',
            },
        };

        const parameters = {
            url: 'http://api.datadoghq.com/api/v1/events',
            apiKey: 'fakeKey',
        };

        let body: any;
        nock('http://api.datadoghq.com')
            .post('/api/v1/events')
            .matchHeader('Content-Type', 'application/json')
            .matchHeader('dd-api-key', 'fakeKey')
            .reply(200, (_uri, requestBody) => {
                body = requestBody;
                return {
                    status: 'ok',
                    status_code: 200,
                };
            });

        await addon.handleEvent(event, parameters, INTEGRATION_ID);
        expect(JSON.stringify(body)).toMatchSnapshot();
        expect(nock.isDone()).toBe(true);
    });

    test('Should call datadog webhook  for archived toggle with project info', async () => {
        const addon = new DatadogAddon(ARGS);
        const event: IEvent = {
            id: 2,
            createdAt: new Date(),
            type: FEATURE_ARCHIVED,
            createdBy: 'some@user.com',
            featureName: 'some-toggle',
            createdByUserId: -1337,
            project: 'some-project',
            data: {
                name: 'some-toggle',
            },
        };

        const parameters = {
            url: 'http://api.datadoghq.com/api/v1/events',
            apiKey: 'fakeKey',
        };
        let body: any;
        nock('http://api.datadoghq.com')
            .post('/api/v1/events')
            .matchHeader('Content-Type', 'application/json')
            .matchHeader('dd-api-key', 'fakeKey')
            .reply(200, (_uri, requestBody) => {
                body = requestBody;
                return {
                    status: 'ok',
                    status_code: '200',
                };
            });

        await addon.handleEvent(event, parameters, INTEGRATION_ID);
        expect(JSON.stringify(body)).toMatchSnapshot();
        expect(nock.isDone()).toBe(true);
    });

    test('Should call datadog webhook for toggled environment', async () => {
        const addon = new DatadogAddon(ARGS);
        const event: IEvent = {
            id: 2,
            createdAt: new Date(),
            type: FEATURE_ENVIRONMENT_DISABLED,
            createdBy: 'some@user.com',
            createdByUserId: -1337,
            environment: 'development',
            project: 'default',
            featureName: 'some-toggle',
            data: {
                name: 'some-toggle',
            },
        };

        const parameters = {
            apiKey: 'fakeKey',
        };

        let reqBody: any = { sample: 'disabled' };
        nock('https://api.datadoghq.com')
            .post('/api/v1/events')
            .matchHeader('Content-Type', 'application/json')
            .matchHeader('dd-api-key', 'fakeKey')
            .reply(200, (_uri, requestBody) => {
                reqBody = requestBody;
                return {
                    status: 'ok',
                    status_code: '200',
                };
            });

        await addon.handleEvent(event, parameters, INTEGRATION_ID);
        expect(JSON.stringify(reqBody)).toMatch(/disabled/);
        expect(JSON.stringify(reqBody)).toMatchSnapshot();
        expect(nock.isDone()).toBe(true);
    });

    test('Should include customHeaders in headers when calling service', async () => {
        const addon = new DatadogAddon(ARGS);
        const event: IEvent = {
            id: 2,
            createdAt: new Date(),
            type: FEATURE_ENVIRONMENT_DISABLED,
            createdBy: 'some@user.com',
            environment: 'development',
            createdByUserId: -1337,
            project: 'default',
            featureName: 'some-toggle',
            data: {
                name: 'some-toggle',
            },
        };

        const parameters = {
            apiKey: 'fakeKey',
            customHeaders: `{ "MY_CUSTOM_HEADER": "MY_CUSTOM_VALUE" }`,
        };

        let body: any;
        nock('https://api.datadoghq.com')
            .post('/api/v1/events')
            .matchHeader('Content-Type', 'application/json')
            .matchHeader('dd-api-key', 'fakeKey')
            .matchHeader('MY_CUSTOM_HEADER', 'MY_CUSTOM_VALUE')
            .reply(200, (_uri, requestBody) => {
                body = requestBody;
                return {
                    status: 'ok',
                    status_code: '200',
                };
            });

        await addon.handleEvent(event, parameters, INTEGRATION_ID);
        expect(JSON.stringify(body)).toMatch(/disabled/);
        expect(JSON.stringify(body)).toMatchSnapshot();
        expect(nock.isDone()).toBe(true);
    });

    test('Should not include source_type_name when included in the config', async () => {
        const addon = new DatadogAddon(ARGS);
        const event: IEvent = {
            id: 2,
            createdAt: new Date(),
            type: FEATURE_ENVIRONMENT_DISABLED,
            createdBy: 'some@user.com',
            createdByUserId: -1337,
            environment: 'development',
            project: 'default',
            featureName: 'some-toggle',
            data: {
                name: 'some-toggle',
            },
        };

        const parameters = {
            apiKey: 'fakeKey',
            sourceTypeName: 'my-custom-source-type',
        };

        let body: any;
        nock('https://api.datadoghq.com')
            .post('/api/v1/events')
            .matchHeader('Content-Type', 'application/json')
            .matchHeader('dd-api-key', 'fakeKey')
            .reply(200, (_uri, requestBody) => {
                body = requestBody;
                return {
                    status: 'ok',
                    status_code: '200',
                };
            });

        await addon.handleEvent(event, parameters, INTEGRATION_ID);
        expect(JSON.stringify(body)).toMatch(
            /"source_type_name":"my-custom-source-type"/,
        );
        expect(JSON.stringify(body)).toMatchSnapshot();
        expect(nock.isDone()).toBe(true);
    });

    test('Should call datadog webhook with JSON when template set', async () => {
        const addon = new DatadogAddon(ARGS);
        const event: IEvent = {
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
        };

        const parameters = {
            url: 'http://api.datadoghq.com/api/v1/events',
            apiKey: 'fakeKey',
            bodyTemplate:
                '{\n  "event": "{{event.type}}",\n  "createdBy": "{{event.createdBy}}"\n}',
        };

        let body: any;
        nock('http://api.datadoghq.com')
            .post('/api/v1/events')
            .matchHeader('Content-Type', 'application/json')
            .matchHeader('dd-api-key', 'fakeKey')
            .reply(200, (_uri, requestBody) => {
                body = requestBody;
                return {
                    status: 'ok',
                    status_code: '200',
                };
            });

        await addon.handleEvent(event, parameters, INTEGRATION_ID);

        expect(nock.isDone()).toBe(true);
        expect(JSON.stringify(body)).toMatchSnapshot();
    });

    test('Should call registerEvent', async () => {
        const addon = new DatadogAddon(ARGS);
        const registerEventSpy = vi.spyOn(addon, 'registerEvent');
        const event: IEvent = {
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
            tags: [
                {
                    type: 'test',
                    value: '1',
                },
                {
                    type: 'test',
                    value: '2',
                },
            ],
        };

        const parameters = {
            url: 'http://api.datadoghq.com/api/v1/events',
            apiKey: 'fakeKey',
            bodyTemplate:
                '{\n  "event": "{{event.type}}",\n  "createdBy": "{{event.createdBy}}"\n}',
        };

        let _body: any;
        nock('http://api.datadoghq.com')
            .post('/api/v1/events')
            .matchHeader('Content-Type', 'application/json')
            .matchHeader('dd-api-key', 'fakeKey')
            .reply(200, (_uri, requestBody) => {
                _body = requestBody;
                return {
                    status: 'ok',
                    status_code: '200',
                };
            });

        await addon.handleEvent(event, parameters, INTEGRATION_ID);

        expect(registerEventSpy).toHaveBeenCalledTimes(1);
        expect(registerEventSpy).toHaveBeenCalledWith({
            integrationId: INTEGRATION_ID,
            state: 'success',
            stateDetails:
                'Datadog Events API request was successful with status code: 200.',
            event: serializeDates(event),
            details: {
                url: parameters.url,
                body: {
                    text: `{\n  "event": "${event.type}",\n  "createdBy": "${event.createdBy}"\n}`,
                    title: 'Unleash notification update',
                    tags: ['test:1', 'test:2'],
                },
            },
        });
    });
});

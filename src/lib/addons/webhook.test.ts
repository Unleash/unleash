import { FEATURE_CREATED, type IEvent } from '../events/index.js';

import WebhookAddon from './webhook.js';

import noLogger from '../../test/fixtures/no-logger.js';
import {
    type IAddonConfig,
    type IFlagKey,
    type IFlagResolver,
    serializeDates,
    SYSTEM_USER_ID,
} from '../types/index.js';
import type { IntegrationEventsService } from '../services/index.js';

import { vi } from 'vitest';
import EventEmitter from 'node:events';
import nock from 'nock';

const INTEGRATION_ID = 1337;

beforeEach(() => {
    nock.disableNetConnect();
});

afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
});

const setup = () => {
    const registerEventMock = vi.fn();
    const addonConfig: IAddonConfig = {
        getLogger: noLogger,
        unleashUrl: 'http://some-url.com',
        integrationEventsService: {
            registerEvent: registerEventMock,
        } as unknown as IntegrationEventsService,
        flagResolver: {
            isEnabled: (_expName: IFlagKey) => false,
        } as IFlagResolver,
        eventBus: new EventEmitter(),
    };
    return {
        addon: new WebhookAddon(addonConfig),
        registerEventMock,
    };
};

describe('Webhook integration', () => {
    test('Should handle event without "bodyTemplate"', async () => {
        const { addon } = setup();
        const event: IEvent = {
            id: 1,
            createdAt: new Date(),
            createdByUserId: SYSTEM_USER_ID,
            type: FEATURE_CREATED,
            createdBy: 'some@user.com',
            featureName: 'some-toggle',
            data: {
                name: 'some-toggle',
                enabled: false,
                strategies: [{ name: 'default' }],
            },
        };

        const parameters = {
            url: 'http://test.webhook.com',
        };
        let callCount = 0;
        let callBody: any;
        nock('http://test.webhook.com')
            .post('/')
            .matchHeader('Content-Type', 'application/json')
            .reply(200, (_uri, body) => {
                callCount++;
                callBody = body;
                return { ok: true, status: 200 };
            });

        await addon.handleEvent(event, parameters, INTEGRATION_ID);
        expect(callCount).toBe(1);
        expect(JSON.stringify(callBody)).toBe(JSON.stringify(event));
        expect(nock.isDone()).toBe(true);
    });

    test('Should format event with "bodyTemplate"', async () => {
        const { addon } = setup();
        const event: IEvent = {
            id: 1,
            createdAt: new Date(),
            createdByUserId: SYSTEM_USER_ID,
            type: FEATURE_CREATED,
            createdBy: 'some@user.com',
            featureName: 'some-toggle',
            data: {
                name: 'some-toggle',
                enabled: false,
                strategies: [{ name: 'default' }],
            },
        };

        const parameters = {
            url: 'http://test.webhook.com/plain',
            bodyTemplate: '{{event.type}} on toggle {{event.data.name}}',
            contentType: 'text/plain',
        };
        const expectedBody = 'feature-created on toggle some-toggle';
        nock('http://test.webhook.com')
            .post('/plain', expectedBody)
            .matchHeader('Content-Type', 'text/plain')
            .reply(200);

        await addon.handleEvent(event, parameters, INTEGRATION_ID);
        expect(nock.isDone()).toBe(true);
    });

    test('should allow for eventJson and eventMarkdown in bodyTemplate', async () => {
        const { addon } = setup();
        const event: IEvent = {
            id: 1,
            createdAt: new Date('2024-07-24T00:00:00.000Z'),
            createdByUserId: SYSTEM_USER_ID,
            type: FEATURE_CREATED,
            createdBy: 'some@user.com',
            featureName: 'some-toggle',
            project: 'default',
            data: {
                name: 'some-toggle',
                enabled: false,
                strategies: [{ name: 'default' }],
            },
        };

        const parameters = {
            url: 'http://test.webhook.com/plain',
            bodyTemplate:
                '{\n  "json": {{{eventJson}}},\n  "markdown": "{{eventMarkdown}}"\n}',
            contentType: 'text/plain',
        };
        let callBody: any;
        nock('http://test.webhook.com')
            .post('/plain')
            .matchHeader('Content-Type', 'text/plain')
            .reply(200, (_uri, body) => {
                callBody = body;
                return {
                    status: 200,
                    body: 'ok',
                };
            });

        await addon.handleEvent(event, parameters, INTEGRATION_ID);
        expect(callBody).toMatchSnapshot();
        expect(JSON.parse(JSON.parse(callBody).json)).toEqual(
            serializeDates(event),
        );
        expect(nock.isDone()).toBe(true);
    });

    test('Should format event with "authorization"', async () => {
        const { addon } = setup();
        const event: IEvent = {
            id: 1,
            createdAt: new Date(),
            createdByUserId: SYSTEM_USER_ID,
            type: FEATURE_CREATED,
            createdBy: 'some@user.com',
            featureName: 'some-toggle',
            data: {
                name: 'some-toggle',
                enabled: false,
                strategies: [{ name: 'default' }],
            },
        };

        const parameters = {
            url: 'http://test.webhook.com/plain',
            bodyTemplate: '{{event.type}} on toggle {{event.data.name}}',
            contentType: 'text/plain',
            authorization: 'API KEY 123abc',
        };
        const expectedBody = 'feature-created on toggle some-toggle';
        nock('http://test.webhook.com')
            .post('/plain', expectedBody)
            .matchHeader('Content-Type', 'text/plain')
            .matchHeader('Authorization', 'API KEY 123abc')
            .reply(200);

        await addon.handleEvent(event, parameters, INTEGRATION_ID);
        expect(nock.isDone()).toBe(true);
    });

    test('Should handle custom headers', async () => {
        const { addon } = setup();
        const event: IEvent = {
            id: 1,
            createdAt: new Date(),
            createdByUserId: SYSTEM_USER_ID,
            type: FEATURE_CREATED,
            createdBy: 'some@user.com',
            featureName: 'some-toggle',
            data: {
                name: 'some-toggle',
                enabled: false,
                strategies: [{ name: 'default' }],
            },
        };

        const parameters = {
            url: 'http://test.webhook.com/plain',
            bodyTemplate: '{{event.type}} on toggle {{event.data.name}}',
            contentType: 'text/plain',
            authorization: 'API KEY 123abc',
            customHeaders: `{ "MY_CUSTOM_HEADER": "MY_CUSTOM_VALUE" }`,
        };

        const expectedBody = 'feature-created on toggle some-toggle';
        nock('http://test.webhook.com')
            .post('/plain', expectedBody)
            .matchHeader('Content-Type', 'text/plain')
            .matchHeader('Authorization', 'API KEY 123abc')
            .matchHeader('MY_CUSTOM_HEADER', 'MY_CUSTOM_VALUE')
            .reply(200);
        await addon.handleEvent(event, parameters, INTEGRATION_ID);
        expect(nock.isDone()).toBe(true);
    });

    test('Should call registerEvent', async () => {
        const { addon, registerEventMock } = setup();
        const event: IEvent = {
            id: 1,
            createdAt: new Date(),
            createdByUserId: SYSTEM_USER_ID,
            type: FEATURE_CREATED,
            createdBy: 'some@user.com',
            featureName: 'some-toggle',
            data: {
                name: 'some-toggle',
                enabled: false,
                strategies: [{ name: 'default' }],
            },
        };

        const parameters = {
            url: 'http://test.webhook.com/plain',
            bodyTemplate: '{{event.type}} on toggle {{event.data.name}}',
            contentType: 'text/plain',
            authorization: 'API KEY 123abc',
            customHeaders: `{ "MY_CUSTOM_HEADER": "MY_CUSTOM_VALUE" }`,
        };
        const expectedBody = 'feature-created on toggle some-toggle';
        nock('http://test.webhook.com')
            .post('/plain', expectedBody)
            .matchHeader('Content-Type', 'text/plain')
            .matchHeader('Authorization', 'API KEY 123abc')
            .matchHeader('MY_CUSTOM_HEADER', 'MY_CUSTOM_VALUE')
            .reply(200);

        await addon.handleEvent(event, parameters, INTEGRATION_ID);

        expect(registerEventMock).toHaveBeenCalledTimes(1);
        expect(registerEventMock).toHaveBeenCalledWith({
            integrationId: INTEGRATION_ID,
            state: 'success',
            stateDetails:
                'Webhook request was successful with status code: 200.',
            event: serializeDates(event),
            details: {
                url: parameters.url,
                contentType: parameters.contentType,
                body: expectedBody,
            },
        });
        expect(nock.isDone()).toBe(true);
    });
});

import {
    FEATURE_CREATED,
    FEATURE_ARCHIVED,
    FEATURE_ENVIRONMENT_DISABLED,
    type IEvent,
} from '../events/index.js';

import SlackAddon from './slack.js';

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
import nock from 'nock';

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
describe('Slack integration', () => {
    beforeEach(() => {
        registerEventMock.mockClear();
        nock.disableNetConnect();
        nock.cleanAll();
    });

    afterAll(() => {
        nock.enableNetConnect();
    });

    test('Should call slack webhook', async () => {
        const addon = new SlackAddon(ARGS);
        const event: IEvent = {
            id: 1,
            createdAt: new Date(),
            type: FEATURE_CREATED,
            createdByUserId: SYSTEM_USER_ID,
            createdBy: 'some@user.com',
            project: 'default',
            featureName: 'some-toggle',
            data: {
                name: 'some-toggle',
                enabled: false,
                type: 'release',
                strategies: [{ name: 'default' }],
            },
        };

        const parameters = {
            url: 'http://hooks.slack.com',
            defaultChannel: 'general',
        };

        let body: any;
        nock('http://hooks.slack.com')
            .post('/')
            .reply(200, (_, reqBody) => {
                body = reqBody;
                return { ok: true };
            });
        await addon.handleEvent(event, parameters, INTEGRATION_ID);
        expect(body).toMatchSnapshot();
        expect(nock.isDone()).toBe(true);
    });

    test('Should call slack webhook for archived toggle', async () => {
        const addon = new SlackAddon(ARGS);
        const event: IEvent = {
            id: 2,
            createdAt: new Date(),
            createdByUserId: SYSTEM_USER_ID,
            type: FEATURE_ARCHIVED,
            featureName: 'some-toggle',
            createdBy: 'some@user.com',
            data: {
                name: 'some-toggle',
            },
        };

        const parameters = {
            url: 'http://hooks.slack.com',
            defaultChannel: 'general',
        };

        let body: any;
        nock('http://hooks.slack.com')
            .post('/')
            .reply(200, (_, reqBody) => {
                body = reqBody;
                return { ok: true };
            });

        await addon.handleEvent(event, parameters, INTEGRATION_ID);
        expect(nock.isDone()).toBe(true);
        expect(JSON.stringify(body)).toMatchSnapshot();
    });

    test('Should call slack webhook for archived toggle with project info', async () => {
        const addon = new SlackAddon(ARGS);
        const event: IEvent = {
            id: 2,
            createdAt: new Date(),
            createdByUserId: SYSTEM_USER_ID,
            type: FEATURE_ARCHIVED,
            featureName: 'some-toggle',
            project: 'some-project',
            createdBy: 'some@user.com',
            data: {
                name: 'some-toggle',
            },
        };

        const parameters = {
            url: 'http://hooks.slack.com',
            defaultChannel: 'general',
        };

        let body: any;
        nock('http://hooks.slack.com')
            .post('/')
            .reply(200, (_, reqBody) => {
                body = reqBody;
                return { ok: true };
            });

        await addon.handleEvent(event, parameters, INTEGRATION_ID);
        expect(nock.isDone()).toBe(true);
        expect(JSON.stringify(body)).toMatchSnapshot();
    });

    test(`Should call webhook for toggled environment`, async () => {
        const addon = new SlackAddon(ARGS);
        const event: IEvent = {
            id: 2,
            createdAt: new Date(),
            createdByUserId: SYSTEM_USER_ID,
            type: FEATURE_ENVIRONMENT_DISABLED,
            createdBy: 'some@user.com',
            environment: 'development',
            project: 'default',
            featureName: 'some-toggle',
            data: {
                name: 'some-toggle',
            },
        };

        const parameters = {
            url: 'http://hooks.slack.com',
            defaultChannel: 'general',
        };

        let body: any;
        nock('http://hooks.slack.com')
            .post('/')
            .reply(200, (_, reqBody) => {
                body = reqBody;
                return { ok: true };
            });

        await addon.handleEvent(event, parameters, INTEGRATION_ID);
        expect(nock.isDone()).toBe(true);
        const stringifiedBody = JSON.stringify(body);
        expect(stringifiedBody).toMatchSnapshot();
        expect(stringifiedBody).toMatch(/disabled/);
    });

    test('Should use default channel', async () => {
        const addon = new SlackAddon(ARGS);
        const event: IEvent = {
            id: 3,
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
            url: 'http://hooks.slack.com',
            defaultChannel: 'some-channel',
        };

        let body: any;
        nock('http://hooks.slack.com')
            .post('/')
            .reply(200, (_, reqBody) => {
                body = reqBody;
                return { ok: true };
            });
        await addon.handleEvent(event, parameters, INTEGRATION_ID);

        expect(body.channel).toBe('#some-channel');
        expect(nock.isDone()).toBe(true);
    });

    test('Should override default channel with data from tag', async () => {
        const addon = new SlackAddon(ARGS);
        const event: IEvent = {
            id: 4,
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
            tags: [
                {
                    type: 'slack',
                    value: 'another-channel',
                },
            ],
        };

        const parameters = {
            url: 'http://hooks.slack.com',
            defaultChannel: 'some-channel',
        };

        let body: any;
        nock('http://hooks.slack.com')
            .post('/')
            .reply(200, (_, reqBody) => {
                body = reqBody;
                return { ok: true };
            });

        await addon.handleEvent(event, parameters, INTEGRATION_ID);

        expect(body.channel).toBe('#another-channel');
        expect(nock.isDone()).toBe(true);
    });

    test('Should post to all channels in tags', async () => {
        const addon = new SlackAddon(ARGS);
        const event: IEvent = {
            id: 5,
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
            tags: [
                {
                    type: 'slack',
                    value: 'another-channel-1',
                },
                {
                    type: 'slack',
                    value: 'another-channel-2',
                },
            ],
        };

        const parameters = {
            url: 'http://hooks.slack.com',
            defaultChannel: 'some-channel',
        };

        const bodies: any[] = [];
        nock('http://hooks.slack.com')
            .post('/')
            .times(2)
            .reply(200, (_, reqBody) => {
                bodies.push(reqBody);
                return { ok: true };
            });

        await addon.handleEvent(event, parameters, INTEGRATION_ID);

        const req1 = bodies[0];
        const req2 = bodies[1];

        expect(bodies).toHaveLength(2);
        expect(req1.channel).toBe('#another-channel-1');
        expect(req2.channel).toBe('#another-channel-2');
        expect(nock.isDone()).toBe(true);
    });

    test('Should include custom headers from parameters in call to service', async () => {
        const addon = new SlackAddon(ARGS);
        const event: IEvent = {
            id: 2,
            createdAt: new Date(),
            type: FEATURE_ENVIRONMENT_DISABLED,
            createdByUserId: SYSTEM_USER_ID,
            createdBy: 'some@user.com',
            environment: 'development',
            project: 'default',
            featureName: 'some-toggle',
            data: {
                name: 'some-toggle',
            },
        };

        const parameters = {
            url: 'http://hooks.slack.com',
            defaultChannel: 'general',
            customHeaders: `{ "MY_CUSTOM_HEADER": "MY_CUSTOM_VALUE" }`,
        };

        let body: any;
        nock('http://hooks.slack.com')
            .post('/')
            .matchHeader('MY_CUSTOM_HEADER', 'MY_CUSTOM_VALUE')
            .reply(200, (_, reqBody) => {
                body = reqBody;
                return { ok: true };
            });
        await addon.handleEvent(event, parameters, INTEGRATION_ID);
        const stringifiedBody = JSON.stringify(body);
        expect(stringifiedBody).toMatch(/disabled/);
        expect(stringifiedBody).toMatchSnapshot();
        expect(nock.isDone()).toBe(true);
    });

    test('Should call registerEvent', async () => {
        const addon = new SlackAddon(ARGS);
        const event: IEvent = {
            id: 2,
            createdAt: new Date(),
            type: FEATURE_ENVIRONMENT_DISABLED,
            createdByUserId: SYSTEM_USER_ID,
            createdBy: 'some@user.com',
            environment: 'development',
            project: 'default',
            featureName: 'some-toggle',
            data: {
                name: 'some-toggle',
            },
        };

        const parameters = {
            url: 'http://hooks.slack.com',
            defaultChannel: 'general',
            customHeaders: `{ "MY_CUSTOM_HEADER": "MY_CUSTOM_VALUE" }`,
        };

        nock('http://hooks.slack.com')
            .post('/')
            .matchHeader('MY_CUSTOM_HEADER', 'MY_CUSTOM_VALUE')
            .reply(200, () => {
                return { ok: true };
            });

        await addon.handleEvent(event, parameters, INTEGRATION_ID);

        expect(registerEventMock).toHaveBeenCalledTimes(1);
        expect(registerEventMock).toHaveBeenCalledWith({
            integrationId: INTEGRATION_ID,
            state: 'success',
            stateDetails:
                'All (1) Slack webhook requests were successful with status codes: 200.',
            event: serializeDates(event),
            details: {
                url: parameters.url,
                channels: ['general'],
                username: 'Unleash',
                message:
                    '*some@user.com* disabled *<http://some-url.com/projects/default/features/some-toggle|some-toggle>* for the *development* environment in project *<http://some-url.com/projects/default|default>*',
            },
        });
    });
});

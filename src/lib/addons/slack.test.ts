import {
    FEATURE_CREATED,
    FEATURE_ARCHIVED,
    FEATURE_ENVIRONMENT_DISABLED,
    type IEvent,
} from '../types/events';
import type { Logger } from '../logger';

import SlackAddon from './slack';

import noLogger from '../../test/fixtures/no-logger';
import {
    type IAddonConfig,
    type IFlagKey,
    type IFlagResolver,
    serializeDates,
    SYSTEM_USER_ID,
} from '../types';
import type { IntegrationEventsService } from '../services';

let fetchRetryCalls: any[] = [];
const registerEventMock = jest.fn();

const INTEGRATION_ID = 1337;
const ARGS: IAddonConfig = {
    getLogger: noLogger,
    unleashUrl: 'http://some-url.com',
    integrationEventsService: {} as IntegrationEventsService,
    flagResolver: { isEnabled: (expName: IFlagKey) => false } as IFlagResolver,
    eventBus: {} as any,
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
                return Promise.resolve({ ok: true, status: 200 });
            }

            async registerEvent(event) {
                return registerEventMock(event);
            }
        },
);

describe('Slack integration', () => {
    beforeEach(() => {
        registerEventMock.mockClear();
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

        await addon.handleEvent(event, parameters, INTEGRATION_ID);
        expect(fetchRetryCalls.length).toBe(1);
        expect(fetchRetryCalls[0].url).toBe(parameters.url);
        expect(fetchRetryCalls[0].options.body).toMatchSnapshot();
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

        await addon.handleEvent(event, parameters, INTEGRATION_ID);
        expect(fetchRetryCalls.length).toBe(1);
        expect(fetchRetryCalls[0].url).toBe(parameters.url);
        expect(fetchRetryCalls[0].options.body).toMatchSnapshot();
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

        await addon.handleEvent(event, parameters, INTEGRATION_ID);
        expect(fetchRetryCalls.length).toBe(1);
        expect(fetchRetryCalls[0].url).toBe(parameters.url);
        expect(fetchRetryCalls[0].options.body).toMatchSnapshot();
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

        await addon.handleEvent(event, parameters, INTEGRATION_ID);
        expect(fetchRetryCalls).toHaveLength(1);
        expect(fetchRetryCalls[0].url).toBe(parameters.url);
        expect(fetchRetryCalls[0].options.body).toMatch(/disabled/);
        expect(fetchRetryCalls[0].options.body).toMatchSnapshot();
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

        await addon.handleEvent(event, parameters, INTEGRATION_ID);

        const req = JSON.parse(fetchRetryCalls[0].options.body);

        expect(req.channel).toBe('#some-channel');
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

        await addon.handleEvent(event, parameters, INTEGRATION_ID);

        const req = JSON.parse(fetchRetryCalls[0].options.body);

        expect(req.channel).toBe('#another-channel');
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

        await addon.handleEvent(event, parameters, INTEGRATION_ID);

        const req1 = JSON.parse(fetchRetryCalls[0].options.body);
        const req2 = JSON.parse(fetchRetryCalls[1].options.body);

        expect(fetchRetryCalls).toHaveLength(2);
        expect(req1.channel).toBe('#another-channel-1');
        expect(req2.channel).toBe('#another-channel-2');
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

        await addon.handleEvent(event, parameters, INTEGRATION_ID);
        expect(fetchRetryCalls).toHaveLength(1);
        expect(fetchRetryCalls[0].url).toBe(parameters.url);
        expect(fetchRetryCalls[0].options.body).toMatch(/disabled/);
        expect(fetchRetryCalls[0].options.body).toMatchSnapshot();
        expect(fetchRetryCalls[0].options.headers).toMatchSnapshot();
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

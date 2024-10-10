import type { Logger } from '../logger';

import {
    FEATURE_ARCHIVED,
    FEATURE_CREATED,
    FEATURE_ENVIRONMENT_DISABLED,
    type IEvent,
} from '../types/events';

import TeamsAddon from './teams';

import noLogger from '../../test/fixtures/no-logger';
import {
    type IAddonConfig,
    type IFlagKey,
    type IFlagResolver,
    serializeDates,
    SYSTEM_USER_ID,
} from '../types';
import type { IntegrationEventsService } from '../services';

let fetchRetryCalls: any[];
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

describe('Teams integration', () => {
    beforeEach(() => {
        registerEventMock.mockClear();
    });

    test('Should call teams webhook', async () => {
        const addon = new TeamsAddon(ARGS);
        const event: IEvent = {
            id: 1,
            createdAt: new Date(),
            type: FEATURE_CREATED,
            createdByUserId: SYSTEM_USER_ID,
            createdBy: 'some@user.com',
            featureName: 'some-toggle',
            data: {
                name: 'some-toggle',
                enabled: false,
                strategies: [{ name: 'default' }],
            },
        };

        const parameters = {
            url: 'http://hooks.office.com',
        };

        await addon.handleEvent(event, parameters, INTEGRATION_ID);
        expect(fetchRetryCalls.length).toBe(1);
        expect(fetchRetryCalls[0].url).toBe(parameters.url);
        expect(fetchRetryCalls[0].options.body).toMatchSnapshot();
    });

    test('Should call teams webhook for archived toggle', async () => {
        const addon = new TeamsAddon(ARGS);
        const event: IEvent = {
            id: 1,
            createdAt: new Date(),
            createdByUserId: SYSTEM_USER_ID,
            type: FEATURE_ARCHIVED,
            createdBy: 'some@user.com',
            featureName: 'some-toggle',
            data: {
                name: 'some-toggle',
            },
        };

        const parameters = {
            url: 'http://hooks.office.com',
        };

        await addon.handleEvent(event, parameters, INTEGRATION_ID);
        expect(fetchRetryCalls.length).toBe(1);
        expect(fetchRetryCalls[0].url).toBe(parameters.url);
        expect(fetchRetryCalls[0].options.body).toMatchSnapshot();
    });

    test('Should call teams webhook for archived toggle with project info', async () => {
        const addon = new TeamsAddon(ARGS);
        const event: IEvent = {
            id: 1,
            createdAt: new Date(),
            createdByUserId: SYSTEM_USER_ID,
            type: FEATURE_ARCHIVED,
            createdBy: 'some@user.com',
            featureName: 'some-toggle',
            project: 'some-project',
            data: {
                name: 'some-toggle',
            },
        };

        const parameters = {
            url: 'http://hooks.office.com',
        };

        await addon.handleEvent(event, parameters, INTEGRATION_ID);
        expect(fetchRetryCalls.length).toBe(1);
        expect(fetchRetryCalls[0].url).toBe(parameters.url);
        expect(fetchRetryCalls[0].options.body).toMatchSnapshot();
    });

    test(`Should call teams webhook for toggled environment`, async () => {
        const addon = new TeamsAddon(ARGS);
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
        };

        await addon.handleEvent(event, parameters, INTEGRATION_ID);
        expect(fetchRetryCalls).toHaveLength(1);
        expect(fetchRetryCalls[0].url).toBe(parameters.url);
        expect(fetchRetryCalls[0].options.body).toMatch(/disabled/);
        expect(fetchRetryCalls[0].options.body).toMatchSnapshot();
    });

    test('Should include custom headers in call to teams', async () => {
        const addon = new TeamsAddon(ARGS);
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
        const addon = new TeamsAddon(ARGS);
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
            url: 'http://hooks.teams.com',
            customHeaders: `{ "MY_CUSTOM_HEADER": "MY_CUSTOM_VALUE" }`,
        };

        await addon.handleEvent(event, parameters, INTEGRATION_ID);

        expect(registerEventMock).toHaveBeenCalledTimes(1);
        expect(registerEventMock).toHaveBeenCalledWith({
            integrationId: INTEGRATION_ID,
            state: 'success',
            stateDetails:
                'Teams webhook request was successful with status code: 200.',
            event: serializeDates(event),
            details: {
                url: parameters.url,
                body: {
                    themeColor: '0076D7',
                    summary: 'Message',
                    sections: [
                        {
                            activityTitle: `*${event.createdBy}* disabled *[${event.featureName}](${ARGS.unleashUrl}/projects/${event.project}/features/${event.featureName})* for the *${event.environment}* environment in project *[${event.project}](${ARGS.unleashUrl}/projects/${event.project})*`,
                            activitySubtitle: `Unleash notification update`,
                            facts: [
                                {
                                    name: 'User',
                                    value: event.createdBy,
                                },
                                {
                                    name: 'Action',
                                    value: event.type,
                                },
                            ],
                        },
                    ],
                    potentialAction: [
                        {
                            '@type': 'OpenUri',
                            name: 'Go to feature',
                            targets: [
                                {
                                    os: 'default',
                                    uri: `${ARGS.unleashUrl}/projects/${event.project}/features/${event.featureName}`,
                                },
                            ],
                        },
                    ],
                },
            },
        });
    });
});

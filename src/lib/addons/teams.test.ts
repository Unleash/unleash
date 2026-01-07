import {
    FEATURE_ARCHIVED,
    FEATURE_CREATED,
    FEATURE_ENVIRONMENT_DISABLED,
    type IEvent,
} from '../events/index.js';

import TeamsAddon from './teams.js';

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

describe('Teams integration', () => {
    beforeEach(() => {
        registerEventMock.mockClear();
        nock.disableNetConnect();
        nock.cleanAll();
    });

    afterAll(() => {
        nock.enableNetConnect();
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

        let body: any;
        nock('http://hooks.office.com')
            .post('/')
            .reply(200, (_, reqBody) => {
                body = reqBody;
                return { ok: true };
            });

        await addon.handleEvent(event, parameters, INTEGRATION_ID);

        expect(JSON.stringify(body)).toMatchSnapshot();
        expect(nock.isDone()).toBe(true);
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

        let body: any;
        nock('http://hooks.office.com')
            .post('/')
            .reply(200, (_, reqBody) => {
                body = reqBody;
                return { ok: true };
            });
        await addon.handleEvent(event, parameters, INTEGRATION_ID);

        expect(JSON.stringify(body)).toMatchSnapshot();
        expect(nock.isDone()).toBe(true);
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

        let body: any;
        nock('http://hooks.office.com')
            .post('/')
            .reply(200, (_, reqBody) => {
                body = reqBody;
                return { ok: true };
            });
        await addon.handleEvent(event, parameters, INTEGRATION_ID);
        expect(JSON.stringify(body)).toMatchSnapshot();
        expect(nock.isDone()).toBe(true);
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
        let body: any;
        nock('http://hooks.slack.com')
            .post('/')
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

        nock('http://hooks.teams.com')
            .post('/')
            .matchHeader('MY_CUSTOM_HEADER', 'MY_CUSTOM_VALUE')
            .reply(200);

        await addon.handleEvent(event, parameters, INTEGRATION_ID);

        expect(nock.isDone()).toBe(true);
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

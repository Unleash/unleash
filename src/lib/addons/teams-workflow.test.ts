import TeamsWorkflowAddon from './teams-workflow.js';
import { vi } from 'vitest';
import {
    type IAddonConfig,
    type IFlagKey,
    type IFlagResolver,
    serializeDates,
    SYSTEM_USER_ID,
} from '../types/index.js';
import noLogger from '../../test/fixtures/no-logger.js';
import type { IntegrationEventsService } from '../features/integration-events/integration-events-service.js';
import {
    FEATURE_ARCHIVED,
    FEATURE_CREATED,
    FEATURE_ENVIRONMENT_DISABLED,
    type IEvent,
} from '../events/index.js';
import nock from 'nock';

const registerEventMock = vi.fn();

const INTEGRATION_ID = 3771;

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

describe('Teams workflow integration', () => {
    beforeEach(() => {
        registerEventMock.mockClear();
        nock.disableNetConnect();
        nock.cleanAll();
    });

    afterAll(() => {
        nock.enableNetConnect();
    });

    test('Should call teams workflow webhook', async () => {
        const addon = new TeamsWorkflowAddon(ARGS);
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
            url: 'http://environment.api.powerplatform.com',
        };
        let body: any;
        nock('http://environment.api.powerplatform.com')
            .post('/')
            .reply(200, (_, reqBody) => {
                body = reqBody;
                return { ok: true };
            });
        await addon.handleEvent(event, parameters, INTEGRATION_ID);
        expect(JSON.stringify(body)).toMatchSnapshot();
        expect(nock.isDone()).toBe(true);
    });
    test('Should call teams workflow webhook for archived toggle with project info', async () => {
        const addon = new TeamsWorkflowAddon(ARGS);
        const event: IEvent = {
            id: 1,
            createdAt: new Date(),
            type: FEATURE_ARCHIVED,
            createdByUserId: SYSTEM_USER_ID,
            createdBy: 'some@user.com',
            featureName: 'some-toggle',
            data: {
                name: 'some-toggle',
            },
        };
        const parameters = {
            url: 'http://environment.api.powerplatform.com',
        };
        let body: any;
        nock('http://environment.api.powerplatform.com')
            .post('/')
            .reply(200, (_, reqBody) => {
                body = reqBody;
                return { ok: true };
            });
        await addon.handleEvent(event, parameters, INTEGRATION_ID);
        expect(JSON.stringify(body)).toMatchSnapshot();
        expect(nock.isDone()).toBe(true);
    });
    test('Should call teams webhook for toggled environment', async () => {
        const addon = new TeamsWorkflowAddon(ARGS);
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
            url: 'http://environment.api.powerplatform.com',
        };
        let body: any;
        nock('http://environment.api.powerplatform.com')
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
    test('Should call registerEvent', async () => {
        const addon = new TeamsWorkflowAddon(ARGS);
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
                body: {
                    attachments: [
                        {
                            content: {
                                $schema:
                                    'http://adaptivecards.io/schemas/adaptive-card.json',
                                actions: [
                                    {
                                        title: 'Go to feature',
                                        type: 'Action.OpenUrl',
                                        url: `${ARGS.unleashUrl}/projects/${event.project}/features/${event.featureName}`,
                                    },
                                ],
                                body: [
                                    {
                                        items: [
                                            {
                                                style: 'heading',
                                                text: 'Unleash update notification',
                                                type: 'TextBlock',
                                            },
                                            {
                                                text: `*${event.createdBy}* disabled *[${event.featureName}](${ARGS.unleashUrl}/projects/${event.project}/features/${event.featureName})* for the *${event.environment}* environment in project *[${event.project}](${ARGS.unleashUrl}/projects/${event.project})*`,
                                                type: 'TextBlock',
                                                wrap: true,
                                            },
                                            {
                                                facts: [
                                                    {
                                                        title: 'User:',
                                                        value: event.createdBy,
                                                    },
                                                    {
                                                        title: 'Action:',
                                                        value: event.type,
                                                    },
                                                ],
                                                type: 'FactSet',
                                            },
                                        ],
                                        type: 'Container',
                                    },
                                ],
                                type: 'AdaptiveCard',
                                version: '1.5',
                            },
                            contentType:
                                'application/vnd.microsoft.card.adaptive',
                        },
                    ],
                    type: 'message',
                },
            },
        });
    });
});

import { type IEvent, FEATURE_ENVIRONMENT_ENABLED } from '../types/events';
import SlackAppAddon from './slack-app';
import { type ChatPostMessageArguments, ErrorCode } from '@slack/web-api';
import {
    type IAddonConfig,
    type IFlagKey,
    type IFlagResolver,
    serializeDates,
    SYSTEM_USER_ID,
} from '../types';
import type { IntegrationEventsService } from '../services';
import type { Logger } from '../logger';

const slackApiCalls: ChatPostMessageArguments[] = [];

const loggerMock = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
};
const getLogger = jest.fn(() => loggerMock);

const registerEventMock = jest.fn();

const INTEGRATION_ID = 1337;
const ARGS: IAddonConfig = {
    getLogger,
    unleashUrl: 'http://some-url.com',
    integrationEventsService: {} as IntegrationEventsService,
    flagResolver: { isEnabled: (expName: IFlagKey) => false } as IFlagResolver,
    eventBus: {} as any,
};

let postMessage = jest.fn().mockImplementation((options) => {
    slackApiCalls.push(options);
    return Promise.resolve();
});

jest.mock('@slack/web-api', () => ({
    WebClient: jest.fn().mockImplementation(() => ({
        chat: {
            postMessage,
        },
        on: jest.fn(),
    })),
    ErrorCode: {
        PlatformError: 'slack_webapi_platform_error',
    },
    WebClientEvent: {
        RATE_LIMITED: 'rate_limited',
    },
}));

jest.mock(
    './addon',
    () =>
        class Addon {
            logger: Logger;

            constructor(_, { getLogger }) {
                this.logger = getLogger('addon/test');
            }

            async registerEvent(event) {
                return registerEventMock(event);
            }
        },
);

describe('SlackAppAddon', () => {
    let addon: SlackAppAddon;
    const accessToken = 'test-access-token';
    const mockError = {
        code: ErrorCode.PlatformError,
        data: {
            error: 'Platform error message',
        },
    };

    const event: IEvent = {
        id: 1,
        createdAt: new Date(),
        type: FEATURE_ENVIRONMENT_ENABLED,
        createdByUserId: SYSTEM_USER_ID,
        createdBy: 'some@user.com',
        project: 'default',
        featureName: 'some-toggle',
        environment: 'development',
        data: {
            name: 'some-toggle',
            enabled: false,
            type: 'release',
            strategies: [{ name: 'default' }],
        },
    };

    beforeEach(() => {
        jest.useFakeTimers();
        slackApiCalls.length = 0;
        postMessage.mockClear();
        registerEventMock.mockClear();
        addon = new SlackAppAddon(ARGS);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should post message when feature is toggled', async () => {
        await addon.handleEvent(
            event,
            {
                accessToken,
                defaultChannels: 'general',
            },
            INTEGRATION_ID,
        );

        expect(slackApiCalls.length).toBe(1);
        expect(slackApiCalls[0].channel).toBe('general');
    });

    it('should post to all channels in defaultChannels', async () => {
        await addon.handleEvent(
            event,
            {
                accessToken,
                defaultChannels: 'general, another-channel-1',
            },
            INTEGRATION_ID,
        );

        expect(slackApiCalls.length).toBe(2);
        expect(slackApiCalls[0].channel).toBe('general');
        expect(slackApiCalls[1].channel).toBe('another-channel-1');
    });

    it('should post to all channels in tags', async () => {
        const eventWith2Tags: IEvent = {
            ...event,
            tags: [
                { type: 'slack', value: 'general' },
                { type: 'slack', value: 'another-channel-1' },
            ],
        };

        await addon.handleEvent(
            eventWith2Tags,
            {
                accessToken,
                defaultChannels: '',
            },
            INTEGRATION_ID,
        );

        expect(slackApiCalls.length).toBe(2);
        expect(slackApiCalls[0].channel).toBe('general');
        expect(slackApiCalls[1].channel).toBe('another-channel-1');
    });

    it('should concatenate defaultChannels and channels in tags to post to all unique channels found', async () => {
        const eventWith2Tags: IEvent = {
            ...event,
            tags: [
                { type: 'slack', value: 'general' },
                { type: 'slack', value: 'another-channel-1' },
            ],
        };

        await addon.handleEvent(
            eventWith2Tags,
            {
                accessToken,
                defaultChannels: 'another-channel-1, another-channel-2',
            },
            INTEGRATION_ID,
        );

        expect(slackApiCalls.length).toBe(3);
        expect(slackApiCalls[0].channel).toBe('general');
        expect(slackApiCalls[1].channel).toBe('another-channel-1');
        expect(slackApiCalls[2].channel).toBe('another-channel-2');
    });

    it('should not post a message if there are no tagged channels and no defaultChannels', async () => {
        await addon.handleEvent(
            event,
            {
                accessToken,
                defaultChannels: '',
            },
            INTEGRATION_ID,
        );

        expect(slackApiCalls.length).toBe(0);
    });

    it('should log error when an API call fails', async () => {
        postMessage = jest.fn().mockRejectedValue(mockError);

        await addon.handleEvent(
            event,
            {
                accessToken,
                defaultChannels: 'general',
            },
            INTEGRATION_ID,
        );

        expect(loggerMock.warn).toHaveBeenCalledWith(
            `All (1) Slack client calls failed with the following errors: A platform error occurred: ${JSON.stringify(mockError.data)}`,
        );
    });

    it('should handle rejections in chat.postMessage', async () => {
        const eventWith3Tags: IEvent = {
            ...event,
            tags: [
                { type: 'slack', value: 'general' },
                { type: 'slack', value: 'another-channel-1' },
                { type: 'slack', value: 'another-channel-2' },
            ],
        };

        postMessage = jest
            .fn()
            .mockResolvedValueOnce({ ok: true })
            .mockResolvedValueOnce({ ok: true })
            .mockRejectedValueOnce(mockError);

        await addon.handleEvent(
            eventWith3Tags,
            {
                accessToken,
                defaultChannels: '',
            },
            INTEGRATION_ID,
        );

        expect(postMessage).toHaveBeenCalledTimes(3);
        expect(loggerMock.warn).toHaveBeenCalledWith(
            `Some (1 of 3) Slack client calls failed. Errors: A platform error occurred: ${JSON.stringify(mockError.data)}`,
        );
    });

    test('Should call registerEvent', async () => {
        const eventWith2Tags: IEvent = {
            ...event,
            tags: [
                { type: 'slack', value: 'general' },
                { type: 'slack', value: 'another-channel-1' },
            ],
        };

        await addon.handleEvent(
            eventWith2Tags,
            {
                accessToken,
                defaultChannels: 'another-channel-1, another-channel-2',
            },
            INTEGRATION_ID,
        );

        expect(registerEventMock).toHaveBeenCalledTimes(1);
        expect(registerEventMock).toHaveBeenCalledWith({
            integrationId: INTEGRATION_ID,
            state: 'success',
            stateDetails: 'All (3) Slack client calls were successful.',
            event: serializeDates(eventWith2Tags),
            details: {
                channels: ['general', 'another-channel-1', 'another-channel-2'],
                message:
                    '*some@user.com* enabled *<http://some-url.com/projects/default/features/some-toggle|some-toggle>* for the *development* environment in project *<http://some-url.com/projects/default|default>*',
            },
        });
    });
});

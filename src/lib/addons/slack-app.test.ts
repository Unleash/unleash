import { IEvent, FEATURE_ENVIRONMENT_ENABLED } from '../types/events';
import SlackAppAddon from './slack-app';
import { ChatPostMessageArguments, ErrorCode } from '@slack/web-api';

const slackApiCalls: ChatPostMessageArguments[] = [];

let scheduleMessage = jest.fn().mockImplementation((options) => {
    slackApiCalls.push(options);
    return Promise.resolve();
});

jest.mock('@slack/web-api', () => ({
    WebClient: jest.fn().mockImplementation(() => ({
        chat: {
            scheduleMessage,
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

describe('SlackAppAddon', () => {
    let addon;
    const accessToken = 'test-access-token';
    const loggerMock = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        fatal: jest.fn(),
    };
    const getLogger = jest.fn(() => loggerMock);
    const mockError = {
        code: ErrorCode.PlatformError,
        data: 'Platform error message',
    };

    const event: IEvent = {
        id: 1,
        createdAt: new Date(),
        type: FEATURE_ENVIRONMENT_ENABLED,
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
        tags: [{ type: 'slack', value: 'general' }],
    };

    beforeEach(() => {
        jest.useFakeTimers();
        slackApiCalls.length = 0;
        scheduleMessage.mockClear();
        addon = new SlackAppAddon({
            getLogger,
            unleashUrl: 'http://some-url.com',
        });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should post message when feature is toggled', async () => {
        await addon.handleEvent(event, { accessToken });

        expect(slackApiCalls.length).toBe(1);
        expect(slackApiCalls[0].channel).toBe('general');
    });

    it('should post to all channels in tags', async () => {
        const eventWith2Tags: IEvent = {
            ...event,
            tags: [
                { type: 'slack', value: 'general' },
                { type: 'slack', value: 'another-channel-1' },
            ],
        };

        await addon.handleEvent(eventWith2Tags, { accessToken });

        expect(slackApiCalls.length).toBe(2);
        expect(slackApiCalls[0].channel).toBe('general');
        expect(slackApiCalls[1].channel).toBe('another-channel-1');
    });

    it('should not post a message if there are no tagged channels and no defaultChannels', async () => {
        const eventWithoutTags: IEvent = {
            ...event,
            tags: [],
        };

        await addon.handleEvent(eventWithoutTags, {
            accessToken,
        });

        expect(slackApiCalls.length).toBe(0);
    });

    it('should use defaultChannels if no tagged channels are found', async () => {
        const eventWithoutTags: IEvent = {
            ...event,
            tags: [],
        };

        await addon.handleEvent(eventWithoutTags, {
            accessToken,
            defaultChannels: 'general, another-channel-1',
        });

        expect(slackApiCalls.length).toBe(2);
        expect(slackApiCalls[0].channel).toBe('general');
        expect(slackApiCalls[1].channel).toBe('another-channel-1');
    });

    it('should log error when an API call fails', async () => {
        scheduleMessage = jest.fn().mockRejectedValue(mockError);

        await addon.handleEvent(event, { accessToken });

        expect(loggerMock.warn).toHaveBeenCalledWith(
            `Error handling event ${event.type}. A platform error occurred: Platform error message`,
            expect.any(Object),
        );
    });

    it('should handle rejections in chat.scheduleMessage', async () => {
        const eventWith3Tags: IEvent = {
            ...event,
            tags: [
                { type: 'slack', value: 'general' },
                { type: 'slack', value: 'another-channel-1' },
                { type: 'slack', value: 'another-channel-2' },
            ],
        };

        scheduleMessage = jest
            .fn()
            .mockResolvedValueOnce({ ok: true })
            .mockResolvedValueOnce({ ok: true })
            .mockRejectedValueOnce(mockError);

        await addon.handleEvent(eventWith3Tags, { accessToken });

        expect(scheduleMessage).toHaveBeenCalledTimes(3);
        expect(loggerMock.warn).toHaveBeenCalledWith(
            `Error handling event ${FEATURE_ENVIRONMENT_ENABLED}. A platform error occurred: Platform error message`,
            expect.any(Object),
        );
        expect(loggerMock.info).toHaveBeenCalledWith(
            `Handled event ${FEATURE_ENVIRONMENT_ENABLED} dispatching 2 out of 3 messages successfully.`,
        );
    });
});

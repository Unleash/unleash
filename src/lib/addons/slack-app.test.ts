import { IEvent, FEATURE_ENVIRONMENT_ENABLED } from '../types/events';
import SlackAppAddon from './slack-app';
import { ChatPostMessageArguments, ErrorCode } from '@slack/web-api';

const slackApiCalls: ChatPostMessageArguments[] = [];
const conversationsList = jest.fn();
let postMessage = jest.fn().mockImplementation((options) => {
    slackApiCalls.push(options);
    return Promise.resolve();
});

jest.mock('@slack/web-api', () => ({
    WebClient: jest.fn().mockImplementation(() => ({
        conversations: {
            list: conversationsList.mockImplementation(() => ({
                channels: [
                    {
                        id: 1,
                        name: 'general',
                    },
                    {
                        id: 2,
                        name: 'another-channel-1',
                    },
                    {
                        id: 3,
                        name: 'another-channel-2',
                    },
                ],
            })),
        },
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
        conversationsList.mockClear();
        addon = new SlackAppAddon({
            getLogger,
            unleashUrl: 'http://some-url.com',
        });
    });

    afterEach(() => {
        jest.useRealTimers();
        addon.destroy();
    });

    it('should post message when feature is toggled', async () => {
        await addon.handleEvent(event, { accessToken });

        expect(slackApiCalls.length).toBe(1);
        expect(slackApiCalls[0].channel).toBe(1);
        expect(slackApiCalls[0]).toMatchSnapshot();
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
        expect(slackApiCalls[0].channel).toBe(1);
        expect(slackApiCalls[0]).toMatchSnapshot();
        expect(slackApiCalls[1].channel).toBe(2);
        expect(slackApiCalls[1]).toMatchSnapshot();
    });

    it('should not post to unexisting tagged channels', async () => {
        const eventWithUnexistingTaggedChannel: IEvent = {
            ...event,
            tags: [
                { type: 'slack', value: 'random' },
                { type: 'slack', value: 'another-channel-1' },
            ],
        };

        await addon.handleEvent(eventWithUnexistingTaggedChannel, {
            accessToken,
        });

        expect(slackApiCalls.length).toBe(1);
        expect(slackApiCalls[0].channel).toBe(2);
        expect(slackApiCalls[0]).toMatchSnapshot();
    });

    it('should cache Slack channels', async () => {
        await addon.handleEvent(event, { accessToken });
        await addon.handleEvent(event, { accessToken });

        expect(slackApiCalls.length).toBe(2);
        expect(conversationsList).toHaveBeenCalledTimes(1);
    });

    it('should refresh Slack channels cache after 30 seconds', async () => {
        await addon.handleEvent(event, { accessToken });

        jest.advanceTimersByTime(30000);

        await addon.handleEvent(event, { accessToken });

        expect(slackApiCalls.length).toBe(2);
        expect(conversationsList).toHaveBeenCalledTimes(2);
    });

    it('should log error when an API call fails', async () => {
        postMessage = jest.fn().mockRejectedValue(mockError);

        await addon.handleEvent(event, { accessToken });

        expect(loggerMock.warn).toHaveBeenCalledWith(
            `Error handling event ${event.type}. A platform error occurred: Platform error message`,
            expect.any(Object),
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

        await addon.handleEvent(eventWith3Tags, { accessToken });

        expect(postMessage).toHaveBeenCalledTimes(3);
        expect(loggerMock.warn).toHaveBeenCalledWith(
            `Error handling event ${FEATURE_ENVIRONMENT_ENABLED}. A platform error occurred: Platform error message`,
            expect.any(Object),
        );
        expect(loggerMock.info).toHaveBeenCalledWith(
            `Handled event ${FEATURE_ENVIRONMENT_ENABLED} dispatching 2 out of 3 messages successfully.`,
        );
    });
});

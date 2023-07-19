import { IEvent, FEATURE_ENVIRONMENT_ENABLED } from '../types/events';
import SlackAppAddon from './slack-app';
import { ChatPostMessageArguments, ErrorCode } from '@slack/web-api';

let addon;
const accessToken = 'test-access-token';
const slackApiCalls: ChatPostMessageArguments[] = [];
let conversationsList = jest.fn();
const loggerMock = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
};

const getLogger = jest.fn(() => loggerMock);

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
                ],
            })),
        },
        chat: {
            postMessage: jest.fn().mockImplementation((options) => {
                slackApiCalls.push(options);
                return Promise.resolve();
            }),
        },
    })),
    ErrorCode: {
        PlatformError: 'slack_webapi_platform_error',
    },
}));

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

test('Should post message when feature is toggled', async () => {
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

    await addon.handleEvent(event, { accessToken });
    expect(slackApiCalls.length).toBe(1);
    expect(slackApiCalls[0].channel).toBe(1);
    expect(slackApiCalls[0]).toMatchSnapshot();
});

test('Should post to all channels in tags', async () => {
    const event: IEvent = {
        id: 2,
        createdAt: new Date(),
        type: FEATURE_ENVIRONMENT_ENABLED,
        createdBy: 'some@user.com',
        project: 'default',
        featureName: 'some-toggle',
        environment: 'development',
        data: {
            name: 'some-toggle',
        },
        tags: [
            { type: 'slack', value: 'general' },
            { type: 'slack', value: 'another-channel-1' },
        ],
    };

    await addon.handleEvent(event, { accessToken });
    expect(slackApiCalls.length).toBe(2);
    expect(slackApiCalls[0].channel).toBe(1);
    expect(slackApiCalls[0]).toMatchSnapshot();
    expect(slackApiCalls[1].channel).toBe(2);
    expect(slackApiCalls[1]).toMatchSnapshot();
});

test('Should not post to unexisting tagged channels', async () => {
    const event: IEvent = {
        id: 3,
        createdAt: new Date(),
        type: FEATURE_ENVIRONMENT_ENABLED,
        createdBy: 'some@user.com',
        project: 'default',
        featureName: 'some-toggle',
        environment: 'development',
        data: {
            name: 'some-toggle',
        },
        tags: [
            { type: 'slack', value: 'random' },
            { type: 'slack', value: 'another-channel-1' },
        ],
    };

    await addon.handleEvent(event, { accessToken });
    expect(slackApiCalls.length).toBe(1);
    expect(slackApiCalls[0].channel).toBe(2);
    expect(slackApiCalls[0]).toMatchSnapshot();
});

test('Should cache Slack channels', async () => {
    const event: IEvent = {
        id: 4,
        createdAt: new Date(),
        type: FEATURE_ENVIRONMENT_ENABLED,
        createdBy: 'some@user.com',
        project: 'default',
        featureName: 'some-toggle',
        environment: 'development',
        data: {
            name: 'some-toggle',
        },
        tags: [{ type: 'slack', value: 'general' }],
    };

    await addon.handleEvent(event, { accessToken });
    await addon.handleEvent(event, { accessToken });
    expect(slackApiCalls.length).toBe(2);
    expect(conversationsList).toHaveBeenCalledTimes(1);
});

test('Should refresh Slack channels cache after 30 seconds', async () => {
    const event: IEvent = {
        id: 5,
        createdAt: new Date(),
        type: FEATURE_ENVIRONMENT_ENABLED,
        createdBy: 'some@user.com',
        project: 'default',
        featureName: 'some-toggle',
        environment: 'development',
        data: {
            name: 'some-toggle',
        },
        tags: [{ type: 'slack', value: 'general' }],
    };

    await addon.handleEvent(event, { accessToken });
    jest.advanceTimersByTime(30000);
    await addon.handleEvent(event, { accessToken });
    expect(slackApiCalls.length).toBe(2);
    expect(conversationsList).toHaveBeenCalledTimes(2);
});

test('Should log error when an API call fails', async () => {
    const event: IEvent = {
        id: 6,
        createdAt: new Date(),
        type: FEATURE_ENVIRONMENT_ENABLED,
        createdBy: 'some@user.com',
        project: 'default',
        featureName: 'some-toggle',
        environment: 'development',
        data: {
            name: 'some-toggle',
        },
        tags: [{ type: 'slack', value: 'general' }],
    };

    const mockError = {
        code: ErrorCode.PlatformError,
        data: 'Platform error message',
    };

    jest.resetModules();
    jest.doMock('@slack/web-api', () => ({
        WebClient: jest.fn().mockImplementation(() => ({
            conversations: {
                list: jest.fn().mockResolvedValue({
                    channels: [
                        {
                            id: 1,
                            name: 'general',
                        },
                        {
                            id: 2,
                            name: 'another-channel-1',
                        },
                    ],
                }),
            },
            chat: {
                postMessage: jest.fn().mockRejectedValue(mockError),
            },
        })),
        ErrorCode: {
            PlatformError: 'slack_webapi_platform_error',
        },
    }));

    const { default: NewSlackAppAddon } = await import('./slack-app');
    addon = new NewSlackAppAddon({
        getLogger,
        unleashUrl: 'http://some-url.com',
    });

    await addon.handleEvent(event, { accessToken });

    expect(loggerMock.error).toHaveBeenCalledWith(
        `Error handling event ${event.type}. A platform error occurred: Platform error message`,
        expect.any(Object),
    );
});

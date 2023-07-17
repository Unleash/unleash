import { IEvent, FEATURE_ENVIRONMENT_ENABLED } from '../types/events';

import SlackAppAddon from './slack-app';

import noLogger from '../../test/fixtures/no-logger';
import { ChatPostMessageArguments } from '@slack/web-api';

const accessToken = 'test-access-token';
const slackApiCalls: ChatPostMessageArguments[] = [];
jest.mock('@slack/web-api', () => ({
    WebClient: jest.fn().mockImplementation(() => ({
        conversations: {
            list: () => ({
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
            postMessage: jest.fn().mockImplementation((options) => {
                slackApiCalls.push(options);
                return Promise.resolve();
            }),
        },
    })),
}));

beforeEach(() => {
    slackApiCalls.length = 0;
});

test('Should post message when feature is toggled', async () => {
    const addon = new SlackAppAddon({
        getLogger: noLogger,
        unleashUrl: 'http://some-url.com',
    });
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
    const addon = new SlackAppAddon({
        getLogger: noLogger,
        unleashUrl: 'http://some-url.com',
    });
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
    const addon = new SlackAppAddon({
        getLogger: noLogger,
        unleashUrl: 'http://some-url.com',
    });
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

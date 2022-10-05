import {
    FEATURE_CREATED,
    FEATURE_ARCHIVED,
    FEATURE_ENVIRONMENT_DISABLED,
    IEvent,
} from '../types/events';
import { Logger } from '../logger';

import SlackAddon from './slack';

import noLogger from '../../test/fixtures/no-logger';

let fetchRetryCalls: any[] = [];

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
                return Promise.resolve({ status: 200 });
            }
        },
);

test('Should call slack webhook', async () => {
    const addon = new SlackAddon({
        getLogger: noLogger,
        unleashUrl: 'http://some-url.com',
    });
    const event: IEvent = {
        id: 1,
        createdAt: new Date(),
        type: FEATURE_CREATED,
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
    };

    await addon.handleEvent(event, parameters);
    expect(fetchRetryCalls.length).toBe(1);
    expect(fetchRetryCalls[0].url).toBe(parameters.url);
    expect(fetchRetryCalls[0].options.body).toMatchSnapshot();
});

test('Should call slack webhook for archived toggle', async () => {
    const addon = new SlackAddon({
        getLogger: noLogger,
        unleashUrl: 'http://some-url.com',
    });
    const event: IEvent = {
        id: 2,
        createdAt: new Date(),
        type: FEATURE_ARCHIVED,
        featureName: 'some-toggle',
        createdBy: 'some@user.com',
        data: {
            name: 'some-toggle',
        },
    };

    const parameters = {
        url: 'http://hooks.slack.com',
    };

    await addon.handleEvent(event, parameters);
    expect(fetchRetryCalls.length).toBe(1);
    expect(fetchRetryCalls[0].url).toBe(parameters.url);
    expect(fetchRetryCalls[0].options.body).toMatchSnapshot();
});

test('Should call slack webhook for archived toggle with project info', async () => {
    const addon = new SlackAddon({
        getLogger: noLogger,
        unleashUrl: 'http://some-url.com',
    });
    const event: IEvent = {
        id: 2,
        createdAt: new Date(),
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
    };

    await addon.handleEvent(event, parameters);
    expect(fetchRetryCalls.length).toBe(1);
    expect(fetchRetryCalls[0].url).toBe(parameters.url);
    expect(fetchRetryCalls[0].options.body).toMatchSnapshot();
});

test(`Should call webhook for toggled environment`, async () => {
    const addon = new SlackAddon({
        getLogger: noLogger,
        unleashUrl: 'http://some-url.com',
    });
    const event: IEvent = {
        id: 2,
        createdAt: new Date(),
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

    await addon.handleEvent(event, parameters);
    expect(fetchRetryCalls).toHaveLength(1);
    expect(fetchRetryCalls[0].url).toBe(parameters.url);
    expect(fetchRetryCalls[0].options.body).toMatch(/disabled/);
    expect(fetchRetryCalls[0].options.body).toMatchSnapshot();
});

test('Should use default channel', async () => {
    const addon = new SlackAddon({
        getLogger: noLogger,
        unleashUrl: 'http://some-url.com',
    });
    const event: IEvent = {
        id: 3,
        createdAt: new Date(),
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

    await addon.handleEvent(event, parameters);

    const req = JSON.parse(fetchRetryCalls[0].options.body);

    expect(req.channel).toBe('#some-channel');
});

test('Should override default channel with data from tag', async () => {
    const addon = new SlackAddon({
        getLogger: noLogger,
        unleashUrl: 'http://some-url.com',
    });
    const event: IEvent = {
        id: 4,
        createdAt: new Date(),
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

    await addon.handleEvent(event, parameters);

    const req = JSON.parse(fetchRetryCalls[0].options.body);

    expect(req.channel).toBe('#another-channel');
});

test('Should post to all channels in tags', async () => {
    const addon = new SlackAddon({
        getLogger: noLogger,
        unleashUrl: 'http://some-url.com',
    });
    const event: IEvent = {
        id: 5,
        createdAt: new Date(),
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

    await addon.handleEvent(event, parameters);

    const req1 = JSON.parse(fetchRetryCalls[0].options.body);
    const req2 = JSON.parse(fetchRetryCalls[1].options.body);

    expect(fetchRetryCalls).toHaveLength(2);
    expect(req1.channel).toBe('#another-channel-1');
    expect(req2.channel).toBe('#another-channel-2');
});

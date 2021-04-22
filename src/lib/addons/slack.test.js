const { FEATURE_CREATED, FEATURE_ARCHIVED } = require('../event-type');

jest.mock(
    './addon',
    () =>
        class Addon {
            constructor(definition, { getLogger }) {
                this.logger = getLogger('addon/test');
                this.fetchRetryCalls = [];
            }

            async fetchRetry(url, options, retries, backoff) {
                this.fetchRetryCalls.push({ url, options, retries, backoff });
                return Promise.resolve({ status: 200 });
            }
        },
);

const SlackAddon = require('./slack');

const noLogger = require('../../test/fixtures/no-logger');

test('Should call slack webhook', async () => {
    const addon = new SlackAddon({
        getLogger: noLogger,
        unleashUrl: 'http://some-url.com',
    });
    const event = {
        type: FEATURE_CREATED,
        createdBy: 'some@user.com',
        data: {
            name: 'some-toggle',
            enabled: false,
            strategies: [{ name: 'default' }],
        },
    };

    const parameters = {
        url: 'http://hooks.slack.com',
    };

    await addon.handleEvent(event, parameters);
    expect(addon.fetchRetryCalls.length).toBe(1);
    expect(addon.fetchRetryCalls[0].url).toBe(parameters.url);
    expect(addon.fetchRetryCalls[0].options.body).toMatchSnapshot();
});

test('Should call slack webhook for archived toggle', async () => {
    const addon = new SlackAddon({
        getLogger: noLogger,
        unleashUrl: 'http://some-url.com',
    });
    const event = {
        type: FEATURE_ARCHIVED,
        createdBy: 'some@user.com',
        data: {
            name: 'some-toggle',
        },
    };

    const parameters = {
        url: 'http://hooks.slack.com',
    };

    await addon.handleEvent(event, parameters);
    expect(addon.fetchRetryCalls.length).toBe(1);
    expect(addon.fetchRetryCalls[0].url).toBe(parameters.url);
    expect(addon.fetchRetryCalls[0].options.body).toMatchSnapshot();
});

test('Should use default channel', async () => {
    const addon = new SlackAddon({
        getLogger: noLogger,
        unleashUrl: 'http://some-url.com',
    });
    const event = {
        type: FEATURE_CREATED,
        createdBy: 'some@user.com',
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

    const req = JSON.parse(addon.fetchRetryCalls[0].options.body);

    expect(req.channel).toBe('#some-channel');
});

test('Should override default channel with data from tag', async () => {
    const addon = new SlackAddon({
        getLogger: noLogger,
        unleashUrl: 'http://some-url.com',
    });
    const event = {
        type: FEATURE_CREATED,
        createdBy: 'some@user.com',
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

    const req = JSON.parse(addon.fetchRetryCalls[0].options.body);

    expect(req.channel).toBe('#another-channel');
});

test('Should post to all channels in tags', async () => {
    const addon = new SlackAddon({
        getLogger: noLogger,
        unleashUrl: 'http://some-url.com',
    });
    const event = {
        type: FEATURE_CREATED,
        createdBy: 'some@user.com',
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

    const req1 = JSON.parse(addon.fetchRetryCalls[0].options.body);
    const req2 = JSON.parse(addon.fetchRetryCalls[1].options.body);

    expect(addon.fetchRetryCalls.length).toBe(2);
    expect(req1.channel).toBe('#another-channel-1');
    expect(req2.channel).toBe('#another-channel-2');
});

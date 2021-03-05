const test = require('ava');
const proxyquire = require('proxyquire').noCallThru();
const { FEATURE_CREATED, FEATURE_ARCHIVED } = require('../event-type');

const SlackAddon = proxyquire.load('./slack', {
    './addon': class Addon {
        constructor(definition, { getLogger }) {
            this.logger = getLogger('addon/test');
            this.fetchRetryCalls = [];
        }

        async fetchRetry(url, options, retries, backoff) {
            this.fetchRetryCalls.push({ url, options, retries, backoff });
            return Promise.resolve({ status: 200 });
        }
    },
});

const noLogger = require('../../test/fixtures/no-logger');

test('Should call slack webhook', async t => {
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
    t.is(addon.fetchRetryCalls.length, 1);
    t.is(addon.fetchRetryCalls[0].url, parameters.url);
    t.snapshot(addon.fetchRetryCalls[0].options.body);
});

test('Should call slack webhook for archived toggle', async t => {
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
    t.is(addon.fetchRetryCalls.length, 1);
    t.is(addon.fetchRetryCalls[0].url, parameters.url);
    t.snapshot(addon.fetchRetryCalls[0].options.body);
});

test('Should use default channel', async t => {
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

    t.is(req.channel, '#some-channel');
});

test('Should override default channel with data from tag', async t => {
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

    t.is(req.channel, '#another-channel');
});

test('Should post to all channels in tags', async t => {
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

    t.is(addon.fetchRetryCalls.length, 2);
    t.is(req1.channel, '#another-channel-1');
    t.is(req2.channel, '#another-channel-2');
});

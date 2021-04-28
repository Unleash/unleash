const test = require('ava');
const proxyquire = require('proxyquire').noCallThru();
const { FEATURE_CREATED, FEATURE_ARCHIVED } = require('../event-type');

const TeamsAddon = proxyquire.load('./teams', {
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

test('Should call teams webhook', async t => {
    const addon = new TeamsAddon({
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
        url: 'http://hooks.office.com',
    };

    await addon.handleEvent(event, parameters);
    t.is(addon.fetchRetryCalls.length, 1);
    t.is(addon.fetchRetryCalls[0].url, parameters.url);
    t.snapshot(addon.fetchRetryCalls[0].options.body);
});

test('Should call slack webhook for archived toggle', async t => {
    const addon = new TeamsAddon({
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
        url: 'http://hooks.office.com',
    };

    await addon.handleEvent(event, parameters);
    t.is(addon.fetchRetryCalls.length, 1);
    t.is(addon.fetchRetryCalls[0].url, parameters.url);
    t.snapshot(addon.fetchRetryCalls[0].options.body);
});

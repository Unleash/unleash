const test = require('ava');
const proxyquire = require('proxyquire').noCallThru();
const { FEATURE_CREATED } = require('../event-type');

const WebhookAddon = proxyquire.load('./webhook', {
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

test('Should handle event without "bodyTemplate"', t => {
    const addon = new WebhookAddon({ getLogger: noLogger });
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
        url: 'http://test.webhook.com',
    };

    addon.handleEvent(event, parameters);
    t.is(addon.fetchRetryCalls.length, 1);
    t.is(addon.fetchRetryCalls[0].url, parameters.url);
    t.is(addon.fetchRetryCalls[0].options.body, JSON.stringify(event));
});

test('Should format event with "bodyTemplate"', t => {
    const addon = new WebhookAddon({ getLogger: noLogger });
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
        url: 'http://test.webhook.com/plain',
        bodyTemplate: '{{event.type}} on toggle {{event.data.name}}',
        contentType: 'text/plain',
    };

    addon.handleEvent(event, parameters);
    const call = addon.fetchRetryCalls[0];
    t.is(addon.fetchRetryCalls.length, 1);
    t.is(call.url, parameters.url);
    t.is(call.options.headers['Content-Type'], 'text/plain');
    t.is(call.options.body, 'feature-created on toggle some-toggle');
});

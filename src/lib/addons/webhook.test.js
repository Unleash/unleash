const { FEATURE_CREATED } = require('../event-type');

jest.mock('./addon', () => (class Addon {
    constructor(definition, { getLogger }) {
        this.logger = getLogger('addon/test');
        this.fetchRetryCalls = [];
    }

    async fetchRetry(url, options, retries, backoff) {
        this.fetchRetryCalls.push({ url, options, retries, backoff });
        return Promise.resolve({ status: 200 });
    }
}));

const WebhookAddon = require('./webhook');

const noLogger = require('../../test/fixtures/no-logger');

test('Should handle event without "bodyTemplate"', () => {
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
    expect(addon.fetchRetryCalls.length).toBe(1);
    expect(addon.fetchRetryCalls[0].url).toBe(parameters.url);
    expect(addon.fetchRetryCalls[0].options.body).toBe(JSON.stringify(event));
});

test('Should format event with "bodyTemplate"', () => {
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
    expect(addon.fetchRetryCalls.length).toBe(1);
    expect(call.url).toBe(parameters.url);
    expect(call.options.headers['Content-Type']).toBe('text/plain');
    expect(call.options.body).toBe('feature-created on toggle some-toggle');
});

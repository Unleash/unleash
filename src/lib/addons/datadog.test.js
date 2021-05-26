const { FEATURE_CREATED, FEATURE_ARCHIVED } = require('../types/events');

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

const DatadogAddon = require('./datadog');

const noLogger = require('../../test/fixtures/no-logger');

test('Should call datadog webhook', async () => {
    const addon = new DatadogAddon({
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
        url: 'http://api.datadoghq.com/api/v1/events',
    };

    await addon.handleEvent(event, parameters);
    expect(addon.fetchRetryCalls.length).toBe(1);
    expect(addon.fetchRetryCalls[0].url).toBe(parameters.url);
    expect(addon.fetchRetryCalls[0].options.body).toMatchSnapshot();
});

test('Should call datadog webhook for archived toggle', async () => {
    const addon = new DatadogAddon({
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
        url: 'http://api.datadoghq.com/api/v1/events',
    };

    await addon.handleEvent(event, parameters);
    expect(addon.fetchRetryCalls.length).toBe(1);
    expect(addon.fetchRetryCalls[0].url).toBe(parameters.url);
    expect(addon.fetchRetryCalls[0].options.body).toMatchSnapshot();
});

import { Logger } from '../logger';

import { FEATURE_CREATED, IEvent } from '../types/events';

import WebhookAddon from './webhook';

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

test('Should handle event without "bodyTemplate"', () => {
    const addon = new WebhookAddon({ getLogger: noLogger });
    const event: IEvent = {
        id: 1,
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
        url: 'http://test.webhook.com',
    };

    addon.handleEvent(event, parameters);
    expect(fetchRetryCalls.length).toBe(1);
    expect(fetchRetryCalls[0].url).toBe(parameters.url);
    expect(fetchRetryCalls[0].options.body).toBe(JSON.stringify(event));
});

test('Should format event with "bodyTemplate"', () => {
    const addon = new WebhookAddon({ getLogger: noLogger });
    const event: IEvent = {
        id: 1,
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
        url: 'http://test.webhook.com/plain',
        bodyTemplate: '{{event.type}} on toggle {{event.data.name}}',
        contentType: 'text/plain',
    };

    addon.handleEvent(event, parameters);
    const call = fetchRetryCalls[0];
    expect(fetchRetryCalls.length).toBe(1);
    expect(call.url).toBe(parameters.url);
    expect(call.options.headers['Content-Type']).toBe('text/plain');
    expect(call.options.body).toBe('feature-created on toggle some-toggle');
});

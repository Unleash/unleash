import {
    FEATURE_ARCHIVED,
    FEATURE_CREATED,
    FEATURE_ENVIRONMENT_DISABLED,
    IEvent,
} from '../types/events';
import { Logger } from '../logger';

import DatadogAddon from './datadog';

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

test('Should call datadog webhook', async () => {
    const addon = new DatadogAddon({
        getLogger: noLogger,
        unleashUrl: 'http://some-url.com',
    });
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
        url: 'http://api.datadoghq.com/api/v1/events',
    };

    await addon.handleEvent(event, parameters);
    expect(fetchRetryCalls.length).toBe(1);
    expect(fetchRetryCalls[0].url).toBe(parameters.url);
    expect(fetchRetryCalls[0].options.body).toMatchSnapshot();
});

test('Should call datadog webhook  for archived toggle', async () => {
    const addon = new DatadogAddon({
        getLogger: noLogger,
        unleashUrl: 'http://some-url.com',
    });
    const event: IEvent = {
        id: 2,
        createdAt: new Date(),
        type: FEATURE_ARCHIVED,
        createdBy: 'some@user.com',
        featureName: 'some-toggle',
        data: {
            name: 'some-toggle',
        },
    };

    const parameters = {
        url: 'http://api.datadoghq.com/api/v1/events',
    };

    await addon.handleEvent(event, parameters);
    expect(fetchRetryCalls.length).toBe(1);
    expect(fetchRetryCalls[0].url).toBe(parameters.url);
    expect(fetchRetryCalls[0].options.body).toMatchSnapshot();
});

test('Should call datadog webhook  for archived toggle with project info', async () => {
    const addon = new DatadogAddon({
        getLogger: noLogger,
        unleashUrl: 'http://some-url.com',
    });
    const event: IEvent = {
        id: 2,
        createdAt: new Date(),
        type: FEATURE_ARCHIVED,
        createdBy: 'some@user.com',
        featureName: 'some-toggle',
        project: 'some-project',
        data: {
            name: 'some-toggle',
        },
    };

    const parameters = {
        url: 'http://api.datadoghq.com/api/v1/events',
    };

    await addon.handleEvent(event, parameters);
    expect(fetchRetryCalls.length).toBe(1);
    expect(fetchRetryCalls[0].url).toBe(parameters.url);
    expect(fetchRetryCalls[0].options.body).toMatchSnapshot();
});

test(`Should call datadog webhook for toggled environment`, async () => {
    const addon = new DatadogAddon({
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

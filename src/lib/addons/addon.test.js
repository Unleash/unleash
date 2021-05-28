const fetchMock = require('fetch-mock').sandbox();
const noLogger = require('../../test/fixtures/no-logger');

jest.mock('node-fetch', () => fetchMock);

const Addon = require('./addon');

beforeEach(() => {
    fetchMock.restore();
    fetchMock.reset();
});

const definition = {
    name: 'test',
    displayName: 'test',
    description: 'hello',
};

test('Retries if fetch throws', async () => {
    const url = 'https://test.some.com';
    jest.useFakeTimers('modern');
    const addon = new Addon(definition, {
        getLogger: noLogger,
    });
    fetchMock
        .once(
            {
                name: 'rejection',
                type: 'POST',
                url: `begin:${url}`,
            },
            () => {
                throw new Error('Network error');
            },
        )
        .mock(
            {
                name: 'acceptance',
                type: 'POST',
                url: `begin:${url}`,
            },
            201,
        );
    await addon.fetchRetry(url);
    jest.advanceTimersByTime(1000);
    expect(fetchMock.done()).toBe(true);
    jest.useRealTimers();
});

test('does not crash even if fetch throws', async () => {
    const url = 'https://test.some.com';
    jest.useFakeTimers('modern');
    const addon = new Addon(definition, {
        getLogger: noLogger,
    });
    fetchMock.mock(
        {
            name: 'rejection',
            type: 'POST',
            url: `begin:${url}`,
        },
        () => {
            throw new Error('Network error');
        },
    );
    await addon.fetchRetry(url);
    jest.advanceTimersByTime(1000);
    expect(fetchMock.done()).toBe(true);
    expect(fetchMock.calls()).toHaveLength(2);
    jest.useRealTimers();
});

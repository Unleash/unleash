const lolex = require('lolex');
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
    const clock = lolex.install();
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
    clock.tick(1000);
    expect(fetchMock.done()).toBe(true);
});

test('does not crash even if fetch throws', async () => {
    const url = 'https://test.some.com';
    const clock = lolex.install();
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
    clock.tick(1000);
    expect(fetchMock.done()).toBe(true);
    expect(fetchMock.calls().length).toBe(2);
});

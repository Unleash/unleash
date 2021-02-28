const test = require('ava');
const proxyquire = require('proxyquire');
const lolex = require('lolex');
const fetchMock = require('fetch-mock').sandbox();
const noLogger = require('../../test/fixtures/no-logger');

const Addon = proxyquire('./addon', { 'node-fetch': fetchMock });

test.beforeEach(() => {
    fetchMock.restore();
    fetchMock.reset();
});

const definition = {
    name: 'test',
    displayName: 'test',
    description: 'hello',
};

test.serial('Retries if fetch throws', async t => {
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
    t.true(fetchMock.done());
});

test.serial('does not crash even if fetch throws', async t => {
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
    t.true(fetchMock.done());
    t.is(fetchMock.calls().length, 2);
});

import nock from 'nock';
import noLogger from '../../test/fixtures/no-logger';

import SlackAddon from './slack';

beforeEach(() => {
    nock.disableNetConnect();
});

test('Does not retry if request succeeds', async () => {
    const url = 'https://test.some.com';
    const addon = new SlackAddon({
        getLogger: noLogger,
        unleashUrl: url,
    });
    nock(url).get('/').reply(201);
    const res = await addon.fetchRetry(url);
    expect(res.ok).toBe(true);
});

test('Retries once, and succeeds', async () => {
    const url = 'https://test.some.com';
    const addon = new SlackAddon({
        getLogger: noLogger,
        unleashUrl: url,
    });
    nock(url).get('/').replyWithError('testing retry');
    nock(url).get('/').reply(200);
    const res = await addon.fetchRetry(url);
    expect(res.ok).toBe(true);
    expect(nock.isDone()).toBe(true);
});

test('Does not throw if response is error', async () => {
    const url = 'https://test.some.com';
    const addon = new SlackAddon({
        getLogger: noLogger,
        unleashUrl: url,
    });
    nock(url).get('/').twice().replyWithError('testing retry');
    const res = await addon.fetchRetry(url);
    expect(res.ok).toBe(false);
});

test('Supports custom number of retries', async () => {
    const url = 'https://test.some.com';
    const addon = new SlackAddon({
        getLogger: noLogger,
        unleashUrl: url,
    });
    let retries = 0;
    nock(url).get('/').twice().replyWithError('testing retry');
    nock(url).get('/').reply(201);
    const res = await addon.fetchRetry(
        url,
        {
            onRetry: () => {
                retries = retries + 1;
            },
        },
        2,
    );

    expect(retries).toBe(2);
    expect(res.ok).toBe(true);
    expect(nock.isDone()).toBe(true);
});

afterEach(() => {
    nock.enableNetConnect();
});

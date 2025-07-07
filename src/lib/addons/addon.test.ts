import nock from 'nock';
import noLogger from '../../test/fixtures/no-logger.js';

import SlackAddon from './slack.js';
import type { IAddonConfig, IFlagResolver } from '../types/index.js';
import type { IntegrationEventsService } from '../services/index.js';
import type EventEmitter from 'events';

beforeEach(() => {
    nock.disableNetConnect();
});

afterAll(() => {
    nock.enableNetConnect();
});
const url = 'https://test.some.com';

const ARGS: IAddonConfig = {
    getLogger: noLogger,
    unleashUrl: url,
    integrationEventsService: {} as IntegrationEventsService,
    flagResolver: {} as IFlagResolver,
    eventBus: {} as EventEmitter,
};

test('Does not retry if request succeeds', async () => {
    const url = 'https://test.some.com';
    const addon = new SlackAddon(ARGS);
    nock(url).get('/').reply(201);
    const res = await addon.fetchRetry(url);
    expect(res.ok).toBe(true);
});

test('Retries once, and succeeds', async () => {
    const addon = new SlackAddon(ARGS);
    nock(url).get('/').replyWithError('testing retry');
    nock(url).get('/').reply(200);
    const res = await addon.fetchRetry(url);
    expect(res.ok).toBe(true);
    expect(nock.isDone()).toBe(true);
});

test('Does not throw if response is error', async () => {
    const addon = new SlackAddon(ARGS);
    nock(url).get('/').twice().replyWithError('testing retry');
    const res = await addon.fetchRetry(url);
    expect(res.ok).toBe(false);
});

test('Supports custom number of retries', async () => {
    const addon = new SlackAddon(ARGS);
    let retries = 0;
    nock(url).get('/').twice().replyWithError('testing retry');
    nock(url).get('/').reply(201);
    const res = await addon.fetchRetry(
        url,
        {
            hooks: {
                beforeRetry: [
                    () => {
                        retries = retries + 1;
                    },
                ],
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

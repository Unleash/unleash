import fetchMock from 'jest-fetch-mock';
import noLogger from '../../test/fixtures/no-logger';

import SlackAddon from './slack';

beforeEach(() => {
    fetchMock.resetMocks();
});

test('Retries if fetch throws', async () => {
    const url = 'https://test.some.com';
    jest.useFakeTimers('modern');
    const addon = new SlackAddon({
        getLogger: noLogger,
        unleashUrl: url,
    });
    fetchMock.mockIf('https://test.some.com', 'OK', {
        status: 201,
        statusText: 'ACCEPTED',
    });
    await addon.fetchRetry(url);
    jest.advanceTimersByTime(1000);
    jest.useRealTimers();
});

test('does not crash even if fetch throws', async () => {
    const url = 'https://test.some.com';
    jest.useFakeTimers('modern');
    const addon = new SlackAddon({
        getLogger: noLogger,
        unleashUrl: url,
    });
    fetchMock.mockResponse(() => {
        throw new Error('Network error');
    });
    await addon.fetchRetry(url);
    jest.advanceTimersByTime(1000);
    expect(fetchMock.mock.calls).toHaveLength(2);
    jest.useRealTimers();
});

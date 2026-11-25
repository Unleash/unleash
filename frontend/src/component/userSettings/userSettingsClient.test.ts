import { delay, HttpResponse, http } from 'msw';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import {
    LOAD_TIMEOUT_MS,
    loadSettings,
    RETRY_DELAY_MS,
    saveSettings,
    type UserSettings,
} from './userSettingsClient.ts';

const server = testServerSetup();

const SETTINGS_PATH = '/api/admin/user/settings';

const settings: UserSettings = {
    'unleash-theme': { value: 'dark' },
    'feedback-module-survey-grace:v1': {
        value: true,
        expiresAt: '2026-12-01T12:00:00.000Z',
    },
};

const answerInTurn = (...answers: Array<() => Promise<Response>>) => {
    let calls = 0;
    server.use(
        http.get(SETTINGS_PATH, () => {
            const answer = answers[Math.min(calls, answers.length - 1)];
            calls++;
            return answer();
        }),
    );
    return { calls: () => calls };
};

const ok = async () => HttpResponse.json({ settings });
const serverError = async () =>
    HttpResponse.json(
        { name: 'InternalError', message: 'Unexpected error' },
        { status: 500 },
    );
const networkError = async () => HttpResponse.error();
const notFound = async () => new HttpResponse(null, { status: 404 });
const forbidden = async () => new HttpResponse(null, { status: 403 });
const never = async () => {
    await delay('infinite');
    return HttpResponse.json({ settings });
};
const stalledBody = async () =>
    new HttpResponse(new ReadableStream({ start() {} }), {
        headers: { 'Content-Type': 'application/json' },
    });

const fakeTimers = () =>
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

const settle = async (load: Promise<unknown>, ms: number) => {
    await vi.advanceTimersByTimeAsync(ms);
    return load;
};

describe('loadSettings', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    test('loads the settings', async () => {
        const route = answerInTurn(ok);

        expect(await loadSettings()).toEqual({ status: 'loaded', settings });
        expect(route.calls()).toBe(1);
    });

    test('loads the settings when an error is followed by a success', async () => {
        fakeTimers();
        const route = answerInTurn(serverError, ok);

        const result = loadSettings();
        await vi.advanceTimersByTimeAsync(RETRY_DELAY_MS - 1);
        expect(route.calls()).toBe(1);
        await vi.advanceTimersByTimeAsync(1);

        expect(await result).toEqual({ status: 'loaded', settings });
        expect(route.calls()).toBe(2);
    });

    test('loads the settings when a network error is followed by a success', async () => {
        fakeTimers();
        const route = answerInTurn(networkError, ok);

        expect(await settle(loadSettings(), RETRY_DELAY_MS)).toEqual({
            status: 'loaded',
            settings,
        });
        expect(route.calls()).toBe(2);
    });

    test('fails after two errors without trying a third time', async () => {
        fakeTimers();
        const route = answerInTurn(serverError, serverError, ok);

        expect(await settle(loadSettings(), RETRY_DELAY_MS)).toEqual({
            status: 'failed',
        });
        expect(route.calls()).toBe(2);
    });

    test('fails when both attempts time out', async () => {
        fakeTimers();
        const route = answerInTurn(never);

        const result = loadSettings();
        await vi.advanceTimersByTimeAsync(LOAD_TIMEOUT_MS);
        await vi.advanceTimersByTimeAsync(RETRY_DELAY_MS);
        await vi.advanceTimersByTimeAsync(LOAD_TIMEOUT_MS);

        expect(await result).toEqual({ status: 'failed' });
        expect(route.calls()).toBe(2);
    });

    test('loads the settings when a timeout is followed by a success', async () => {
        fakeTimers();
        const route = answerInTurn(never, ok);

        const result = loadSettings();
        await vi.advanceTimersByTimeAsync(LOAD_TIMEOUT_MS + RETRY_DELAY_MS);

        expect(await result).toEqual({ status: 'loaded', settings });
        expect(route.calls()).toBe(2);
    });

    test('loads the settings when a stalled body is followed by a success', async () => {
        fakeTimers();
        const route = answerInTurn(stalledBody, ok);

        const result = loadSettings();
        await vi.advanceTimersByTimeAsync(LOAD_TIMEOUT_MS + RETRY_DELAY_MS);

        expect(await result).toEqual({ status: 'loaded', settings });
        expect(route.calls()).toBe(2);
    });

    test('fails without retrying when the server rejects the request', async () => {
        const route = answerInTurn(forbidden, ok);

        expect(await loadSettings()).toEqual({ status: 'failed' });
        expect(route.calls()).toBe(1);
    });

    test('is off when the server does not have the endpoint', async () => {
        const route = answerInTurn(notFound);

        expect(await loadSettings()).toEqual({ status: 'off' });
        expect(route.calls()).toBe(1);
    });
});

describe('saveSettings', () => {
    test('sends only the changes', async () => {
        const changes: UserSettings = { 'unleash-theme': { value: null } };
        const { requests } = testServerRoute(
            server,
            SETTINGS_PATH,
            null,
            'put',
            204,
        );

        expect(await saveSettings(changes)).toBe('saved');
        expect(requests).toEqual([{ settings: changes }]);
    });

    test('sends the save with keepalive', async () => {
        const keepaliveFlags: boolean[] = [];
        server.use(
            http.put(SETTINGS_PATH, ({ request }) => {
                keepaliveFlags.push(request.keepalive);
                return new HttpResponse(null, { status: 204 });
            }),
        );

        await saveSettings(settings);

        expect(keepaliveFlags).toEqual([true]);
    });

    test('fails when the server refuses the save', async () => {
        testServerRoute(server, SETTINGS_PATH, null, 'put', 500);

        expect(await saveSettings(settings)).toBe('failed');
    });

    test('fails when the save does not reach the server', async () => {
        server.use(http.put(SETTINGS_PATH, () => HttpResponse.error()));

        expect(await saveSettings(settings)).toBe('failed');
    });
});

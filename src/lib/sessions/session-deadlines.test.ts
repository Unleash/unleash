import { minutesToMilliseconds, hoursToMilliseconds } from 'date-fns';
import { evaluateSession } from './session-deadlines.js';

const IDLE = minutesToMilliseconds(15);
const MAX_AGE = hoursToMilliseconds(48);
const NOW = Date.parse('2026-10-01T12:00:00.000Z');

const limits = (overrides = {}) => ({
    hardMaxAgeMs: MAX_AGE,
    idleTimeoutMs: IDLE,
    ...overrides,
});

const ago = (ms: number) => new Date(NOW - ms).toISOString();

const session = (loginMsAgo: number, lastInteractionMsAgo = loginMsAgo) => ({
    authenticatedAt: ago(loginMsAgo),
    lastInteractionAt: ago(lastInteractionMsAgo),
});

describe('session deadlines', () => {
    test('an active session continues', () => {
        expect(
            evaluateSession(
                session(minutesToMilliseconds(5)),
                limits(),
                false,
                NOW,
            ),
        ).toEqual({
            action: 'continue',
            shouldRenew: false,
        });
    });

    test('a session reaching its idle window ends', () => {
        // idle for exactly IDLE, for the same reason as the max age below
        expect(
            evaluateSession(
                session(minutesToMilliseconds(30), IDLE),
                limits(),
                false,
                NOW,
            ),
        ).toEqual({ action: 'end', reason: 'idled' });
    });

    test('user activity renews the idle window', () => {
        expect(
            evaluateSession(
                session(minutesToMilliseconds(30), minutesToMilliseconds(14)),
                limits(),
                true,
                NOW,
            ),
        ).toEqual({ action: 'continue', shouldRenew: true });
    });

    test('a session reaching its max age ends, however active the user is', () => {
        // exactly MAX_AGE old, not a round number past it: the deadline is
        // inclusive, and nothing else would notice if it stopped being.
        expect(
            evaluateSession(session(MAX_AGE, 0), limits(), true, NOW),
        ).toEqual({ action: 'end', reason: 'max-aged' });
    });

    test('with the idle timeout off, only the max age applies', () => {
        expect(
            evaluateSession(
                session(hoursToMilliseconds(20)),
                limits({ idleTimeoutMs: 0 }),
                false,
                NOW,
            ),
        ).toEqual({
            action: 'continue',
            shouldRenew: false,
        });
    });

    test.each([
        ['a session that was already open before this shipped', {}],
        ['a login time we cannot read', { authenticatedAt: 'not-a-date' }],
    ])('%s ends rather than being trusted', (_name, unmeasurable) => {
        // reported apart from `max-aged`: nothing was measured, so claiming a
        // deadline was reached would make the reason useless.
        expect(evaluateSession(unmeasurable, limits(), false, NOW)).toEqual({
            action: 'end',
            reason: 'unknown-start',
        });
    });

    test('a session with no recorded activity idles from the login time', () => {
        // the `?? authenticatedAt` fallback. Without it, a session that has
        // never posted a keep-alive either never idles or ends immediately.
        expect(
            evaluateSession(
                { authenticatedAt: ago(minutesToMilliseconds(16)) },
                limits(),
                false,
                NOW,
            ),
        ).toEqual({ action: 'end', reason: 'idled' });

        expect(
            evaluateSession(
                { authenticatedAt: ago(minutesToMilliseconds(14)) },
                limits(),
                false,
                NOW,
            ),
        ).toEqual({
            action: 'continue',
            shouldRenew: false,
        });
    });

    test('a last-interaction stamp in the future does not end the session', () => {
        // clock skew between instances writing to the same session row
        expect(
            evaluateSession(
                session(minutesToMilliseconds(30), -minutesToMilliseconds(5)),
                limits(),
                false,
                NOW,
            ).action,
        ).toBe('continue');
    });

    test('no request can renew a session already past its idle window', () => {
        expect(
            evaluateSession(
                session(hoursToMilliseconds(1), minutesToMilliseconds(59)),
                limits(),
                true,
                NOW,
            ),
        ).toEqual({ action: 'end', reason: 'idled' });
    });
});

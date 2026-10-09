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
            expiresInMs: minutesToMilliseconds(10),
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
        ).toEqual({ action: 'end', reason: 'idle' });
    });

    test('user activity renews the idle window', () => {
        expect(
            evaluateSession(
                session(minutesToMilliseconds(30), minutesToMilliseconds(14)),
                limits(),
                true,
                NOW,
            ),
        ).toEqual({
            action: 'continue',
            shouldRenew: true,
            expiresInMs: IDLE,
        });
    });

    test('a session reaching its max age ends, however active the user is', () => {
        // exactly MAX_AGE old, not a round number past it: the deadline is
        // inclusive, and nothing else would notice if it stopped being.
        expect(
            evaluateSession(session(MAX_AGE, 0), limits(), true, NOW),
        ).toEqual({ action: 'end', reason: 'max_age' });
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
            expiresInMs: hoursToMilliseconds(28),
        });
    });

    test.each([
        ['a start we were never given', {}],
        ['a start we cannot read', { authenticatedAt: 'not-a-date' }],
        ['a start left empty', { authenticatedAt: '' }],
    ])('%s ends rather than being trusted', (_name, unmeasurable) => {
        // reported apart from `max_age`: nothing was measured, so claiming a
        // deadline was reached would make the reason useless.
        expect(evaluateSession(unmeasurable, limits(), false, NOW)).toEqual({
            action: 'end',
            reason: 'unknown_start',
        });
    });

    test('a session with no recorded activity idles from the login time', () => {
        // a session that has never reported activity has no stamp to measure
        // from, so login stands in for it
        expect(
            evaluateSession(
                { authenticatedAt: ago(minutesToMilliseconds(16)) },
                limits(),
                false,
                NOW,
            ),
        ).toEqual({ action: 'end', reason: 'idle' });

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
            expiresInMs: minutesToMilliseconds(1),
        });
    });

    test('the deadline it reports is whichever window ends first', () => {
        // activity would restart the idle window, but it cannot outlast the
        // max age, and this is the deadline the keep-alive reports.
        const almostMaxAged = MAX_AGE - minutesToMilliseconds(5);
        expect(
            evaluateSession(session(almostMaxAged, 0), limits(), true, NOW),
        ).toEqual({
            action: 'continue',
            shouldRenew: true,
            expiresInMs: minutesToMilliseconds(5),
        });
    });

    test('a stamp from the future is read as now, not as extra time', () => {
        // clock skew between instances writing to the same session row
        expect(
            evaluateSession(
                session(minutesToMilliseconds(30), -minutesToMilliseconds(5)),
                limits(),
                false,
                NOW,
            ),
        ).toEqual({
            action: 'continue',
            shouldRenew: false,
            expiresInMs: IDLE,
        });
    });

    test('a login stamp from the future does not buy extra max age', () => {
        expect(
            evaluateSession(
                { authenticatedAt: ago(-minutesToMilliseconds(30)) },
                limits({ idleTimeoutMs: 0 }),
                false,
                NOW,
            ),
        ).toEqual({
            action: 'continue',
            shouldRenew: false,
            expiresInMs: MAX_AGE,
        });
    });

    test('no request can renew a session already past its idle window', () => {
        expect(
            evaluateSession(
                session(hoursToMilliseconds(1), minutesToMilliseconds(59)),
                limits(),
                true,
                NOW,
            ),
        ).toEqual({ action: 'end', reason: 'idle' });
    });
});

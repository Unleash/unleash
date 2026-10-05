import type { SessionData } from 'express-session';
import type { ISessionLimits } from './session-limits.js';

export type SessionTimeoutReason = 'idled' | 'max-aged' | 'unknown-start';

export type SessionVerdict =
    | { action: 'end'; reason: SessionTimeoutReason }
    | { action: 'continue'; shouldRenew: boolean; expiresInMs: number };

const parse = (value: string | undefined): number | undefined => {
    if (!value) return undefined;

    const ms = Date.parse(value);
    return Number.isFinite(ms) ? ms : undefined;
};

export const evaluateSession = (
    session: Pick<SessionData, 'authenticatedAt' | 'lastInteractionAt'>,
    { hardMaxAgeMs, idleTimeoutMs }: ISessionLimits,
    isUserActivity: boolean,
    now: number,
): SessionVerdict => {
    const startedAt = parse(session.authenticatedAt);

    if (startedAt === undefined) {
        // a session started before timeouts shipped or session broken -> end it
        return { action: 'end', reason: 'unknown-start' };
    }

    // cap in case of fast clocks
    const authenticatedAt = Math.min(startedAt, now);

    if (now >= authenticatedAt + hardMaxAgeMs) {
        return { action: 'end', reason: 'max-aged' };
    }

    const absoluteExpiresInMs = authenticatedAt + hardMaxAgeMs - now;

    if (idleTimeoutMs <= 0) {
        return {
            action: 'continue',
            shouldRenew: false,
            expiresInMs: absoluteExpiresInMs,
        };
    }

    const idleSince = Math.min(
        parse(session.lastInteractionAt) ?? authenticatedAt,
        now, // cap it at 'now' - for any fast clock that can sit in the future
    );

    if (now >= idleSince + idleTimeoutMs) {
        return { action: 'end', reason: 'idled' };
    }

    // renewing restarts the idle window, so the deadline moves with it
    const idleExpiresInMs = isUserActivity
        ? idleTimeoutMs
        : idleSince + idleTimeoutMs - now;

    return {
        action: 'continue',
        shouldRenew: isUserActivity,
        expiresInMs: Math.min(absoluteExpiresInMs, idleExpiresInMs),
    };
};

import type { SessionData } from 'express-session';
import type { ISessionLimits } from './session-limits.js';

export type SessionTimeoutReason = 'idled' | 'max-aged' | 'unknown-start';

export type SessionVerdict =
    | { action: 'end'; reason: SessionTimeoutReason }
    | { action: 'continue'; shouldRenew: boolean };

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
    const authenticatedAt = parse(session.authenticatedAt);

    if (authenticatedAt === undefined) {
        // a session started before timeouts shipped or session broken -> end it
        return { action: 'end', reason: 'unknown-start' };
    }

    if (now >= authenticatedAt + hardMaxAgeMs) {
        return { action: 'end', reason: 'max-aged' };
    }

    if (idleTimeoutMs <= 0) {
        return { action: 'continue', shouldRenew: false };
    }

    // a session with no recorded activity would otherwise never go idle, so the
    // login time stands in for it.
    const idleSince = parse(session.lastInteractionAt) ?? authenticatedAt;

    if (now >= idleSince + idleTimeoutMs) {
        return { action: 'end', reason: 'idled' };
    }

    return { action: 'continue', shouldRenew: isUserActivity };
};

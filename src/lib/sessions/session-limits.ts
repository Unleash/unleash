import { hoursToMilliseconds, minutesToMilliseconds } from 'date-fns';

import type { ISessionOption } from '../types/option.js';

export const DEFAULT_SESSION_TTL_HOURS = 48;

export interface ISessionLimits {
    hardMaxAgeMs: number;
    idleTimeoutMs: number;
}

type SessionLimitsInput = Pick<
    ISessionOption,
    'ttlHours' | 'idleTimeoutMinutes'
>;

const positiveMs = (value: number, toMs: (n: number) => number): number => {
    const ms = toMs(value);
    return Number.isFinite(ms) && ms > 0 ? ms : 0;
};

export const resolveSessionLimits = (
    session: SessionLimitsInput,
): ISessionLimits => {
    const configuredMaxAgeMs = positiveMs(
        session.ttlHours,
        hoursToMilliseconds,
    );

    return {
        // if TTL is missing or invalid, use the default instead of 0.
        // express-session treats maxAge: 0 as "expired" (only null means "no limit").
        // to save from any typo in the config that would lock users out.
        hardMaxAgeMs:
            configuredMaxAgeMs > 0
                ? configuredMaxAgeMs
                : hoursToMilliseconds(DEFAULT_SESSION_TTL_HOURS),
        // `0` means off, so nothing to fall back to
        idleTimeoutMs: positiveMs(
            session.idleTimeoutMinutes,
            minutesToMilliseconds,
        ),
    };
};

import type { FlagEventImpact } from './computeFlagEventImpact';

// Anything below this magnitude is rounded down to "flat" — used for both the
// row tone and the small-change disclosure in Top Movers. Centralised so the
// row, dialog, and pill tooltip all agree on what counts as movement.
export const SMALL_CHANGE_THRESHOLD_PCT = 1;

export type Tone = 'up' | 'down' | 'flat';

// Maps a Δ% to a directional tone, treating sub-threshold magnitudes as flat
// regardless of sign. Null Δ% → flat (nothing measurable to colour).
export const toneOf = (impact: FlagEventImpact): Tone => {
    if (
        impact.deltaPct === null ||
        Math.abs(impact.deltaPct) < SMALL_CHANGE_THRESHOLD_PCT
    ) {
        return 'flat';
    }
    return impact.deltaAbs! > 0 ? 'up' : 'down';
};

// "+85%" or "−12%" — unicode minus so it lines up with the formatAbs sign.
export const formatPct = (pct: number): string => {
    const sign = pct > 0 ? '+' : '\u2212';
    const abs = Math.abs(pct);
    const formatted =
        abs >= 10 || Number.isInteger(abs)
            ? `${Math.round(abs)}`
            : abs.toFixed(1);
    return `${sign}${formatted}%`;
};

// Human-readable rendering of the half-window length used in the comparison.
export const formatHalfWindow = (halfWindowMs: number): string => {
    const minutes = Math.round(halfWindowMs / (60 * 1000));
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.round(halfWindowMs / (60 * 60 * 1000));
    if (hours < 24) return `${hours}h`;
    const days = Math.round(halfWindowMs / (24 * 60 * 60 * 1000));
    return `${days}d`;
};

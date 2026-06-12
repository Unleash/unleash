// "+85%" or "−12%" — unicode minus so the signs render at equal width.
export const formatPct = (pct: number): string => {
    const sign = pct > 0 ? '+' : '−';
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

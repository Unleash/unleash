// Signed percentage for impact-views panels: "+85%" / "−12%" (unicode minus so
// the signs render at equal width). Whole numbers for magnitudes of 10 or more
// (and for integers); one decimal for smaller non-integer magnitudes.
export const formatPct = (pct: number): string => {
    const sign = pct > 0 ? '+' : pct < 0 ? '−' : '';
    const abs = Math.abs(pct);
    const formatted =
        abs >= 10 || Number.isInteger(abs)
            ? `${Math.round(abs)}`
            : abs.toFixed(1);
    return `${sign}${formatted}%`;
};

export const formatHalfWindow = (halfWindowMs: number): string => {
    const minutes = Math.round(halfWindowMs / (60 * 1000));
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.round(halfWindowMs / (60 * 60 * 1000));
    if (hours < 24) return `${hours}h`;
    const days = Math.round(halfWindowMs / (24 * 60 * 60 * 1000));
    return `${days}d`;
};

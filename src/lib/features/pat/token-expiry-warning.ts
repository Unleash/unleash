import { differenceInCalendarDays } from 'date-fns';

export type TokenExpiryWarning = 'expires-soon' | 'expired' | undefined;

export const getTokenExpiryWarning = ({
    createdAt,
    expiresAt,
    leadTimeDays,
    now,
}: {
    createdAt: Date;
    expiresAt: Date;
    leadTimeDays: number[];
    now: Date;
}): TokenExpiryWarning => {
    if (expiresAt <= now) {
        return 'expired';
    }

    // calendar-day granularity matches the expiry notification emails' SQL
    // (expires_at::date - current_date), so an email is never sent while this
    // classifier stays silent; this relies on Node and the database both
    // running in UTC (TZ=UTC in the start scripts), or their days would
    // bucket differently around midnight
    const daysUntilExpiry = differenceInCalendarDays(expiresAt, now);

    // warn only in the second half of a token's life (elapsed >= remaining):
    // someone who just created a short-lived token still remembers its expiry
    const daysSinceCreation = differenceInCalendarDays(now, createdAt);
    if (daysSinceCreation < daysUntilExpiry) {
        return undefined;
    }

    return leadTimeDays.some((days) => daysUntilExpiry <= days)
        ? 'expires-soon'
        : undefined;
};

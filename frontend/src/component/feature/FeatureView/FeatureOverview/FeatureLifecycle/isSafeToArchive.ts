import { isBefore, parseISO, subDays } from 'date-fns';

// no metrics received in this period
const SAFE_TO_ARCHIVE_DAYS = 2;

export function isSafeToArchive(
    environments: Array<{ name: string; lastSeenAt: string }>,
) {
    const daysAgo = subDays(new Date(), SAFE_TO_ARCHIVE_DAYS);

    return environments.every((env) => {
        const lastSeenDate = parseISO(env.lastSeenAt);

        return isBefore(lastSeenDate, daysAgo);
    });
}

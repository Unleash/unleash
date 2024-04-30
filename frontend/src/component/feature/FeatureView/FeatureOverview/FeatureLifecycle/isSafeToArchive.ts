import { isBefore, parseISO, subDays } from 'date-fns';

export function isSafeToArchive(
    environments: Array<{ name: string; lastSeenAt: string }>,
) {
    const twoDaysAgo = subDays(new Date(), 2);

    return environments.every((env) => {
        const lastSeenDate = parseISO(env.lastSeenAt);

        return isBefore(lastSeenDate, twoDaysAgo);
    });
}

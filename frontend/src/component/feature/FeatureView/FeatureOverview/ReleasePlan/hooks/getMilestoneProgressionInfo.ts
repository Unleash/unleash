import { addMinutes, differenceInMinutes, formatDistance } from 'date-fns';
import { formatDateYMDHM } from 'utils/formatDate.ts';

export const getMilestoneProgressionInfo = (
    intervalMinutes: number,
    sourceMilestoneStartedAt: string | null | undefined,
    locale: string,
    isPaused: boolean = false,
    currentTime: Date = new Date(),
): string | null => {
    if (!sourceMilestoneStartedAt) {
        return null;
    }

    if (isPaused) {
        return null;
    }

    const startDate = new Date(sourceMilestoneStartedAt);
    const elapsedMinutes = differenceInMinutes(currentTime, startDate);
    const proceedDate = addMinutes(startDate, intervalMinutes);

    if (elapsedMinutes >= intervalMinutes) {
        const elapsedTime = formatDistance(startDate, currentTime, {
            addSuffix: false,
        });
        return `Already ${elapsedTime} in this milestone.`;
    }

    const proceedTime = formatDateYMDHM(proceedDate, locale);
    const remainingTime = formatDistance(proceedDate, currentTime, {
        addSuffix: false,
    });
    return `Will proceed at ${proceedTime} (in ${remainingTime}).`;
};

export default getMilestoneProgressionInfo;

import { batchData } from '../batchData.ts';
import type { BatchedWeekData, WeekData } from './types.ts';

export const batchCreationArchiveData = batchData(
    (accumulated: BatchedWeekData, next: WeekData) => {
        accumulated.totalCreatedFlags += next.totalCreatedFlags;
        accumulated.archivedFlags += next.archivedFlags;

        accumulated.archivePercentage =
            accumulated.totalCreatedFlags > 0
                ? (accumulated.archivedFlags / accumulated.totalCreatedFlags) *
                  100
                : 0;

        accumulated.endDate = next.date;
        return accumulated;
    },
    (item: WeekData) => {
        const { week: _, ...shared } = item;

        return {
            ...shared,
            endDate: item.date,
        };
    },
);

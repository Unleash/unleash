import type { BatchedWeekData, WeekData } from './types.ts';

const batchSize = 4;

export const batchWeekData = (weeks: WeekData[]): BatchedWeekData[] =>
    weeks.reduce((acc, curr, index) => {
        const currentAggregatedIndex = Math.floor(index / batchSize);

        const data = acc[currentAggregatedIndex];

        if (data) {
            data.totalCreatedFlags += curr.totalCreatedFlags;
            data.archivedFlags += curr.archivedFlags;

            data.archivePercentage =
                data.totalCreatedFlags > 0
                    ? (data.archivedFlags / data.totalCreatedFlags) * 100
                    : 0;

            data.endDate = curr.date;
        } else {
            const { week: _, ...shared } = curr;
            acc[currentAggregatedIndex] = {
                ...shared,
                endDate: curr.date,
            };
        }
        return acc;
    }, [] as BatchedWeekData[]);

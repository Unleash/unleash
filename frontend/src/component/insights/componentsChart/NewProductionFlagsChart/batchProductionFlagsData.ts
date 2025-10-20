import { batchData } from '../batchData.ts';
import type { BatchedWeekData, WeekData } from './types.ts';

const batchArgs = (batchSize?: number) => ({
    merge: (accumulated: BatchedWeekData, next: WeekData) => {
        if (next.newProductionFlags)
            accumulated.newProductionFlags =
                (accumulated.newProductionFlags ?? 0) + next.newProductionFlags;
        if (next.date) {
            if (!accumulated.date) {
                accumulated.date = next.date;
            }
            accumulated.endDate = next.date;
        }

        return accumulated;
    },
    map: (item: WeekData) => {
        return {
            ...item,
            endDate: item.date,
        };
    },
    batchSize,
});

export const batchProductionFlagsData = (
    data: WeekData[],
    batchSize?: number,
): BatchedWeekData[] => batchData(batchArgs(batchSize))(data);

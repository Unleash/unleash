import { batchData } from '../batchData.ts';
import type { BatchedWeekData, WeekData } from './types.ts';

export const batchProductionFlagsData = batchData({
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
        const { week: _, ...shared } = item;

        return {
            ...shared,
            endDate: item.date,
        };
    },
});

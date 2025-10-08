import { batchData } from '../batchData.ts';
import type { BatchedWeekData, WeekData } from './types.ts';

export const batchProductionFlagsData = batchData(
    (accumulated: BatchedWeekData, next: WeekData) => {
        accumulated.newProductionFlags += next.newProductionFlags;
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

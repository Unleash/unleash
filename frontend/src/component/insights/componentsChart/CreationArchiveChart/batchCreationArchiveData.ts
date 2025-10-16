import { batchData } from '../batchData.ts';
import type {
    BatchedWeekData,
    BatchedEmptyWeekData,
    FinalizedWeekData,
    BatchedWeekDataWithRatio,
} from './types.ts';

export const batchCreationArchiveData = batchData({
    merge: (accumulated: BatchedWeekData, next: FinalizedWeekData) => {
        if (next.state === 'empty') {
            return {
                ...accumulated,
                endDate: next.date,
            } as BatchedEmptyWeekData;
        }

        switch (accumulated.state) {
            case 'empty':
                return {
                    ...accumulated,
                    state: 'withRatio',
                    totalCreatedFlags: next.totalCreatedFlags,
                    archivedFlags: next.archivedFlags,
                    archivePercentage: next.archivePercentage,
                    endDate: next.date,
                } as BatchedWeekDataWithRatio;

            case 'withRatio': {
                const totalCreatedFlags =
                    accumulated.totalCreatedFlags + next.totalCreatedFlags;
                const archivedFlags =
                    accumulated.archivedFlags + next.archivedFlags;
                const archivePercentage =
                    totalCreatedFlags > 0
                        ? (archivedFlags / totalCreatedFlags) * 100
                        : 0;
                return {
                    ...accumulated,
                    endDate: next.date,
                    totalCreatedFlags,
                    archivedFlags,
                    archivePercentage,
                } as BatchedWeekDataWithRatio;
            }
        }
    },
    map: (item: FinalizedWeekData) => {
        const { week: _, ...shared } = item;

        return {
            ...shared,
            endDate: item.date,
        };
    },
});

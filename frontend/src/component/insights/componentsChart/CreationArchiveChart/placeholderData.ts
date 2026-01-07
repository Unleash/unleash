import type { ChartData } from 'chart.js';
import type { FinalizedWeekData } from './types.ts';

const data = [
    {
        archivedFlags: 3,
        totalCreatedFlags: 4,
        archivePercentage: 75,
        week: '2025-30',
        date: '2025-07-27T01:00:00.000Z',
    },
    {
        archivedFlags: 7,
        totalCreatedFlags: 3,
        archivePercentage: 140,
        week: '2025-31',
        date: '2025-08-03T01:00:00.000Z',
    },
    {
        archivedFlags: 2,
        totalCreatedFlags: 3,
        archivePercentage: 50,
        week: '2025-32',
        date: '2025-08-10T01:00:00.000Z',
    },
    {
        archivedFlags: 2,
        totalCreatedFlags: 6,
        archivePercentage: 25,
        week: '2025-33',
        date: '2025-08-17T00:40:40.606Z',
    },
    {
        archivedFlags: 4,
        totalCreatedFlags: 9,
        archivePercentage: 66.66666666666666,
        week: '2025-34',
        date: '2025-08-24T00:29:19.583Z',
    },
];

export const placeholderData: ChartData<any, FinalizedWeekData[]> = {
    datasets: [
        {
            label: 'Flags archived',
            data,
            parsing: {
                yAxisKey: 'archivedFlags',
                xAxisKey: 'date',
            },
            order: 1,
        },
        {
            label: 'Flags created',
            data,
            parsing: {
                yAxisKey: 'totalCreatedFlags',
                xAxisKey: 'date',
            },
            order: 2,
        },
    ],
};

import { batchWeekData } from './batchWeekData.ts';

it('handles empty input', () => {
    expect(batchWeekData([])).toEqual([]);
});

it('handles a single data point', () => {
    const input = {
        archivedFlags: 5,
        totalCreatedFlags: 1,
        archivePercentage: 500,
        week: '50',
        date: '2022-01-01',
    };
    expect(batchWeekData([input])).toStrictEqual([
        {
            archivedFlags: 5,
            totalCreatedFlags: 1,
            archivePercentage: 500,
            date: input.date,
            endDate: input.date,
        },
    ]);
});
it('batches by 4, starting from the first entry', () => {
    const input = [
        {
            archivedFlags: 1,
            totalCreatedFlags: 1,
            archivePercentage: 100,
            week: '50',
            date: '2022-01-01',
        },
        {
            archivedFlags: 5,
            totalCreatedFlags: 1,
            archivePercentage: 500,
            week: '50',
            date: '2022-02-02',
        },
        {
            archivedFlags: 3,
            totalCreatedFlags: 0,
            archivePercentage: 0,
            week: '50',
            date: '2022-03-03',
        },
        {
            archivedFlags: 3,
            totalCreatedFlags: 4,
            archivePercentage: 75,
            week: '50',
            date: '2022-04-04',
        },
        {
            archivedFlags: 3,
            totalCreatedFlags: 2,
            archivePercentage: 150,
            week: '50',
            date: '2022-05-05',
        },
    ];
    expect(batchWeekData(input)).toStrictEqual([
        {
            archivedFlags: 12,
            totalCreatedFlags: 6,
            archivePercentage: 200,
            date: '2022-01-01',
            endDate: '2022-04-04',
        },
        {
            archivedFlags: 3,
            totalCreatedFlags: 2,
            archivePercentage: 150,
            date: '2022-05-05',
            endDate: '2022-05-05',
        },
    ]);
});

import { batchCreationArchiveData } from './batchCreationArchiveData.ts';

it('handles a single data point', () => {
    const input = {
        state: 'withRatio' as const,
        archivedFlags: 5,
        totalCreatedFlags: 1,
        archivePercentage: 500,
        week: '50',
        date: '2022-01-01',
    };
    expect(batchCreationArchiveData([input])).toStrictEqual([
        {
            state: 'withRatio',
            archivedFlags: 5,
            totalCreatedFlags: 1,
            archivePercentage: 500,
            date: input.date,
            endDate: input.date,
        },
    ]);
});

it('adds data in the expected way', () => {
    const input = [
        {
            state: 'withRatio' as const,
            archivedFlags: 5,
            totalCreatedFlags: 1,
            archivePercentage: 500,
            week: '50',
            date: '2022-01-01',
        },
        {
            state: 'withRatio' as const,
            archivedFlags: 3,
            totalCreatedFlags: 3,
            archivePercentage: 150,
            week: '51',
            date: '2022-02-01',
        },
    ];
    expect(batchCreationArchiveData(input)).toStrictEqual([
        {
            state: 'withRatio',
            archivedFlags: 8,
            totalCreatedFlags: 4,
            archivePercentage: 200,
            date: '2022-01-01',
            endDate: '2022-02-01',
        },
    ]);
});

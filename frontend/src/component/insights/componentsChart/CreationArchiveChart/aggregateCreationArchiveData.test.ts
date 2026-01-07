import { aggregateCreationArchiveData } from './aggregateCreationArchiveData.ts';

it('yields empty weeks as `state: empty`', () => {
    const week = { week: '2025-12', date: '2025-03-12' };
    const input = [];

    const result = aggregateCreationArchiveData([week], input);
    expect(result).toMatchObject([
        { week: week.week, date: week.date, state: 'empty' },
    ]);
});
it('yields weeks with data as `state: populated`', () => {
    const week = { week: '2025-12', date: '2025-03-12' };
    const input = [
        {
            data: [
                {
                    week: week.week,
                    date: week.date,
                    archivedFlags: 5,
                    createdFlags: { release: 7, other: 13 },
                },
            ],
        },
    ];

    const result = aggregateCreationArchiveData([week], input);
    expect(result).toMatchObject([
        {
            week: week.week,
            date: week.date,
            state: 'withRatio',
            archivedFlags: 5,
            totalCreatedFlags: 20,
            archivePercentage: 25,
        },
    ]);
});

it('combines data from all data sets for a specified week', () => {
    const week = { week: '2025-12', date: '2025-03-12' };
    const input = [
        {
            data: [
                {
                    week: week.week,
                    date: week.date,
                    archivedFlags: 5,
                    createdFlags: { release: 7, other: 13 },
                },
            ],
        },
        {
            data: [
                {
                    week: week.week,
                    date: week.date,
                    archivedFlags: 2,
                    createdFlags: { release: 0, other: 8 },
                },
            ],
        },
    ];

    const result = aggregateCreationArchiveData([week], input);
    expect(result).toStrictEqual([
        {
            week: week.week,
            date: week.date,
            state: 'withRatio',
            archivedFlags: 7,
            totalCreatedFlags: 28,
            archivePercentage: 25,
        },
    ]);
});

it('handles scenarios with empty, combined, and single-project data', () => {
    const firstWeek = { week: '2025-11', date: '2025-03-05' };
    const secondWeek = { week: '2025-12', date: '2025-03-12' };
    const thirdWeek = { week: '2025-13', date: '2025-03-19' };
    const input = [
        {
            data: [
                {
                    week: secondWeek.week,
                    date: secondWeek.date,
                    archivedFlags: 5,
                    createdFlags: { release: 7, other: 13 },
                },

                {
                    week: firstWeek.week,
                    date: firstWeek.date,
                    archivedFlags: 3,
                    createdFlags: { release: 1, other: 0 },
                },
            ],
        },
        {
            data: [
                {
                    week: secondWeek.week,
                    date: secondWeek.date,
                    archivedFlags: 2,
                    createdFlags: { release: 0, other: 8 },
                },
            ],
        },
    ];

    const result = aggregateCreationArchiveData(
        [firstWeek, secondWeek, thirdWeek],
        input,
    );
    expect(result).toStrictEqual([
        {
            week: firstWeek.week,
            date: firstWeek.date,
            state: 'withRatio',
            archivedFlags: 3,
            totalCreatedFlags: 1,
            archivePercentage: 300,
        },
        {
            week: secondWeek.week,
            date: secondWeek.date,
            state: 'withRatio',
            archivedFlags: 7,
            totalCreatedFlags: 28,
            archivePercentage: 25,
        },
        {
            week: thirdWeek.week,
            date: thirdWeek.date,
            state: 'empty',
        },
    ]);
});

it("ignores data that doesn't have a week in the week set", () => {
    const week = { week: '2025-12', date: '2025-03-12' };
    const input = [
        {
            data: [
                {
                    week: '2025-13',
                    date: '2025-03-19',
                    archivedFlags: 5,
                    createdFlags: { release: 7, other: 13 },
                },
            ],
        },
    ];

    const result = aggregateCreationArchiveData([week], input);
    expect(result).toMatchObject([
        {
            state: 'empty',
            week: week.week,
            date: week.date,
        },
    ]);
});

import {
    type ChartDataSelection,
    toDateRange,
} from './chart-data-selection.js';

test('daily conversion', () => {
    const input: ChartDataSelection = {
        grouping: 'daily',
        month: '2021-03',
    };

    const expectedOutput = {
        from: '2021-03-01',
        to: '2021-03-31',
    };

    expect(toDateRange(input)).toStrictEqual(expectedOutput);
});

test('monthly conversion', () => {
    const now = new Date('2023-06-15');
    const input: ChartDataSelection = {
        grouping: 'monthly',
        monthsBack: 3,
    };

    const expectedOutput = {
        from: '2023-03-01',
        to: '2023-06-30',
    };

    expect(toDateRange(input, now)).toStrictEqual(expectedOutput);
});

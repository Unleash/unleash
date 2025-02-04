import { generateSelectablePeriodsFromDate } from './selectable-periods';

test('marks months before May 2024 as unselectable', () => {
    const now = new Date('2025-01-01');
    const selectablePeriods = generateSelectablePeriodsFromDate(now);

    expect(
        selectablePeriods.map(({ key, selectable }) => ({ key, selectable })),
    ).toEqual([
        { key: '2025-01', selectable: true },
        { key: '2024-12', selectable: true },
        { key: '2024-11', selectable: true },
        { key: '2024-10', selectable: true },
        { key: '2024-09', selectable: true },
        { key: '2024-08', selectable: true },
        { key: '2024-07', selectable: true },
        { key: '2024-06', selectable: true },
        { key: '2024-05', selectable: true },
        { key: '2024-04', selectable: false },
        { key: '2024-03', selectable: false },
        { key: '2024-02', selectable: false },
    ]);
});

test('generates 12 months, including the current month', () => {
    const now = new Date('2025-01-01');
    const selectablePeriods = generateSelectablePeriodsFromDate(now);

    expect(selectablePeriods).toEqual([
        {
            dayCount: 31,
            key: '2025-01',
            label: 'Current month',
            month: 0,
            selectable: true,
            shortLabel: 'Jan',
            year: 2025,
        },
        {
            dayCount: 31,
            key: '2024-12',
            label: 'December 2024',
            month: 11,
            selectable: true,
            shortLabel: 'Dec',
            year: 2024,
        },
        {
            dayCount: 30,
            key: '2024-11',
            label: 'November 2024',
            month: 10,
            selectable: true,
            shortLabel: 'Nov',
            year: 2024,
        },
        {
            dayCount: 31,
            key: '2024-10',
            label: 'October 2024',
            month: 9,
            selectable: true,
            shortLabel: 'Oct',
            year: 2024,
        },
        {
            dayCount: 30,
            key: '2024-09',
            label: 'September 2024',
            month: 8,
            selectable: true,
            shortLabel: 'Sep',
            year: 2024,
        },
        {
            dayCount: 31,
            key: '2024-08',
            label: 'August 2024',
            month: 7,
            selectable: true,
            shortLabel: 'Aug',
            year: 2024,
        },
        {
            dayCount: 31,
            key: '2024-07',
            label: 'July 2024',
            month: 6,
            selectable: true,
            shortLabel: 'Jul',
            year: 2024,
        },
        {
            dayCount: 30,
            key: '2024-06',
            label: 'June 2024',
            month: 5,
            selectable: true,
            shortLabel: 'Jun',
            year: 2024,
        },
        {
            dayCount: 31,
            key: '2024-05',
            label: 'May 2024',
            month: 4,
            selectable: true,
            shortLabel: 'May',
            year: 2024,
        },
        {
            dayCount: 30,
            key: '2024-04',
            label: 'April 2024',
            month: 3,
            selectable: false,
            shortLabel: 'Apr',
            year: 2024,
        },
        {
            dayCount: 31,
            key: '2024-03',
            label: 'March 2024',
            month: 2,
            selectable: false,
            shortLabel: 'Mar',
            year: 2024,
        },
        {
            dayCount: 29,
            key: '2024-02',
            label: 'February 2024',
            month: 1,
            selectable: false,
            shortLabel: 'Feb',
            year: 2024,
        },
    ]);
});

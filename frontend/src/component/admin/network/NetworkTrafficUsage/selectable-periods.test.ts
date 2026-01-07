import { generateSelectablePeriodsFromDate } from './selectable-periods.js';

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

    expect(selectablePeriods.length).toBe(12);
    expect(selectablePeriods[0].label).toBe('Current month');
});

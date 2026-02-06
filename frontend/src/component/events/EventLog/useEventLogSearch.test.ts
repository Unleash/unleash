import {
    calculatePaginationInfo,
    handleDateAdjustment,
} from './useEventLogSearch.js';

test.each([
    [{ offset: 5, pageSize: 2 }, { currentPage: 2 }],
    [{ offset: 6, pageSize: 2 }, { currentPage: 3 }],
])('it calculates currentPage correctly', (input, output) => {
    const result = calculatePaginationInfo(input);
    expect(result).toMatchObject(output);
});

test("it doesn't try to divide by zero", () => {
    const result = calculatePaginationInfo({ offset: 0, pageSize: 0 });

    expect(result.currentPage).not.toBeNaN();
});

test('it calculates the correct offsets', () => {
    const result = calculatePaginationInfo({ offset: 50, pageSize: 25 });

    expect(result).toMatchObject({
        currentPage: 2,
        nextPageOffset: 75,
        previousPageOffset: 25,
    });
});

test(`it "fixes" offsets if you've set a weird offset`, () => {
    const result = calculatePaginationInfo({ offset: 35, pageSize: 25 });

    expect(result).toMatchObject({
        currentPage: 1,
        nextPageOffset: 50,
        previousPageOffset: 0,
    });
});

describe('setState date handling', () => {
    const dateFilterItem = (date: string) => ({
        operator: ['IS'],
        values: [date],
    });

    test('setting a from-date after the to-date adjusts the to-date to match', () => {
        const oldState = {
            from: dateFilterItem('2022-01-01'),
            to: dateFilterItem('2023-01-01'),
        };
        const stateUpdate = { from: dateFilterItem('2024-01-01') };

        const updateResult = handleDateAdjustment(oldState, stateUpdate);
        expect(updateResult).toMatchObject({
            from: dateFilterItem('2024-01-01'),
            to: dateFilterItem('2024-01-01'),
        });
    });

    test('setting a to-date before the from-date adjusts the from-date to match', () => {
        const oldState = {
            from: dateFilterItem('2022-01-01'),
            to: dateFilterItem('2023-01-01'),
        };
        const stateUpdate = { to: dateFilterItem('2021-01-01') };

        const updateResult = handleDateAdjustment(oldState, stateUpdate);
        expect(updateResult).toMatchObject({
            from: dateFilterItem('2021-01-01'),
            to: dateFilterItem('2021-01-01'),
        });
    });

    test('if both values are set in one, there is no change -- even if the values should have been switched', () => {
        const oldState = {
            from: dateFilterItem('2022-01-01'),
            to: dateFilterItem('2023-01-01'),
        };
        const stateUpdate = {
            from: dateFilterItem('2025-01-01'),
            to: dateFilterItem('2024-01-01'),
        };

        const updateResult = handleDateAdjustment(oldState, stateUpdate);
        expect(updateResult).toStrictEqual(stateUpdate);
    });

    test('non-date params are not affected', () => {
        const oldState = {
            from: dateFilterItem('2022-01-01'),
            to: dateFilterItem('2023-01-01'),
        };

        const stateUpdate = {
            createdBy: { operator: ['IS'], values: ['user1'] },
        };
        const updateResult = handleDateAdjustment(oldState, stateUpdate);
        expect(updateResult).toStrictEqual(stateUpdate);
    });
});

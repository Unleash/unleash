import { autocorrectDateRange } from './autocorrectDateRange';

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

        const updateResult = autocorrectDateRange(oldState, stateUpdate);
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

        const updateResult = autocorrectDateRange(oldState, stateUpdate);
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

        const updateResult = autocorrectDateRange(oldState, stateUpdate);
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
        const updateResult = autocorrectDateRange(oldState, stateUpdate);
        expect(updateResult).toStrictEqual(stateUpdate);
    });

    test('custom keys are respected when provided', () => {
        const oldState = {
            from: dateFilterItem('2022-01-01'),
            to: dateFilterItem('2023-01-01'),
            'prefix-from': dateFilterItem('2022-01-01'),
            'prefix-to': dateFilterItem('2023-01-01'),
        };
        const stateUpdate = { 'prefix-from': dateFilterItem('2024-01-01') };

        const updateResult = autocorrectDateRange(oldState, stateUpdate, {
            fromKey: 'prefix-from',
            toKey: 'prefix-to',
        });
        expect(updateResult).toMatchObject({
            'prefix-from': dateFilterItem('2024-01-01'),
            'prefix-to': dateFilterItem('2024-01-01'),
        });
    });
});

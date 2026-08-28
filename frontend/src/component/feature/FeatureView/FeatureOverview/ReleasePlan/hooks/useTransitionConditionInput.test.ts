import { act, renderHook } from '@testing-library/react';
import type { SelectChangeEvent } from '@mui/material';
import { expect, test, vi } from 'vitest';
import { useTransitionConditionInput } from './useTransitionConditionInput.ts';

const valueChange = (value: string) =>
    ({ target: { value } }) as React.ChangeEvent<HTMLInputElement>;

const unitChange = (unit: string) =>
    ({ target: { value: unit } }) as SelectChangeEvent<unknown>;

const TWO_DAYS_IN_MINUTES = 2880;

test('seeds the inputs from stored minutes', () => {
    const { result } = renderHook(() =>
        useTransitionConditionInput(TWO_DAYS_IN_MINUTES),
    );

    expect(result.current).toMatchObject({ timeValue: 2, timeUnit: 'days' });
});

test('defaults to five hours', () => {
    const { result } = renderHook(() => useTransitionConditionInput());

    expect(result.current).toMatchObject({
        timeValue: 5,
        timeUnit: 'hours',
        intervalMinutes: 300,
    });
});

test('reports the interval in minutes on value and unit changes', () => {
    const onIntervalChange = vi.fn();
    const { result } = renderHook(() =>
        useTransitionConditionInput(300, onIntervalChange),
    );

    act(() => result.current.handleTimeValueChange(valueChange('2')));
    act(() => result.current.handleTimeUnitChange(unitChange('days')));

    expect(onIntervalChange.mock.calls).toEqual([[120], [TWO_DAYS_IN_MINUTES]]);
});

test('clamps the value to the maximum', () => {
    const { result } = renderHook(() => useTransitionConditionInput(300));

    act(() => result.current.handleTimeValueChange(valueChange('99999')));

    expect(result.current.timeValue).toBe(10000);
});

import { act, renderHook } from '@testing-library/react';
import type { SelectChangeEvent } from '@mui/material';
import { expect, test, vi } from 'vitest';
import { useTransitionConditionInput } from './useTransitionConditionInput.ts';

const valueChange = (value: string) =>
    ({ target: { value } }) as React.ChangeEvent<HTMLInputElement>;

const unitChange = (unit: string) =>
    ({ target: { value: unit } }) as SelectChangeEvent<unknown>;

const TWO_DAYS_IN_MINUTES = 2880;

test('seeds the inputs from a stored time condition', () => {
    const { result } = renderHook(() =>
        useTransitionConditionInput({ intervalMinutes: TWO_DAYS_IN_MINUTES }),
    );

    expect(result.current).toMatchObject({ value: 2, unit: 'days' });
});

test('seeds the inputs from a stored exposure condition', () => {
    const { result } = renderHook(() =>
        useTransitionConditionInput({
            type: 'exposure',
            minimumExposures: 1000,
        }),
    );

    expect(result.current).toMatchObject({ value: 1000, unit: 'exposures' });
});

test('defaults to five hours', () => {
    const { result } = renderHook(() => useTransitionConditionInput());

    expect(result.current).toMatchObject({
        value: 5,
        unit: 'hours',
        condition: { intervalMinutes: 300 },
    });
});

test('reports the condition on value and unit changes', () => {
    const onConditionChange = vi.fn();
    const { result } = renderHook(() =>
        useTransitionConditionInput(
            { intervalMinutes: 300 },
            onConditionChange,
        ),
    );

    act(() => result.current.handleValueChange(valueChange('2')));
    act(() => result.current.handleUnitChange(unitChange('days')));
    act(() => result.current.handleUnitChange(unitChange('exposures')));

    expect(onConditionChange.mock.calls).toEqual([
        [{ intervalMinutes: 120 }],
        [{ intervalMinutes: TWO_DAYS_IN_MINUTES }],
        [{ type: 'exposure', minimumExposures: 2 }],
    ]);
});

test('rounds fractional input to the nearest whole number', () => {
    const { result } = renderHook(() =>
        useTransitionConditionInput({ intervalMinutes: 300 }),
    );

    act(() => result.current.handleValueChange(valueChange('2.4')));

    expect(result.current.value).toBe(2);
});

test('clamps the time value to the maximum', () => {
    const { result } = renderHook(() =>
        useTransitionConditionInput({ intervalMinutes: 300 }),
    );

    act(() => result.current.handleValueChange(valueChange('99999')));

    expect(result.current.value).toBe(10000);
});

test('does not clamp exposure values', () => {
    const { result } = renderHook(() =>
        useTransitionConditionInput({ type: 'exposure', minimumExposures: 1 }),
    );

    act(() => result.current.handleValueChange(valueChange('5000000000')));

    expect(result.current.value).toBe(5_000_000_000);
});

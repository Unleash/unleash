import { renderHook, act } from '@testing-library/react';
import { useNumericStringInput } from './useNumericStringInput.js';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { vi } from 'vitest';

const changeEvent = (value: string) =>
    ({ target: { value } }) as ChangeEvent<HTMLInputElement>;

const keyEvent = (key: string) => ({ key }) as KeyboardEvent<HTMLInputElement>;

describe('useNumericStringInput', () => {
    test('initializes with value as string', () => {
        const { result } = renderHook(() => useNumericStringInput(42, vi.fn()));

        expect(result.current.inputValue).toBe('42');
    });

    test('allows empty input during editing', () => {
        const { result } = renderHook(() => useNumericStringInput(10, vi.fn()));

        act(() => result.current.handleInputChange(changeEvent('')));

        expect(result.current.inputValue).toBe('');
    });

    test('commits valid value on blur', () => {
        const onChange = vi.fn();
        const { result } = renderHook(() =>
            useNumericStringInput(10, onChange),
        );

        act(() => result.current.handleInputChange(changeEvent('25')));
        act(() => result.current.handleInputBlur());

        expect(onChange).toHaveBeenCalledWith(25);
    });

    test('resets to original value when empty on blur', () => {
        const onChange = vi.fn();
        const { result } = renderHook(() =>
            useNumericStringInput(10, onChange),
        );

        act(() => result.current.handleInputChange(changeEvent('')));
        act(() => result.current.handleInputBlur());

        expect(onChange).not.toHaveBeenCalled();
        expect(result.current.inputValue).toBe('10');
    });

    test('commits value on Enter key', () => {
        const onChange = vi.fn();
        const { result } = renderHook(() =>
            useNumericStringInput(10, onChange),
        );

        act(() => result.current.handleInputChange(changeEvent('25')));
        act(() => result.current.handleKeyDown(keyEvent('Enter')));

        expect(onChange).toHaveBeenCalledWith(25);
    });

    test('parses as integer when parseMode is integer', () => {
        const onChange = vi.fn();
        const { result } = renderHook(() =>
            useNumericStringInput(10, onChange, { parseMode: 'integer' }),
        );

        act(() => result.current.handleInputChange(changeEvent('25.9')));
        act(() => result.current.handleInputBlur());

        expect(onChange).toHaveBeenCalledWith(25);
    });

    test('calls onEditStart on input change', () => {
        const onEditStart = vi.fn();
        const { result } = renderHook(() =>
            useNumericStringInput(10, vi.fn(), { onEditStart }),
        );

        result.current.handleInputChange(changeEvent('25'));

        expect(onEditStart).toHaveBeenCalled();
    });

    test('syncs with external value changes', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useNumericStringInput(value, vi.fn()),
            { initialProps: { value: 10 } },
        );

        rerender({ value: 20 });

        expect(result.current.inputValue).toBe('20');
    });
});

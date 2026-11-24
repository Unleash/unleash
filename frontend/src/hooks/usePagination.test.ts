import { act, renderHook } from '@testing-library/react';
import { expect, test } from 'vitest';
import usePagination from './usePagination';

test('moves to the last available page when removing its only strategy', () => {
    const strategies = Array.from({ length: 61 }, (_, i) => i + 1);
    const { result, rerender } = renderHook(
        ({ data }) => usePagination(data, 20),
        { initialProps: { data: strategies } },
    );

    act(() => result.current.setPageIndex(3));
    expect(result.current.page).toEqual([61]);

    rerender({ data: strategies.slice(0, -1) });

    expect(result.current.pageIndex).toBe(2);
    expect(result.current.page).toEqual(strategies.slice(40, 60));
});

test('keeps the current page when it still exists after a list update', () => {
    const strategies = Array.from({ length: 61 }, (_, i) => i + 1);
    const { result, rerender } = renderHook(
        ({ data }) => usePagination(data, 20),
        { initialProps: { data: strategies } },
    );

    act(() => result.current.setPageIndex(1));
    rerender({ data: strategies.slice(0, -1) });

    expect(result.current.pageIndex).toBe(1);
    expect(result.current.page).toEqual(strategies.slice(20, 40));
});

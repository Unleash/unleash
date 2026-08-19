import { act, renderHook } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';

beforeEach(() => {
    vi.resetModules();
});

test('preserves the position across an unmount/remount', async () => {
    const { useChecklistDragPosition } = await import(
        './useChecklistDragPosition.ts'
    );
    const first = renderHook(() => useChecklistDragPosition());
    act(() => first.result.current[1]({ x: 42, y: 17 }));
    first.unmount();

    const second = renderHook(() => useChecklistDragPosition());

    expect(second.result.current[0]).toEqual({ x: 42, y: 17 });
});

test('starts at null when nothing has been persisted', async () => {
    const { useChecklistDragPosition } = await import(
        './useChecklistDragPosition.ts'
    );
    const { result } = renderHook(() => useChecklistDragPosition());

    expect(result.current[0]).toBeNull();
});

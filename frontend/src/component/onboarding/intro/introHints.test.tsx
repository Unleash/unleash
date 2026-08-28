import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useIdleHint } from './introHints.tsx';

beforeEach(() => {
    vi.useFakeTimers();
});
afterEach(() => {
    vi.useRealTimers();
});

test('reveals the hint after the idle delay while active', () => {
    const { result } = renderHook(() => useIdleHint(true, 3000));

    expect(result.current[0]).toBe(false);
    act(() => {
        vi.advanceTimersByTime(2999);
    });
    expect(result.current[0]).toBe(false);
    act(() => {
        vi.advanceTimersByTime(1);
    });
    expect(result.current[0]).toBe(true);
});

test('never shows while inactive and hides immediately when active flips off', () => {
    const { result, rerender } = renderHook(
        ({ active }: { active: boolean }) => useIdleHint(active, 3000),
        { initialProps: { active: false } },
    );

    act(() => {
        vi.advanceTimersByTime(10_000);
    });
    expect(result.current[0]).toBe(false);

    rerender({ active: true });
    act(() => {
        vi.advanceTimersByTime(3000);
    });
    expect(result.current[0]).toBe(true);

    rerender({ active: false });
    expect(result.current[0]).toBe(false);
});

test('bump restarts the idle timer so the hint is deferred', () => {
    const { result } = renderHook(() => useIdleHint(true, 3000));

    act(() => {
        vi.advanceTimersByTime(2500);
    });
    act(() => {
        result.current[1]();
    });
    act(() => {
        vi.advanceTimersByTime(2500);
    });
    expect(result.current[0]).toBe(false);
    act(() => {
        vi.advanceTimersByTime(500);
    });
    expect(result.current[0]).toBe(true);
});

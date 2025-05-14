import { useRecentlyUsedSegments } from './useRecentlyUsedSegments.ts';
import { renderHook, act } from '@testing-library/react';

describe('useRecentlyUsedSegments', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    it('should initialize with empty array when no items in localStorage', () => {
        const { result } = renderHook(() => useRecentlyUsedSegments());

        expect(result.current.items).toEqual([]);
    });

    it('should initialize with initial items if provided', () => {
        const initialItems = [1];
        const { result } = renderHook(() =>
            useRecentlyUsedSegments(initialItems),
        );

        expect(result.current.items).toEqual(initialItems);
    });

    it('should add new items to the beginning of the list', () => {
        const { result } = renderHook(() => useRecentlyUsedSegments());

        act(() => {
            result.current.addItem(1);
        });
        expect(result.current.items[0]).toBe(1);

        act(() => {
            result.current.addItem(2);
        });
        expect(result.current.items[0]).toBe(2);
        expect(result.current.items[1]).toBe(1);
    });

    it('should handle array of segment IDs', () => {
        const { result } = renderHook(() => useRecentlyUsedSegments());

        act(() => {
            result.current.addItem([1, 2, 3]);
        });

        expect(result.current.items.length).toBe(3);
        expect(result.current.items[0]).toBe(3);
        expect(result.current.items[1]).toBe(2);
        expect(result.current.items[2]).toBe(1);
    });

    it('should limit stored items to maximum of 3', () => {
        const { result } = renderHook(() => useRecentlyUsedSegments());

        act(() => {
            result.current.addItem(1);
            result.current.addItem(2);
            result.current.addItem(3);
            result.current.addItem(4);
        });

        expect(result.current.items.length).toBe(3);
        expect(result.current.items[0]).toBe(4);
        expect(result.current.items[1]).toBe(3);
        expect(result.current.items[2]).toBe(2);
    });

    it('should not add duplicate segment IDs', () => {
        const { result } = renderHook(() => useRecentlyUsedSegments());

        act(() => {
            result.current.addItem(1);
            result.current.addItem(2);
        });
        expect(result.current.items.length).toBe(2);

        act(() => {
            result.current.addItem(1);
        });

        expect(result.current.items.length).toBe(2);
        expect(result.current.items[0]).toBe(1);
        expect(result.current.items[1]).toBe(2);
    });

    it('should persist items to localStorage', () => {
        const { result } = renderHook(() => useRecentlyUsedSegments());

        act(() => {
            result.current.addItem(1);
        });

        const { result: newResult } = renderHook(() =>
            useRecentlyUsedSegments(),
        );

        expect(newResult.current.items[0]).toBe(1);
    });
});

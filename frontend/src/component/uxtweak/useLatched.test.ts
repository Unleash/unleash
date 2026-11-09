import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLatched } from './useLatched.ts';

type Candidate = { id: number } | null;

describe('useLatched', () => {
    it('keeps the exact first truthy reference through later candidates and re-renders', () => {
        const { result, rerender } = renderHook(
            ({ value }: { value: Candidate }) => useLatched(value),
            { initialProps: { value: null as Candidate } },
        );
        expect(result.current).toBeNull();

        const first = { id: 1 };
        rerender({ value: first });
        expect(result.current).toBe(first);

        rerender({ value: { id: 2 } });
        expect(result.current).toBe(first);

        rerender({ value: null });
        expect(result.current).toBe(first);
    });
});
